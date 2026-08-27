// Priority Encoder / Arbiter: known high-risk routes win deterministically.
const event = items[0]?.json ?? {};
const priority = {
  outage: 400,
  strategic_customer: 300,
  incident: 200,
  question: 100
};
const kind = String(event.type || '').trim().toLowerCase();
const knownType = Object.prototype.hasOwnProperty.call(priority, kind);
const score = knownType ? priority[kind] : 0;
const route = !knownType ? 'human-review'
  : score >= 400 ? 'emergency'
  : score >= 300 ? 'strategic-support'
  : score >= 200 ? 'incident-queue'
  : 'automated-reply';
return [{
  json: {
    ...event,
    normalized_type: kind || null,
    known_type: knownType,
    priority_score: score,
    route,
    requires_human_review: !knownType,
    decision_reason: knownType ? 'known_priority_type' : 'unknown_event_type_requires_review',
    circuit: 'priority encoder'
  }
}];
