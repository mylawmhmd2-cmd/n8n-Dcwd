// Bias Audit & Fairness Interlock
// n8n Code node: Run Once for All Items.

const source = items[0]?.json ?? {};
const policy = source.policy ?? {};
const groups = Array.isArray(source.groups) ? source.groups : [];
const counterfactuals = Array.isArray(source.counterfactual_tests)
  ? source.counterfactual_tests : [];

const auditId = source.audit_id || `audit-${Date.now()}`;
const correlationId = source.correlation_id || auditId;
const riskLevel = String(source.risk_level || 'unknown').toLowerCase();
const now = new Date().toISOString();
const minGroupN = Number(policy.min_group_n ?? 30);
const maxAcceptanceGap = Number(policy.max_acceptance_gap ?? 0.10);
const maxTprGap = Number(policy.max_tpr_gap ?? 0.10);
const maxFprGap = Number(policy.max_fpr_gap ?? 0.10);
const requireCfConsistency = policy.require_counterfactual_consistency !== false;
const highRiskNeedsHuman = policy.high_risk_requires_human_review !== false;

function ratio(numerator, denominator) {
  const n = Number(numerator);
  const d = Number(denominator);
  return Number.isFinite(n) && Number.isFinite(d) && d > 0 ? n / d : null;
}

function gap(values) {
  const usable = values.filter(Number.isFinite);
  return usable.length >= 2 ? Math.max(...usable) - Math.min(...usable) : null;
}

const findings = [];
const metrics = { groups: [], gaps: {} };

if (!source.audit_id || !source.correlation_id || !source.workflow_version || !source.model_id) {
  findings.push({
    code: 'MISSING_TRACE_FIELDS',
    severity: 'critical',
    message: 'تنقص حقول التتبع الأساسية.'
  });
}
if (groups.length < 2) {
  findings.push({
    code: 'INSUFFICIENT_GROUPS',
    severity: 'critical',
    message: 'يلزم وجود مجموعتين صالحـتين على الأقل للمقارنة.'
  });
}

for (const group of groups) {
  const n = Number(group.n);
  const tp = Number(group.true_positive);
  const fn = Number(group.false_negative);
  const fp = Number(group.false_positive);
  const tn = Number(group.true_negative);
  const acceptedRate = ratio(group.accepted, n);
  const tpr = ratio(tp, tp + fn);
  const fpr = ratio(fp, fp + tn);

  metrics.groups.push({
    name: String(group.name || 'unnamed'),
    n: Number.isFinite(n) ? n : null,
    acceptance_rate: acceptedRate,
    tpr,
    fpr
  });

  if (!Number.isFinite(n) || n < minGroupN) {
    findings.push({
      code: 'SMALL_OR_INVALID_GROUP',
      severity: riskLevel === 'high' || riskLevel === 'critical' ? 'critical' : 'warning',
      group: String(group.name || 'unnamed'),
      message: `حجم عينة المجموعة أقل من ${minGroupN} أو غير صالح.`
    });
  }
  if (![tp, fn, fp, tn].every(Number.isFinite)) {
    findings.push({
      code: 'MISSING_CONFUSION_COUNTS',
      severity: 'warning',
      group: String(group.name || 'unnamed'),
      message: 'لا يمكن حساب TPR وFPR بصورة كاملة دون مكونات مصفوفة الالتباس.'
    });
  }
}

const acceptanceGap = gap(metrics.groups.map((g) => g.acceptance_rate));
const tprGap = gap(metrics.groups.map((g) => g.tpr));
const fprGap = gap(metrics.groups.map((g) => g.fpr));
metrics.gaps = {
  acceptance_gap: acceptanceGap,
  tpr_gap: tprGap,
  fpr_gap: fprGap
};

function checkGap(code, observed, limit, label) {
  if (observed !== null && observed > limit) {
    findings.push({
      code,
      severity: 'critical',
      observed,
      limit,
      message: `الفارق في ${label} يتجاوز الحد المعلن.`
    });
  }
}

checkGap('ACCEPTANCE_GAP_EXCEEDED', acceptanceGap, maxAcceptanceGap, 'معدل القبول');
checkGap('TPR_GAP_EXCEEDED', tprGap, maxTprGap, 'TPR');
checkGap('FPR_GAP_EXCEEDED', fprGap, maxFprGap, 'FPR');

const inconsistent = counterfactuals.filter((test) => test?.consistent === false);
const counterfactualSummary = {
  tested: counterfactuals.length,
  inconsistent: inconsistent.length,
  missing_consistency: counterfactuals.filter(
    (test) => typeof test?.consistent !== 'boolean'
  ).length
};

if (requireCfConsistency && counterfactuals.length === 0) {
  findings.push({
    code: 'NO_COUNTERFACTUAL_TESTS',
    severity: riskLevel === 'high' || riskLevel === 'critical' ? 'critical' : 'warning',
    message: 'السياسة تطلب اختبارات مقابلة، لكن لا توجد اختبارات مرفقة.'
  });
}
if (inconsistent.length > 0) {
  findings.push({
    code: 'COUNTERFACTUAL_INCONSISTENCY',
    severity: 'critical',
    count: inconsistent.length,
    message: 'تغيّر القرار أو النتيجة في اختبار مقابل.'
  });
}

const criticalCount = findings.filter((f) => f.severity === 'critical').length;
const warningCount = findings.filter((f) => f.severity === 'warning').length;
const highRisk = riskLevel === 'high' || riskLevel === 'critical';
const highRiskReview = highRisk && highRiskNeedsHuman;
const gatePass = criticalCount === 0 && !highRiskReview;
let decision = 'AUTO_PASS';
if (criticalCount > 0 || highRiskReview) decision = 'HUMAN_REVIEW';
else if (warningCount > 0) decision = 'HOLD';

return [{
  json: {
    audit_id: auditId,
    correlation_id: correlationId,
    decision,
    gate_pass: gatePass,
    human_review_required: decision === 'HUMAN_REVIEW',
    metrics,
    findings,
    counterfactual_summary: counterfactualSummary,
    limitations: [
      'هذه المؤشرات أدلة محدودة ضمن العينة والسياسة وليست إثباتًا لحياد مطلق.',
      'لا تستنتج سمات حساسة من النص أو المخرجات لمجرد ملء حقول التقييم.',
      'القرارات عالية المخاطر تحتاج إلى مراجعة بشرية حتى عند اجتياز المقارنات.'
    ],
    evidence_refs: [`audit://${auditId}`],
    policy_version: source.decision_context?.policy_version || null,
    workflow_version: source.workflow_version || null,
    model_id: source.model_id || null,
    created_at: now
  }
}];
