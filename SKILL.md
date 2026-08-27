---
name: digital-circuit-workflow-design
description: A generative methodology for designing AI automation workflows (n8n or similar) by deriving structural patterns from digital logic and circuit engineering. Use when the user requests designing an automation/workflow that connects multiple AI models or tools, and specifically asks to draw inspiration from digital logic or circuit engineering patterns. Guides the agent through system-level decomposition, behavioral analysis, digital circuit family matching, abstract principle mapping, n8n node translation, and working code generation — all invented fresh each time, never recycled from prior examples.
---

# Digital Circuit Workflow Design Methodology

A generative research-and-invention methodology for designing AI automations by drawing structural analogies from digital circuit engineering. This methodology is **generative** (invents the analogy fresh each time from the functional description) — not **retrieval-based** (does not recall or copy prior designs).

## Core Rule

> Never replicate patterns used in previous conversations verbatim. Always search for the closest NEW digital pattern that fits the current case specifically, even if it resembles a prior project. Each design must be invented fresh from the functional description provided.

## Methodology Steps

### Step 0 — System-Level Decomposition

Before performing any behavioral analysis or selecting a circuit pattern, decompose the entire proposed project into independent functional slices. Treat each slice as a bounded subsystem that can be analyzed and designed on its own, while also documenting how it participates in the larger workflow.

Create a system inventory that identifies, for every slice:

- Its responsibility, inputs, outputs, state, and external dependencies
- Its boundary and the conditions under which it starts, pauses, retries, or terminates
- The upstream and downstream slices it communicates with
- Whether communication is **synchronous** (the sender waits for a response), **asynchronous** (the sender emits work and continues), or mediated through a **shared bus/state store**
- The message or signal contract, including payload shape, correlation identifiers, ordering requirements, acknowledgements, and error signals
- Ownership of mutable state and the consistency guarantees required across slices
- Failure isolation, retry, timeout, idempotency, and backpressure behavior

Represent the decomposition before moving on. A useful minimum format is:

| Slice | Responsibility | Inputs / Outputs | State Owner | Communication | Failure Boundary |
|---|---|---|---|---|---|
| `slice-name` | One concise responsibility | Contracts, not implementation details | Local, shared store, or external system | Sync, async, or shared bus | Retry, timeout, fallback, or dead-letter behavior |

Then describe the system-level topology in words or a diagram. Explicitly distinguish direct request/response paths from event-driven paths and shared-bus interactions. Do not choose a digital circuit analogy until every major unit and interaction path has been accounted for. If the project description is incomplete, state the missing slices or contracts and ask targeted questions rather than silently merging unrelated responsibilities.

### Step 1 — Functional Behavioral Analysis

Analyze the required behavior **within each decomposed slice first**, then analyze the emergent behavior of the complete system. Understand from the user's description what **behavioral property** is required. Ask:

- Is this about **voting / consensus** among multiple outputs?
- Is this about **priority resolution** (which signal wins)?
- Is this about **stability vs. oscillation** (when to lock a decision)?
- Is this about **synchronization** (aligning timing of multiple processes)?
- Is this about **state accumulation / memory** (remembering past results)?
- Is this about **noise filtering / debouncing** (ignoring transient errors)?
- Is this about **signal routing / multiplexing** (choosing between paths)?
- Is this about **encoding / decoding** (transforming representations)?
- Is this about **feedback control** (adjusting based on output)?
- Is this about **coordination across slices** (sequencing, handshakes, buffering, or backpressure)?

For each slice, record the trigger, decision or transformation, expected output, timing assumptions, state transitions, and abnormal paths. Then explain which slice-level behaviors compose into the system-level behavior. Do NOT jump to a pattern yet. Fully characterize the behavioral need first.

### Step 2 — Digital Circuit Family Search

With the behavioral property identified, search your knowledge of digital logic circuit families for the closest analog:

| Behavioral Property | Candidate Circuit Families |
|---|---|
| Voting / Consensus | Majority gates, Quorum circuits, Voting logic |
| Priority Resolution | Priority encoders, Arbiters, Bus arbitration |
| Stability / Locking | Latches, Flip-flops, SR circuits, Schmitt triggers |
| Synchronization | Clock distribution, PLLs, Synchronizers, Handshake protocols |
| State Accumulation | Counters, Shift registers, Accumulators, State machines |
| Noise Filtering | Debouncers, Low-pass digital filters, Hysteresis circuits |
| Signal Routing | Multiplexers, Demultiplexers, Crossbar switches |
| Encoding / Decoding | Encoders, Decoders, Code converters |
| Feedback Control | PID-like loops, Servo mechanisms, AGC circuits |
| Cross-slice Coordination | Handshake controllers, FIFOs, arbiters, bus protocols, finite-state controllers |

This table is a starting point, not a constraint. Combine families or invent hybrid patterns. The goal is to find the circuit whose **transfer function or state behavior** most closely matches the required workflow behavior. Select patterns at the correct level: use a circuit family for a slice when appropriate, and use a coordinating circuit or protocol for interactions between slices when necessary.

### Step 3 — Abstract Principle Mapping

Before connecting anything to the user's project, explain the chosen circuit's principle in pure abstract form:

1. State the circuit's **name and family**
2. Describe its **input-output relationship** (truth table, state diagram, or transfer function)
3. Explain **why** this circuit's behavior matches the identified behavioral property
4. If combining multiple circuits, explain how they compose
5. Identify which circuit elements represent slices, which represent communication paths, and which represent shared state or coordination
6. Explain timing assumptions, synchronization boundaries, and what happens when a signal is delayed, duplicated, reordered, or lost

This step ensures the analogy is grounded in real engineering, not superficial metaphor.

### Step 4 — Translation to Automation Nodes

Map each circuit element and communication path to concrete n8n constructs:

| Circuit Element | n8n Equivalent |
|---|---|
| Logic gate (AND/OR/NOT/XOR) | Function node with boolean logic |
| Latch / Flip-flop | Static variable or external state store (Redis, file, workflow static data) that persists a value until explicitly reset |
| Counter | Incrementing variable in state store |
| Multiplexer | IF/Switch node selecting between input branches |
| Clock / Trigger | Cron trigger, Webhook, or polling trigger |
| Comparator | Function node comparing values (numeric, embedding similarity, etc.) |
| Feedback loop | Workflow calling itself or writing back to its own trigger |
| Bus / Signal line | Workflow data passing between nodes via JSON, queue, pub/sub topic, or shared event store |
| Synchronous handshake | Request node followed by explicit response validation and timeout handling |
| Asynchronous channel | Webhook, queue, event trigger, or child workflow with correlation ID |
| FIFO / Buffer | Queue or ordered state collection with explicit capacity and drain rules |
| Arbiter | Function or Switch node that grants one competing request according to a declared policy |
| Encoder / Decoder | Function node transforming data format |
| Filter / Debouncer | Function node that checks consistency over N consecutive runs before acting |

For every slice, identify its trigger, node boundary, input/output contract, state mechanism, and error path. For every interaction, specify whether it is synchronous, asynchronous, or shared-bus based, and map correlation, ordering, acknowledgement, retry, timeout, and deduplication requirements to concrete nodes or external services.

Invent new mappings when the circuit element has no obvious n8n counterpart. Do not force a one-to-one mapping when a queue, database, worker workflow, or external coordinator is required to preserve the circuit's behavior.

### Step 5 — Working Code Generation

Produce actual JavaScript code for n8n Function nodes that implements the mapped circuit logic. The code must:

1. Be **self-contained** within each Function node
2. Include **clear comments** mapping each code section back to its circuit equivalent and decomposed slice
3. Handle **state management** explicitly (how state is read, updated, and persisted)
4. Include **edge cases** the circuit analogy reveals (race conditions, metastability, initialization)
5. Enforce the declared message contract, including validation, correlation IDs, idempotency, and versioning where applicable
6. Make timeout, retry, ordering, duplicate delivery, and partial-failure behavior explicit for cross-slice communication
7. Avoid unsafe infinite feedback loops and document any required n8n configuration outside the Function node

When code spans multiple slices, provide the code in slice order and explain the handoff contract between each Function node or workflow. Keep local state ownership clear and never rely on undocumented shared mutable state.

## Bias Audit & Fairness Interlock

عند تصميم Workflow يتخذ قرارًا مؤثرًا على أشخاص أو فرص أو وصول أو ترتيب أو نشر، أضف طبقة تدقيق تحيز قبل عقدة القرار. لا تفترض أن النموذج محايد، ولا تساوِ بين اجتياز فحص واحد وغياب التحيز.

نفّذ هذا المسار: حدّد القرار ومستوى المخاطر والمجموعات التي يجب حمايتها؛ ثبّت عقد البيانات والنسخ ومعرّفات التتبع؛ افحص التمثيل وجودة العينات؛ شغّل تقييمًا مجزأً واختبارات مقابلة؛ طبّق `Safety Interlock` على الشروط الحرجة؛ ثم أرسل الإخفاق أو نقص الدليل إلى `HUMAN_REVIEW` أو `HOLD` وسجّل الأدلة.

| شريحة التدقيق | المدخلات | المخرج | النظير الرقمي | حد الفشل |
|---|---|---|---|---|
| تعريف السياسة | الغرض، المخاطر، المجموعات، النسخة | سياسة قابلة للتنفيذ | مواصفات الدائرة | سياسة ناقصة أو غير قابلة للتتبع |
| تقييم مجزأ | نتائج مصنفة وأحجام عينات | قبول، TPR، FPR وفروقها | Comparator Bank | فجوة تتجاوز العتبة أو عينة صغيرة |
| اختبار مقابل | زوج يغيّر عاملًا واحدًا | اتساق القرار والدرجة | Counterfactual Comparator | تغير غير مبرر |
| بوابة القرار | المؤشرات، الأدلة، مستوى المخاطر | `AUTO_PASS` أو مسار آمن | Safety Interlock | إخفاق حرج أو نقص دليل |
| سجل ومراجعة | القرار ومعرّف الارتباط | سجل تدقيق وطابور بشري | Latch / State Store | فقدان النسخة أو التكرار |

في n8n، ضع عقدة `Code` للتدقيق بعد تطبيع مخرجات النماذج وقبل `IF` أو `Switch`. لا تجعل `Majority Gate` وحدها حارسًا للإنصاف؛ فالأغلبية قد تخفي إخفاقًا حرجًا في مجموعة صغيرة. اقرأ `decision` و`gate_pass` و`human_review_required` و`evidence_refs` في العقد اللاحقة، ولا تعتمد على `score` وحده.

للتطبيق التفصيلي والكود الجاهز، استخدم المهارة المرفقة `bias-audit-interlock`، أو ابدأ من المثال [Bias Audit & Fairness Interlock](examples/bias-audit-interlock/README.md).

## Quality Checklist

Before delivering the final design, verify:

- [ ] The entire system was decomposed into independent functional slices before any behavioral analysis began
- [ ] Every major slice has a documented responsibility, boundary, inputs, outputs, state owner, and failure boundary
- [ ] Every inter-slice interaction is classified as synchronous, asynchronous, or shared-bus based, with its contract and timing behavior documented
- [ ] The behavioral property was identified within each slice and at the system level before choosing a pattern (Step 1 before Step 2)
- [ ] The circuit analogy is grounded in real digital logic, not just a metaphor
- [ ] The abstract principle was explained independently of the user's project
- [ ] Every circuit element has a concrete n8n node mapping
- [ ] State ownership, synchronization boundaries, ordering, retries, deduplication, and partial failures are addressed
- [ ] The code is functional JavaScript for n8n Function nodes
- [ ] No pattern was copied verbatim from a previous conversation
- [ ] Edge cases from the circuit analogy were addressed
