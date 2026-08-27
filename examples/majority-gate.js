// Majority Gate: accept only when at least two of three evaluators agree.
const labels = items.map(item => item?.json?.label).filter(Boolean);
if (labels.length < 3) {
  return [{ json: { status: 'incomplete', reason: 'waiting_for_all_evaluators', requires_human_review: true } }];
}
const counts = {};
for (const label of labels) counts[label] = (counts[label] || 0) + 1;
const topVotes = Math.max(...Object.values(counts));
const leaders = Object.entries(counts).filter(([, votes]) => votes === topVotes).map(([label]) => label);
const hasMajority = topVotes >= 2 && leaders.length === 1;
return [{
  json: {
    decision: hasMajority ? leaders[0] : null,
    votes: topVotes,
    leaders,
    requires_human_review: !hasMajority,
    reason: hasMajority ? 'strict_majority_reached' : 'no_strict_majority_or_tie',
    circuit: '3-input majority gate'
  }
}];
