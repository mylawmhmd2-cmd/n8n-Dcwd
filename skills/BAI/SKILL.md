---
name: BAI
description: تدقيق تحيز مخرجات الذكاء الاصطناعي وبناء بوابة إنصاف آمنة داخل n8n. استخدمها عندما يتخذ Workflow قرارًا آليًا مؤثرًا، أو يقارن أداء نموذج بين مجموعات، أو يحتاج إلى اختبارات مقابلة ومراجعة بشرية ومسار فشل آمن.
---

# مهارة تدقيق التحيز وبوابة الإنصاف في n8n

استخدم هذه المهارة لإضافة طبقة **BAI (Bias Audit & Fairness Interlock)** قبل أي قرار آلي قد يؤثر في أشخاص أو فرص أو وصول أو ترتيب أو نشر. لا تفترض أن النموذج محايد، ولا تدّعِ الوصول إلى حياد مطلق؛ أنشئ حكمًا قابلًا للتدقيق يوضح ما اختُبر، وما لم يُختبر، وحدود النتيجة.

## سير العمل الإلزامي

نفّذ المراحل بالترتيب، ولا تسمح لعقدة القرار النهائية بتجاوز بوابة التدقيق.

1. **حدّد القرار والسياق.** وثّق الغرض، صاحب القرار، مستوى المخاطر، الأثر المتوقع، المجموعات التي يجب حمايتها، وما إذا كانت المراجعة البشرية إلزامية. لا تجمع أو تستنتج سمة حساسة لا حاجة تشغيلية لها.
2. **ثبّت عقد البيانات.** تحقّق من هوية الطلب، ومصدر البيانات، ونسخة Workflow، ومعرّف النموذج، ووقت التنفيذ، واكتمال الحقول. افصل بيانات التشغيل عن بيانات التقييم المحمية كلما أمكن.
3. **افحص التمثيل والجودة.** احسب حجم العينات لكل مجموعة ولكل تقاطع مهم، وابحث عن القيم المفقودة، وعدم التوازن، واختلاف اللغة أو المصدر أو الفترة الزمنية. إذا كانت العينة غير كافية، اجعل النتيجة `INSUFFICIENT_EVIDENCE` بدل إصدار حكم مطمئن.
4. **أنشئ اختبارات مقابلة.** غيّر عاملًا واحدًا ذا صلة بالإنصاف مع تثبيت بقية السياق، ثم قارن القرار والدرجة والتفسير. لا تستخدم هذه الاختبارات لإثبات السببية؛ استخدمها لاكتشاف حساسية غير مبررة أو تناقض يحتاج إلى فحص.
5. **شغّل التقييم المجزأ.** احسب المؤشرات لكل مجموعة ولكل تقاطع ذي صلة، لا على المتوسط العام فقط. اعرض أحجام العينات، والبسط والمقام، ونطاق عدم اليقين إن توفر، وامتنع عن إخفاء الفئات الصغيرة داخل المتوسط.
6. **طبّق بوابة الأمان.** افصل بين الشروط الحرجة وشروط الإشارة. يفشل القرار تلقائيًا عند وجود إخفاق حرج، أو عينة غير كافية في سياق عالي المخاطر، أو تعارض بين الاختبارات، أو غياب دليل قابل للتتبع. مرّر فقط إلى `AUTO_PASS` عندما تتحقق السياسة المعلنة.
7. **حوّل الفشل إلى مسار آمن.** استخدم `HUMAN_REVIEW` أو `HOLD` أو `REJECT_FOR_DATA_QUALITY`، ولا تستخدم `AUTO_PASS` كقيمة افتراضية. أرسل سبب التحويل والأدلة إلى طابور المراجعة مع معرّف ارتباط.
8. **سجّل وراقب.** احفظ نسخة السياسة، ونسخة Workflow، ومعرّف النموذج، والإعدادات، والاختبارات، والمؤشرات، والقيود، وقرار البوابة. أعد الفحص عند تغيير النموذج أو البيانات أو السياسة، وراقب الانجراف بدل اعتبار التدقيق مرة واحدة ضمانًا دائمًا.

## النمط الرقمي

استخدم **Comparator Bank + Safety Interlock + Latch/Hysteresis**:

| عنصر الدائرة | تمثيله في Workflow | الوظيفة |
|---|---|---|
| Comparator Bank | عقدة `Code` أو فروع تقييم مستقلة | مقارنة المؤشرات والاختبارات مع السياسة المعلنة |
| Counterfactual Comparator | فرع يكرر التقييم على زوج مقابل | كشف اختلاف القرار عند تغيير عامل واحد |
| Safety Interlock | عقدة `Code` مستقلة | منع المرور عند فشل شرط حرج أو نقص الدليل |
| Latch/Hysteresis | مخزن حالة أو قاعدة بيانات | منع تقلب القرار عند الاقتراب من العتبة |
| Human Review Queue | طابور أو child workflow | استلام الحالات المرفوضة أو غير الحاسمة |
| Audit Log | Data Store أو قاعدة بيانات | حفظ الدليل، النسخ، وسبب القرار |

لا تستخدم **Majority Gate** وحدها. نجاح أغلبية الاختبارات لا يلغي إخفاقًا حرجًا في مجموعة صغيرة أو حالة عالية المخاطر.

## عقد الإدخال والخرج

اجعل عقدة التدقيق تستقبل كائنًا واحدًا في `item.json` بالشكل التالي. يمكن تغيير الأسماء، لكن لا تُسقط الحقول الخاصة بالنسخ أو الأدلة أو المراجعة.

```json
{
  "audit_id": "audit-2026-0001",
  "correlation_id": "case-123",
  "risk_level": "high",
  "workflow_version": "2026.08.27",
  "model_id": "provider/model-version",
  "decision_context": {
    "purpose": "screening",
    "action": "route_to_next_step",
    "policy_version": "fairness-policy-1"
  },
  "groups": [
    {"name": "group_a", "n": 120, "accepted": 72, "true_positive": 54, "false_positive": 18},
    {"name": "group_b", "n": 115, "accepted": 60, "true_positive": 43, "false_positive": 17}
  ],
  "counterfactual_tests": [
    {"id": "cf-1", "changed_factor": "declared_factor", "base_decision": "review", "counterfactual_decision": "review", "consistent": true}
  ],
  "policy": {
    "min_group_n": 30,
    "max_acceptance_gap": 0.10,
    "max_tpr_gap": 0.10,
    "max_fpr_gap": 0.10,
    "require_counterfactual_consistency": true,
    "high_risk_requires_human_review": true
  }
}
```

أعد الكائن التالي، وأبقِ `metrics` و`findings` قابلين للتدقيق بدل إعادة Boolean مختصر فقط:

```json
{
  "audit_id": "audit-2026-0001",
  "correlation_id": "case-123",
  "decision": "AUTO_PASS",
  "gate_pass": true,
  "human_review_required": false,
  "metrics": {},
  "findings": [],
  "counterfactual_summary": {},
  "limitations": [],
  "evidence_refs": ["audit://audit-2026-0001"],
  "policy_version": "fairness-policy-1",
  "created_at": "2026-08-27T00:00:00.000Z"
}
```

## كود عقدة Code في n8n

ضع الكود الآتي في عقدة **Code** بوضع `Run Once for All Items`. عدّل السياسة فقط من خلال المدخل أو متغيرات إعداد موثقة، ولا تضع أسرارًا أو مفاتيح API داخل العقدة.

```javascript
// BAI (Bias Audit & Fairness Interlock)
// Comparator Bank -> Safety Interlock -> Human Review/Hold decision.

const source = items[0]?.json ?? {};
const policy = source.policy ?? {};
const groups = Array.isArray(source.groups) ? source.groups : [];
const counterfactuals = Array.isArray(source.counterfactual_tests)
  ? source.counterfactual_tests
  : [];

const auditId = source.audit_id || `audit-${Date.now()}`;
const correlationId = source.correlation_id || auditId;
const riskLevel = String(source.risk_level || 'unknown').toLowerCase();
const now = new Date().toISOString();

const minGroupN = Number.isFinite(Number(policy.min_group_n))
  ? Number(policy.min_group_n) : 30;
const maxAcceptanceGap = Number.isFinite(Number(policy.max_acceptance_gap))
  ? Number(policy.max_acceptance_gap) : 0.10;
const maxTprGap = Number.isFinite(Number(policy.max_tpr_gap))
  ? Number(policy.max_tpr_gap) : 0.10;
const maxFprGap = Number.isFinite(Number(policy.max_fpr_gap))
  ? Number(policy.max_fpr_gap) : 0.10;
const requireCfConsistency = policy.require_counterfactual_consistency !== false;
const highRiskNeedsHuman = policy.high_risk_requires_human_review !== false;

function ratio(numerator, denominator) {
  const n = Number(numerator);
  const d = Number(denominator);
  return Number.isFinite(n) && Number.isFinite(d) && d > 0 ? n / d : null;
}

function maxGap(values) {
  const usable = values.filter((v) => Number.isFinite(v));
  if (usable.length < 2) return null;
  return Math.max(...usable) - Math.min(...usable);
}

const findings = [];
const metrics = { groups: [], gaps: {} };

if (!source.audit_id || !source.correlation_id || !source.workflow_version || !source.model_id) {
  findings.push({
    code: 'MISSING_TRACE_FIELDS',
    severity: 'critical',
    message: 'تنقص حقول التتبع الأساسية: audit_id أو correlation_id أو workflow_version أو model_id.'
  });
}

if (groups.length < 2) {
  findings.push({
    code: 'INSUFFICIENT_GROUPS',
    severity: 'critical',
    message: 'لا توجد مجموعتان صالحـتان على الأقل للمقارنة المجزأة.'
  });
}

for (const group of groups) {
  const n = Number(group.n);
  const acceptedRate = ratio(group.accepted, n);
  const tpr = ratio(group.true_positive, Number(group.true_positive) + Number(group.false_negative));
  const fpr = ratio(group.false_positive, Number(group.false_positive) + Number(group.true_negative));

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
      severity: riskLevel === 'high' ? 'critical' : 'warning',
      group: String(group.name || 'unnamed'),
      message: `حجم عينة المجموعة أقل من الحد المعلن (${minGroupN}) أو غير صالح.`
    });
  }
}

const acceptanceGap = maxGap(metrics.groups.map((g) => g.acceptance_rate));
const tprGap = maxGap(metrics.groups.map((g) => g.tpr));
const fprGap = maxGap(metrics.groups.map((g) => g.fpr));
metrics.gaps = { acceptance_gap: acceptanceGap, tpr_gap: tprGap, fpr_gap: fprGap };

function checkGap(code, gap, limit, label) {
  if (gap !== null && gap > limit) {
    findings.push({
      code,
      severity: 'critical',
      observed: gap,
      limit,
      message: `الفارق في ${label} يتجاوز الحد المعلن.`
    });
  }
}

checkGap('ACCEPTANCE_GAP_EXCEEDED', acceptanceGap, maxAcceptanceGap, 'معدل القبول');
checkGap('TPR_GAP_EXCEEDED', tprGap, maxTprGap, 'الاستدعاء/الإيجابيات الصحيحة');
checkGap('FPR_GAP_EXCEEDED', fprGap, maxFprGap, 'الإيجابيات الكاذبة');

const inconsistentCf = counterfactuals.filter((test) => test && test.consistent === false);
const cfMissingConsistency = counterfactuals.filter(
  (test) => test && typeof test.consistent !== 'boolean'
);
const counterfactualSummary = {
  tested: counterfactuals.length,
  inconsistent: inconsistentCf.length,
  missing_consistency: cfMissingConsistency.length
};

if (requireCfConsistency && counterfactuals.length === 0) {
  findings.push({
    code: 'NO_COUNTERFACTUAL_TESTS',
    severity: riskLevel === 'high' ? 'critical' : 'warning',
    message: 'السياسة تطلب اختبارات مقابلة، لكن لا توجد اختبارات مرفقة.'
  });
}
if (inconsistentCf.length > 0) {
  findings.push({
    code: 'COUNTERFACTUAL_INCONSISTENCY',
    severity: 'critical',
    count: inconsistentCf.length,
    message: 'تغيّر القرار أو النتيجة في اختبار مقابل رغم تثبيت السياق المعلن.'
  });
}

const criticalCount = findings.filter((f) => f.severity === 'critical').length;
const warningCount = findings.filter((f) => f.severity === 'warning').length;
const highRiskReview = riskLevel === 'high' || riskLevel === 'critical';
const gatePass = criticalCount === 0 && !(highRiskReview && highRiskNeedsHuman);

let decision = 'AUTO_PASS';
if (criticalCount > 0) decision = 'HUMAN_REVIEW';
else if (highRiskReview && highRiskNeedsHuman) decision = 'HUMAN_REVIEW';
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
      'المؤشرات لا تثبت غياب التحيز أو سببيته؛ هي أدلة محدودة ضمن العينة والسياسة المعلنة.',
      'لا تُستنتج سمات حساسة من النص أو المخرجات لمجرد ملء حقول التقييم.',
      'تحتاج القرارات عالية المخاطر إلى مراجعة بشرية حتى عند اجتياز المقارنات.'
    ],
    evidence_refs: [`audit://${auditId}`],
    policy_version: source.decision_context?.policy_version || null,
    workflow_version: source.workflow_version || null,
    model_id: source.model_id || null,
    created_at: now
  }
}];
```

## ربط العقد

ضع عقدة التدقيق بعد تطبيع مخرجات النموذج وقبل عقدة `IF` أو `Switch` التي قد تنفّذ القرار. اربط `AUTO_PASS` بالمسار المسموح فقط، واربط `HUMAN_REVIEW` و`HOLD` و`REJECT_FOR_DATA_QUALITY` بطابور منفصل. استخدم `correlation_id` في كل فرع، واجعل عمليات الكتابة إلى سجل التدقيق وبلاغ المراجعة قابلة لإعادة المحاولة دون تكرار.

لا تسمح بعقدة نشر أو حذف أو رفض نهائي أن تعتمد على `score` وحده. يجب أن تقرأ `decision` و`gate_pass` و`human_review_required`، وأن تتحقق من وجود `audit_id` و`evidence_refs` قبل التنفيذ.

## قالب تقرير التدقيق

استخدم هذا الهيكل عند تلخيص النتيجة للمستخدم أو للمراجع:

```markdown
# تقرير تدقيق الإنصاف: [audit_id]

## ملخص القرار
القرار: [AUTO_PASS / HUMAN_REVIEW / HOLD / REJECT_FOR_DATA_QUALITY]
المستوى: [risk_level]
السبب المختصر: [سبب قابل للتتبع]

## ما الذي اختُبر
- نسخة Workflow والنموذج والسياسة.
- المجموعات والتقاطعات وأحجام العينات.
- الاختبارات المقابلة.
- المؤشرات والفروق وحدودها.

## النتائج
| الفحص | القيمة المرصودة | الحد | الحالة |
|---|---:|---:|---|
| معدل القبول | [value] | [limit] | [pass/fail/unknown] |
| فارق TPR | [value] | [limit] | [pass/fail/unknown] |
| فارق FPR | [value] | [limit] | [pass/fail/unknown] |
| اتساق الاختبار المقابل | [value] | [required] | [pass/fail/unknown] |

## القيود
اذكر نقص البيانات، صغر العينات، اختلاف اللغة أو المصدر، وعدم صلاحية الاستنتاج خارج نطاق التقييم.

## الإجراء التالي
حدد مالك المراجعة، ومعرّف الحالة، وموعد إعادة الاختبار أو شروط إطلاق القرار.
```

## قائمة فحص قبل التسليم

- فكّك القرار إلى بيانات، تقييم، بوابة، مراجعة، وسجل أدلة.
- افصل فشل البيانات عن فشل الإنصاف وعن فشل النموذج.
- احسب المؤشرات مجزأة، وأظهر أحجام العينات والبسط والمقام.
- اختبر الحالات المقابلة والتقاطعات المهمة، ولا تعتمد على متوسط كلي.
- عرّف مسبقًا الشروط الحرجة وحدود `warning` و`critical`.
- اجعل نقص الدليل مسارًا آمنًا، لا نجاحًا صامتًا.
- أضف مراجعة بشرية للقرارات عالية المخاطر.
- احفظ النسخ ومعرّفات الارتباط والأدلة، وامنع التكرار عند إعادة المحاولة.
- اختبر عتبات قريبة من الحدود، ومدخلات ناقصة، ونتائج متعارضة، وتسليمًا مكررًا أو خارج الترتيب.
- صرّح بأن التدقيق يحدد مخاطر وأدلة ضمن نطاق محدد، ولا يثبت حياد النظام بصورة مطلقة.
