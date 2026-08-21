// Finite-State Controller: explicit transitions and a bounded feedback loop.
const data = items[0].json;
const confidence = Number(data.confidence ?? 0);
const iteration = Number(data.iteration ?? 0);
const maxIterations = 3;
const threshold = 0.80;

let nextState;
if (confidence >= threshold) {
  nextState = 'ANSWER';
} else if (iteration >= maxIterations) {
  nextState = 'STOP_INSUFFICIENT_EVIDENCE';
} else {
  nextState = 'REFINE';
}

return [{
  json: {
    ...data,
    iteration: iteration + (nextState === 'REFINE' ? 1 : 0),
    state: nextState,
    circuit: 'finite-state machine with feedback'
  }
}];
