---
name: digital-circuit-workflow-design
description: A generative methodology for designing AI automation workflows (n8n or similar) by deriving structural patterns from digital logic and circuit engineering. Use when the user requests designing an automation/workflow that connects multiple AI models or tools, and specifically asks to draw inspiration from digital logic or circuit engineering patterns. Guides the agent through behavioral analysis, digital circuit family matching, abstract principle mapping, n8n node translation, and working code generation — all invented fresh each time, never recycled from prior examples.
---

# Digital Circuit Workflow Design Methodology

A generative research-and-invention methodology for designing AI automations by drawing structural analogies from digital circuit engineering. This methodology is **generative** (invents the analogy fresh each time from the functional description) — not **retrieval-based** (does not recall or copy prior designs).

## Core Rule

> Never replicate patterns used in previous conversations verbatim. Always search for the closest NEW digital pattern that fits the current case specifically, even if it resembles a prior project. Each design must be invented fresh from the functional description provided.

## Methodology Steps

### Step 1 — Functional Behavioral Analysis

Understand from the user's description what **behavioral property** is required. Ask:

- Is this about **voting / consensus** among multiple outputs?
- Is this about **priority resolution** (which signal wins)?
- Is this about **stability vs. oscillation** (when to lock a decision)?
- Is this about **synchronization** (aligning timing of multiple processes)?
- Is this about **state accumulation / memory** (remembering past results)?
- Is this about **noise filtering / debouncing** (ignoring transient errors)?
- Is this about **signal routing / multiplexing** (choosing between paths)?
- Is this about **encoding / decoding** (transforming representations)?
- Is this about **feedback control** (adjusting based on output)?

Do NOT jump to a pattern yet. Fully characterize the behavioral need first.

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

This table is a starting point, not a constraint. Combine families or invent hybrid patterns. The goal is to find the circuit whose **transfer function or state behavior** most closely matches the required workflow behavior.

### Step 3 — Abstract Principle Mapping

Before connecting anything to the user's project, explain the chosen circuit's principle in pure abstract form:

1. State the circuit's **name and family**
2. Describe its **input-output relationship** (truth table, state diagram, or transfer function)
3. Explain **why** this circuit's behavior matches the identified behavioral property
4. If combining multiple circuits, explain how they compose

This step ensures the analogy is grounded in real engineering, not superficial metaphor.

### Step 4 — Translation to Automation Nodes

Map each circuit element to concrete n8n constructs:

| Circuit Element | n8n Equivalent |
|---|---|
| Logic gate (AND/OR/NOT/XOR) | Function node with boolean logic |
| Latch / Flip-flop | Static variable or external state store (Redis, file, workflow static data) that persists a value until explicitly reset |
| Counter | Incrementing variable in state store |
| Multiplexer | IF/Switch node selecting between input branches |
| Clock / Trigger | Cron trigger, Webhook, or polling trigger |
| Comparator | Function node comparing values (numeric, embedding similarity, etc.) |
| Feedback loop | Workflow calling itself or writing back to its own trigger |
| Bus / Signal line | Workflow data passing between nodes via JSON |
| Encoder / Decoder | Function node transforming data format |
| Filter / Debouncer | Function node that checks consistency over N consecutive runs before acting |

Invent new mappings when the circuit element has no obvious n8n counterpart.

### Step 5 — Working Code Generation

Produce actual JavaScript code for n8n Function nodes that implements the mapped circuit logic. The code must:

1. Be **self-contained** within each Function node
2. Include **clear comments** mapping each code section back to its circuit equivalent
3. Handle **state management** explicitly (how state is read, updated, and persisted)
4. Include **edge cases** the circuit analogy reveals (race conditions, metastability, initialization)

## Quality Checklist

Before delivering the final design, verify:

- [ ] The behavioral property was identified before choosing a pattern (Step 1 before Step 2)
- [ ] The circuit analogy is grounded in real digital logic, not just a metaphor
- [ ] The abstract principle was explained independently of the user's project
- [ ] Every circuit element has a concrete n8n node mapping
- [ ] The code is functional JavaScript for n8n Function nodes
- [ ] No pattern was copied verbatim from a previous conversation
- [ ] Edge cases from the circuit analogy were addressed
