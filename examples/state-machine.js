// Finite-State Controller: explicit transitions and a bounded feedback loop.
const data = items[0]?.json ?? {};
const rawConfidence = Number(data.confidence);
const confidenceValid = Number.isFinite(rawConfidence) && rawConfidence >= 0 && rawConfidence <= 1;
const confidence = confidenceValid ? rawConfidence : 0;
const rawIteration = Number(data.iteration ?? 0);
const iterationValid = Number.isInteger(rawIteration) && rawIteration >= 0;
const iteration = iterationValid ? rawIteration : 0;
const maxIterations = 3;
const threshold = 0.80;
let nextState;
if (!confidenceValid || !iterationValid) {
  nextState = 'STOP_INSUFFICIENT_EVIDENCE';
} else if (confidence >= threshold) {
  nextState = 'ANSWER';
} else if (iteration >= maxIterations) {
  nextState = 'STOP_INSUFFICIENT_EVIDENCE';
} else {
  nextState = 'REFINE';
}
return [{
  json: {
    ...data,
    confidence,
    iteration: iteration + (nextState === 'REFINE' ? 1 : 0),
    state: nextState,
    requires_human_review: nextState !== 'ANSWER',
    confidence_valid: confidenceValid,
    iteration_valid: iterationValid,
    max_iterations: maxIterations,
    circuit: 'finite-state machine with feedback'
  }
}];
