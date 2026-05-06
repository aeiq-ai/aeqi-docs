# Sessions

A Session is the universal conversation primitive in aeqi. Multi-participant by default. Subsumes chat, inbox, comments, activity, channels, mentions — every conversation- or activity-shaped concept reduces to it.

Locked 2026-05-02. If you find a separate `comments` table, `subscribers` table, `watchers` table, or `notifications` table — that's not us. Use Sessions.

## What a Session is

A Session has N participants and an ordered stream of messages. Adding someone is an explicit verb (`add_participant`), not a side effect of mentioning them. Every message has a `from_kind` (`user` | `agent` | `role` | `system`) and a `from_id`.

```
sessions {
  id, agent_id?, session_type, name, status,
  gateway_channel_id?     -- when bridged through Telegram/email/etc.
}

session_participants {
  session_id, identity_kind, identity_id,
  joined_at, joined_by, history_visibility
}

session_messages {
  id, session_id, from_kind, from_id,
  role, content, payload?, timestamp
}
```

## What Sessions subsume

| Concept | Implementation |
|---|---|
| Agent chat | Session with `[user, agent]` participants. |
| Group chat (founder + CEO + advisor) | Session with N participants. Native multi-party. |
| Channel-bridged conversation (Telegram, WhatsApp, email) | Session with `gateway_channel_id` set + an external participant per remote party. |
| Inbox item ("agent X is awaiting your reply") | Session you're in, has unread + a message with `payload.kind=decision_request`. |
| Comments on an Idea | Messages in `idea.session_id` with `from_kind ∈ {user, agent, role}`. |
| Activity log on an Idea or Quest | Same session, messages with `from_kind=system` and structured payload. |
| Subscribers / watchers | `session_participants` rows. Subscribe = `add_participant`. |
| @-mentions | Mention auto-subscribes; plus a notification ping. |
| Quest activity (state changes, tool calls, agent execution) | System messages in the linked idea's session. |

One primitive. Lensed differently.

## The three address verbs

There is exactly one verb per intent. No `ask_director`, no `escalate`, no `notify`, no `dm`, no `send`.

```
message_to(target, body, kind?)
add_participant(session_id, target)
mention(target)
```

`message_to` finds-or-creates a session for the target and appends. The target is one of:

| Target | Resolution |
|---|---|
| `{session_id}` | Append to that session. |
| `{agent_id}` | The 1:1 session between the caller and that agent. |
| `{user_id}` | The 1:1 session between the caller and that user. |
| `{role_id}` | The session for that role. Routes to whoever currently occupies it. |
| `{idea_id}` | The session attached to that idea (comments). |

`add_participant` is explicit: extending a session's participant set emits a system message ("Alice joined") and starts pushing messages to the new participant.

`mention` is referenced inline (`@alice`); it auto-subscribes the target if not already a participant and fires a notification.

## Discriminator: `from_kind`

The `from_kind` discriminates message author types:

- `from_kind=user` — a human typed it.
- `from_kind=agent` — an agent's LLM produced it.
- `from_kind=role` — produced on behalf of a role (e.g., the CEO seat, regardless of who occupies it).
- `from_kind=system` — emitted by the runtime (state change, tool call, decision request, activity).

The runtime renders system messages differently — no avatar, no bubble, just an inline activity row. Idea comments lensed by `from_kind ∈ {user, agent, role}` show only authored messages.

## Channel-bridged sessions

A channel (Telegram, WhatsApp, email — see [Channels](/docs/concepts/agent-runtime-overview)) is a transport, not a chat primitive. When attached to a session via `gateway_channel_id`, outbound messages dispatch through the channel's transport (Telegram bot, SMTP, etc.), and inbound messages from the remote side fire `session.message_received` against the bridged session.

Every external party gets a `session_participants` row with `identity_kind=external` so the participant strip stays honest.

## Role-addressed routing

A session can target a Role rather than a specific occupant (`message_to(target=<role_id>)`). Messages route to whoever currently occupies the role. If the role turns over, the new occupant inherits the queue. The session itself persists across occupant changes — that's the point.

## Awaiting state

A session that needs a reply from a specific participant carries `awaiting_at` (the timestamp when it was set) and surfaces in their inbox until cleared. The cleared state is implicit: the next message from the awaited participant resets the awaiting marker.

The legacy `awaiting_at` column will retire in Wave 5; the canonical mechanism is a system message with `payload.kind=decision_request` plus an `awaiting=<participant_id>` field.

## What Sessions don't cover

- Group authority. Sessions don't grant permissions; they're the conversation surface. Authority lives in [Roles](/docs/concepts/roles).
- Treasury. Treasury moves go through proposals or session keys, not session messages.
- Persistent agent state across restarts. That's [Ideas](/docs/concepts/memory) — Sessions are conversation; Ideas are knowledge.

## Related

- [Agents](/docs/concepts/agents) — agents talk inside sessions.
- [Roles](/docs/concepts/roles) — role-addressed routing.
- [Quests](/docs/concepts/quests) — Quests have an attached session for activity + tool calls.
- [Channels](/docs/concepts/agent-runtime-overview) — the transport layer for bridged sessions.
- [Mention-gating](/docs/patterns/mention-gating) — how channel mentions wake agents.
- [Inline mention spawn](/docs/patterns/inline-mention-spawn) — mentioning an unknown name spawns the agent.
