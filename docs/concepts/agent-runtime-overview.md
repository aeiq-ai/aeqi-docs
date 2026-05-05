# Agent Runtime Overview

The aeqi agent runtime is the execution layer where autonomous companies come to life. This page explains the four-primitive mental model, how agents execute work, and the runtime machinery that makes multi-agent coordination possible.

## The Four Primitives

aeqi modeling is built on four foundational primitives: **Agents** (WHO), **Events** (WHEN), **Quests** (WHAT), and **Ideas** (HOW).

### Agents — WHO

Agents are persistent identities with roles in a company. Each agent has a name, capabilities, model preference, and a position in an agent tree.

- **Root agent**: The autonomous company itself (one per company).
- **Child agents**: Specialists hired by the root or other agents (researcher, architect, reviewer, etc.).
- **Identity**: Defined by ideas marked `injection_mode='always'` — loaded into context on every session.

An agent can hire and retire other agents, forming an org chart. See [Agents](/docs/concepts/agents) for details.

### Quests — WHAT

Quests are units of work with clear ownership, priority, dependencies, and outcomes.

- **Lifecycle**: `pending` → `in_progress` → `done` (or `blocked` / `cancelled`).
- **Execution**: When assigned to an agent, a quest triggers a session and runs to completion or failure.
- **Composition**: Quests can depend on other quests; parent quests can spawn sub-tasks.
- **Outcome**: Recorded when closed — the result of the work.

See [Quests](/docs/concepts/quests) for the full lifecycle.

### Ideas — HOW

Ideas are persistent knowledge: facts, procedures, preferences, and memories that agents accumulate.

- **Storage**: Full-text searchable, versioned, with attribution.
- **Injection**: Ideas marked `injection_mode='always'` load into an agent's context; others load on-demand.
- **Learning**: When an agent completes a quest, it can store ideas captured during execution.
- **Sharing**: Ideas can be broadcast to other agents or roles.

See [Memory (Ideas)](/docs/concepts/memory) for the full model.

### Events — WHEN

Events are triggers: things that happen in the system that cause agents to wake up and act.

- **Scheduling**: Cron-style events fire on a schedule (daily standup, weekly review).
- **Lifecycle**: Agent lifecycle events (quest received, completed, failed) fire automatically.
- **Detection**: Custom events fire when system conditions match (e.g., alert received, deadline approaching).
- **Tool calls**: Events emit tool calls — the bridge between the LLM and the runtime.

Events drive the temporal flow of autonomous execution.

## Runtime Lifecycle

Here's how the four primitives interact in a typical execution:

```
1. Agent is created
   └─> Identity ideas load (injection_mode='always')

2. Quest is created or assigned
   └─> Triggering Event fires (on_quest_received)
       └─> Runtime creates a Session

3. Agent executes in the Session
   ├─> Context includes identity ideas + quest description
   ├─> Agent calls tools (ideas.* to learn, message_to to coordinate, transcript.inject)
   ├─> Each tool call is an Event
   └─> Session records all messages and tool outcomes

4. Quest completes
   ├─> Agent calls quests(action='close', ...) or quests(action='cancel', ...)
   ├─> Triggering Event fires (on_quest_completed or on_quest_failed)
   └─> Agent optionally stores learned ideas from the session

5. Ideas accumulate
   └─> Next quest execution loads the new ideas
```

## Sessions — Universal Conversation Primitive

A **session** is a multi-participant conversation transcript. It records:

- **Messages**: LLM turns, tool calls, tool output, human messages.
- **Participants**: The calling agent, other agents (mentioned or added), the runtime.
- **Context**: The quest being executed, referenced ideas, system state.
- **Discrimination**: `from_kind` field marks messages as system (activity) vs. user/agent/role (comment).

Sessions can exist alone (ad-hoc chat) or as part of a quest execution. All data lives in `sessions.db`.

## Tools — The Runtime Interface

Agents interact with the runtime through tools. The canonical tools are:

| Tool | Purpose | Effect |
|------|---------|--------|
| `ideas.create` | Store a fact or procedure | Persists learning |
| `ideas.search` | Retrieve relevant ideas | Loads context |
| `ideas.update` | Refine existing knowledge | Evolves identity |
| `message_to` | Send a message to another agent or role | Coordinates work |
| `transcript.inject` | Add structured data to the session | Embeds results |
| `quests` | Create, close, or update quests | Drives work |

Tools marked `produces_context()=true` (the `ideas.*` family) append their output to the LLM prompt assembly for the next turn. Side-effect tools (like `transcript.inject`) do not leak diagnostics into the prompt.

## Roles and Authority

Agents acquire authority through **roles** — positions in the org chart with delegated permissions.

- **Roles**: Defined per company; form a directed acyclic graph (DAG) of role_edges.
- **Authority**: Transitive closure of role edges from an agent's position up the tree.
- **Permissions**: Capabilities like `spawn_agents`, `manage_treasury`, `sign_transactions` follow role membership.

Roles are defined as ideas with `injection_mode='always'`, so they're always in context.

## Multi-Agent Coordination

When agents need to collaborate:

1. **Direct messaging**: Agent A calls `message_to(target='agent-b')` and awaits response.
2. **Work delegation**: Agent A creates a quest and assigns it to Agent B.
3. **Shared ideas**: Agent A stores an idea; the runtime broadcasts it to a role or audience.
4. **Event handlers**: Agent B's `on_idea_received` handler fires when new knowledge arrives.

Sessions track all participants and the order of contributions, enabling full conversation history and accountability.

## Storage & Isolation

- **Agents**: Stored in `agents.db` with identity and tree metadata.
- **Quests and Sessions**: Stored in `sessions.db`; one quest can span multiple retries/sessions.
- **Ideas**: Stored in `aeqi.db` with full-text search and versioning.
- **Per-agent isolation**: Each agent's context is scoped; cannot see other agents' raw session transcripts without explicit sharing.

## Next Steps

- **[Agents](/docs/concepts/agents)** — Detailed agent model, tree structure, and lifecycle.
- **[Quests](/docs/concepts/quests)** — Quest creation, dependencies, and closure.
- **[Memory (Ideas)](/docs/concepts/memory)** — Knowledge storage, injection, and learning.
- **[REST API](/docs/api/rest)** — Programmatic access to all runtime operations.
- **[Claude Code + aeqi](/docs/guides/claude-code)** — Running agents and quests from Claude Code over MCP.
