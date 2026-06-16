# Events

Events are aeqi's causation bus. An event is a signal that something happened,
and that signal might wake an agent, create a quest, update a session, or route
work to a role.

Events are **not** a log. They are queried historically — but their first-class job is to fire actions.

## Where events come from

| Source | Pattern prefix | Example |
|---|---|---|
| **Schedule** | `schedule:` | "Daily standup at 09:00" is a `schedule:0 9 * * *` event that fires a Quest into the assigned agent. |
| **Session lifecycle** | `session:` | An agent finishes a Quest (`session:quest_end`); a session starts (`session:start`). |
| **Inbound channels** | `webhook:` | A webhook arrives; a bridged channel message lands. |
| **Runtime detectors** | `loop:` `guardrail:` `shell:` `context:` `ideas:` `agent:` | The runtime detects a retry loop, a failed shell command, or a context-budget overrun. |
| **Questions** | `question:` | An agent surfaces a decision request and awaits an answer. |

Schedule and webhook events are user/world-shaped. The lifecycle and detector events are runtime-shaped. All flow through the same bus.

## Anatomy

An event is a row in the unified activity log. The real struct (`crates/aeqi-orchestrator/src/activity_log.rs`) is:

```rust
struct Event {
    id: String,
    event_type: String,            // serialized as "type"
    agent_id: Option<String>,
    session_id: Option<String>,
    quest_id: Option<String>,
    content: serde_json::Value,
    created_at: DateTime<Utc>,
}
```

The `type` is the event's **pattern** — a colon-prefixed string like `session:quest_end` or `schedule:0 9 * * *`. The `content` is structured JSON the consumer reads (sender, subject, result, etc.). There is no separate `scope_kind`/`scope_id` pair: scope is expressed by the concrete `agent_id` / `session_id` / `quest_id` foreign keys on the row. An event keyed to a `quest_id` is about that quest; one keyed only to an `agent_id` is about that agent.

## Detection patterns

Events fire when patterns match. The Tool-calls unification (2026-04-19) folded the old "middleware" layer into per-pattern detectors — every event is a `(pattern, tool_calls)` pair.

Patterns can be:

- **Exact:** `session:quest_end` for a specific `agent_id`.
- **Predicated:** the detector reads `content` and acts only when the body matches (e.g. a regex over a message body).
- **Window:** count of matching events within an interval crosses a threshold (this is how `ideas:threshold_reached` and `loop:detected` fire).

When a pattern matches, the detector fires the configured tool calls — typically `quests.create` or `message_to`. Other detectors can fire on the same event without conflict; events fan out.

## Scheduled cadences

A scheduled event is a row whose pattern is `schedule:<cron-expr>` (e.g. `schedule:0 9 * * *`) with the tool calls to fire when the cron tick lands. The runtime's scheduler walks the active set every minute and strips the `schedule:` prefix to read the expression. There is no `cron.tick` event — the cron expression *is* the pattern.

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

The runtime seeds nine lifecycle patterns for every session (`create_default_lifecycle_events`). They fire as a session is born, executes, and stops. Agents attach tool calls to them to customize behavior; an empty seed is a no-op marker operators can extend.

| Pattern | When it fires |
|---|---|
| `session:start` | Once at session birth — the "system prompt" moment where identity Ideas are assembled. |
| `session:execution_start` | Every spawn (each turn begins). |
| `session:quest_start` | A quest is picked up in the session. |
| `session:quest_end` | A quest's work completes. |
| `session:quest_result` | The quest's outcome is recorded. |
| `session:step_start` | A step within an execution begins. |
| `session:stopped` | The session halts. |
| `session:first_execution_complete` | Once, after the first turn completes. |
| `context:budget:exceeded` | The context budget is exceeded — fires the compaction-as-delegation path. |

These are patterns, not dotted names. There is no `agent.spawned`, `quest.assigned`, or `idea.tagged` event — those names never fire.

## Detector patterns

The Tool-calls unification folded the old middleware layer into per-pattern detectors. The runtime emits these detector patterns; events own the response via their `tool_calls`:

`loop:detected` · `guardrail:violation` · `graph_guardrail:high_impact` · `shell:command_failed` · `agent:premature_completion` · `ideas:threshold_reached`.

A pattern whose prefix no emitter produces will render "armed" but never fire. The known dispatch prefixes are: `session:`, `schedule:`, `webhook:`, `loop:`, `guardrail:`, `graph_guardrail:`, `shell:`, `context:`, `ideas:`, `agent:`, `question:`.

## Channel-bridged events

When a session has a `gateway_channel_id` set (Telegram, WhatsApp, email), an inbound message from the channel lands against the bridged session and triggers an execution. The mention-gate ([Mention-gating](/docs/patterns/mention-gating)) decides whether to fire a turn or just append to the transcript.

## Fan-out

An event can wake N consumers. The runtime dispatches to each detector in parallel. There is no global queue choke point — detectors are just rows in the event substrate keyed by pattern.

## Truthful emission

Events fire from where the cause actually happens, not from where it's first observed. Streaming output? The event fires as the producer emits, not after the daemon's stream reader sees it. This rule prevents reordering bugs and makes audit trails honest.

## Querying

Events stay in the runtime DB indefinitely. Query them via:

- The dashboard's **Events** tab (filterable by type, the linked agent/session/quest, and time).
- The REST API. Routes are `GET`/`POST /api/events`, `POST /api/events/trigger`, and `GET`/`POST /api/events/trace`. The filter takes `event_type`, `agent_id`, `session_id`, `quest_id`, `since`, and `since_id` — e.g. `GET /api/events?event_type=session:quest_end&agent_id=<id>`.
- The MCP `events` tool, with actions `create` / `list` / `enable` / `disable` / `delete` / `trigger` / `trace` (inside Claude Code or any MCP client).

## Why events aren't "audit logs"

A log is a write-only record of past states. An event is a cause. The two share a substrate (events outlive their dispatch and can be queried), but the conceptual role is different. A bug fix in the events table that breaks ordering breaks the *future* (a missed cron tick), not just the past.

## Related

- [Quests](/docs/concepts/quests) — events typically fire `quests.create`.
- [Sessions](/docs/concepts/sessions) — events typically wake an agent in a session.
- [Tool calls](/docs/concepts/agent-runtime-overview#tool-calls) — events emit tool calls; tool calls are how the LLM and runtime communicate.
