# Agent Runtime Overview

The aeqi runtime is the execution layer of the company OS.

It turns company context into coordinated work. Humans set direction; agents
execute through roles, quests, ideas, events, and sessions. The company remembers
what happened.

## The runtime model

```
Company
├── Roles      authority, responsibility, scope
├── Agents     workers that occupy roles
├── Quests     units of work
├── Ideas      knowledge, strategy, procedures, files, records
├── Events     triggers and signals
├── Sessions   conversations and execution traces
└── TRUST      programmable company vehicle: execution, authority, treasury, governance, ownership
```

The important point: agents do not float outside the company. They execute
inside a company shell with scoped authority and durable memory.

## The execution loop

```
1. A human states intent.
2. The company turns that intent into context.
3. A role owns the responsibility.
4. An agent occupying that role executes a quest.
5. Events and tool calls record what happened.
6. The session preserves the trace.
7. Ideas and memory update the company's operating state.
8. The result can feed accountability, governance, treasury, and authority.
```

This is how aeqi makes the agent economy legible. Work is not just generated; it
is attached to a company, a role, a session, and an outcome.

## Roles — authority

Roles answer WHO can act.

A role is an org-chart seat inside a company. It can be occupied by a human, an
agent, or remain vacant. Roles define responsibility and authority: CEO, CTO,
Finance Lead, Researcher, Director, Advisor.

Roles matter because agents need scope. A sales agent and a finance agent should
not inherit the same credentials, budgets, or authority.

See [Roles](/docs/concepts/roles).

## Agents — execution

Agents are workers.

They have identity, tools, model settings, memory access, and role assignments.
They execute quests, ask questions, store ideas, call APIs, coordinate with other
agents, and report outcomes.

The agent is not the company. The company is the container that makes the agent
economically meaningful.

See [Agents](/docs/concepts/agents).

## Quests — work

Quests answer WHAT should be done.

A quest is a unit of work with a subject, description, assignee, priority,
status, dependencies, session trace, and outcome. Quests can be created by
humans, agents, events, or integrations.

See [Quests](/docs/concepts/quests).

## Ideas and memory — context

Ideas are the company's durable knowledge. Memory is the accumulation of those
ideas, sessions, decisions, and outcomes over time.

Ideas can be strategy, facts, procedures, preferences, files, records, briefs,
SOPs, or learned context. Agents use memory to avoid starting from zero every
time.

See [Ideas and memory](/docs/concepts/memory).

## Events — triggers

Events answer WHEN the system should wake up.

An event can be a schedule, webhook, message, quest lifecycle change, integration
signal, or another agent finishing work. Events create motion.

See [Events](/docs/concepts/events).

## Sessions — trace

Sessions are the conversation and execution trace.

They record human messages, agent messages, tool calls, tool outputs, handoffs,
decisions, and final outcomes. A session can be a chat, a quest execution, an
inbox thread, a channel bridge, or a role-addressed conversation.

See [Sessions](/docs/concepts/sessions).

## TRUST — programmable company

TRUST is the programmable company vehicle in aeqi: the organization where agent
execution, memory, authority, treasury, governance, ownership, and signer
authority live in one operating context.

The runtime creates the operating history that authority and ownership should
act on.

See [TRUST](/docs/concepts/trust).

## Hosted and self-hosted runtime

On the hosted platform, each company runs in an isolated managed runtime with
its own state and budget controls.

Self-hosted, aeqi runs as one Rust binary:

```
aeqi start
├── daemon       orchestrates work
├── REST API     exposes runtime operations
├── MCP server   exposes tools to agent clients
└── dashboard    company control plane
```

## Next steps

- [Company](/docs/concepts/company)
- [Roles](/docs/concepts/roles)
- [Agents](/docs/concepts/agents)
- [Getting started](/docs/getting-started/getting-started)
