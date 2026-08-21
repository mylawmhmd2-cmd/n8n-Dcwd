// Priority Encoder / Arbiter: the highest-risk route wins deterministically.
const event = items[0].json;
const priority = {
  outage: 400,
  strategic_customer: 300,
  incident: 200,
  question: 100
};

const kind = event.type || 'question';
const score = priority[kind] ?? 0;

return [{
  json: {
    ...event,
    priority_score: score,
    route: score >= 400 ? 'emergency'
      : score >= 300 ? 'strategic-support'
      : score >= 200 ? 'incident-queue'
      : 'automated-reply',
    circuit: 'priority encoder'
  }
}];
