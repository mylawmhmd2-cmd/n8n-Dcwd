// Schmitt-style Hysteresis: use separate enter and keep thresholds.
const x = items[0].json;
const confidence = Number(x.confidence ?? 0);
const previous = x.previous_state || 'REVIEW';

const enterAuto = 0.88;
const keepAuto = 0.78;
let state;

if (previous === 'AUTO_SEND') {
  state = confidence >= keepAuto ? 'AUTO_SEND' : 'REVIEW';
} else {
  state = confidence >= enterAuto ? 'AUTO_SEND' : 'REVIEW';
}

return [{
  json: {
    ...x,
    decision: state,
    thresholds: { enter_auto: enterAuto, keep_auto: keepAuto },
    circuit: 'Schmitt trigger / hysteresis router'
  }
}];
