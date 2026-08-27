// Schmitt-style Hysteresis: use separate enter and keep thresholds.
const x = items[0]?.json ?? {};
const rawConfidence = Number(x.confidence);
const confidenceValid = Number.isFinite(rawConfidence) && rawConfidence >= 0 && rawConfidence <= 1;
const confidence = confidenceValid ? rawConfidence : 0;
const previous = x.previous_state === 'AUTO_SEND' ? 'AUTO_SEND' : 'REVIEW';
const enterAuto = 0.88;
const keepAuto = 0.78;
let state;
if (!confidenceValid) {
  state = 'REVIEW';
} else if (previous === 'AUTO_SEND') {
  state = confidence >= keepAuto ? 'AUTO_SEND' : 'REVIEW';
} else {
  state = confidence >= enterAuto ? 'AUTO_SEND' : 'REVIEW';
}
return [{
  json: {
    ...x,
    confidence,
    confidence_valid: confidenceValid,
    previous_state: previous,
    decision: state,
    requires_human_review: state !== 'AUTO_SEND',
    thresholds: { enter_auto: enterAuto, keep_auto: keepAuto },
    circuit: 'Schmitt trigger / hysteresis router'
  }
}];
