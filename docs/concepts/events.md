# Events

Events are aeqi's causation bus. An event is a signal that something happened,
and that signal might wake an agent, create a quest, update a session, or route
work to a role.

Events are **not** a log. They are queried historically — but their first-class job is to fire actions.

## Where events come from

| Source | Example |
|---|---|
| **Cron / schedule** | "Daily standup at 09:00." Fires a Quest into the assigned agent. |
| **System lifecycle** | An agent finishes a Quest. A Quest moves to `done`. A signer is added to the TRUST. |
| **Inbound channels** | A Telegram message lands. A webhook arrives. An email is received. |
| **Tool outcomes** | An LLM call returns. A contract write confirms on-chain. |
| **Other agents** | An agent emits an event when it ships, fails, or hands off. |

The first three are user-shaped. The last two are runtime-shaped. All flow through the same bus.

## Anatomy

```
event {
  id, kind, source, payload,
  fired_at, dispatched_at?,
  scope_kind, scope_id      // entity / role / agent
}
```

The `kind` is a stable string (`session.message_received`, `quest.completed`, `cron.tick`). The `payload` is structured data the consumer reads (sender, subject, body, etc.). Scope decides who can see and react to it.

## Detection patterns

Events fire when patterns match. The Tool-calls unification (2026-04-19) folded the old "middleware" layer into per-pattern detectors — every event is a `(pattern, tool_calls)` pair.

Patterns can be:

- **Exact:** `kind=session.message_received AND scope_id=<agent>`.
- **Predicated:** `body matches regex /\\bdeploy\\b/i`.
- **Window:** `count of kind=session.message_received within 1h > 5`.

When a pattern matches, the detector fires the configured tool calls — typically `quests.create`, `agents.spawn`, or `message_to`. Other detectors can fire on the same event without conflict; events fan out.

## Scheduled cadences

A scheduled event is a row with `cron='<expr>'` and a tool call to fire when the cron tick lands. The runtime's scheduler walks the active set every minute.

| Cadence | Use |
|---|---|
| Hourly | Treasury balance check. Inbox sweep. |
| Daily | Standup. Backlog review. |
| Weekly | Review meeting. Metrics report. |
| Monthly | Compliance check. Subscription review. |
| Quarterly | OKRs. Board prep. |

The aeqi reference company ships with scheduled events out of the box. Most stay
paused until the founder turns them on.

## Lifecycle events

Every agent ships with default handlers for its own lifecycle. Override per-agent to customize.

| Event | Default behavior |
|---|---|
| `agent.spawned` | Send greeting message; open kickoff Quest if defined. |
| `quest.assigned` | Open a session; start work. |
| `quest.completed` | Record outcome; emit `quest.completed` system event. |
| `quest.failed` | Retry policy or escalate via `message_to(parent_role)`. |
| `session.mentioned` | Wake agent for a turn even if the session is shared. |
| `idea.tagged` | Optional: react to specific tags (e.g., `kind:recruit`). |

## Channel-bridged events

When a session has a `gateway_channel_id` set (Telegram, WhatsApp, email), inbound messages from the channel fire `session.message_received` against the bridged session. The mention-gate ([Mention-gating](/docs/patterns/mention-gating)) decides whether to fire a turn or just append to the transcript.

## Fan-out

An event can wake N consumers. The runtime dispatches to each detector in parallel. There is no global queue choke point — detectors are just rows in the event substrate keyed by pattern.

## Truthful emission

Events fire from where the cause actually happens, not from where it's first observed. Streaming output? The event fires as the producer emits, not after the daemon's stream reader sees it. This rule prevents reordering bugs and makes audit trails honest.

## Querying

Events stay in the runtime DB indefinitely. Query them via:

- The dashboard's **Events** tab (filterable by kind, scope, time).
- The REST API (`GET /api/events?scope_id=<entity>&kind=quest.completed`).
- The MCP `events` tool (inside Claude Code or any MCP client).

## Why events aren't "audit logs"

A log is a write-only record of past states. An event is a cause. The two share a substrate (events outlive their dispatch and can be queried), but the conceptual role is different. A bug fix in the events table that breaks ordering breaks the *future* (a missed cron tick), not just the past.

## Related

- [Quests](/docs/concepts/quests) — events typically fire `quests.create`.
- [Sessions](/docs/concepts/sessions) — events typically wake an agent in a session.
- [Tool calls](/docs/concepts/agent-runtime-overview#tool-calls) — events emit tool calls; tool calls are how the LLM and runtime communicate.
