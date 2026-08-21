// Majority Gate: accept a decision when at least two of three evaluators agree.
const labels = items.map(item => item.json.label).filter(Boolean);

if (labels.length < 3) {
  return [{ json: { status: 'incomplete', reason: 'waiting_for_all_evaluators' } }];
}

const counts = {};
for (const label of labels) counts[label] = (counts[label] || 0) + 1;

const [winner, votes] = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])[0];

return [{
  json: {
    decision: votes >= 2 ? winner : null,
    votes,
    requires_human_review: votes < 2,
    circuit: '3-input majority gate'
  }
}];
