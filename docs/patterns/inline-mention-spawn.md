# Inline mention spawn

How `@`-mentions inside in-app sessions turn into agent turns.

## The pattern

A user (or another agent) types `@<name>` inside a session. The message layer parses the mention when the message is appended. Three branches:

| Mention resolves to | Action |
|---|---|
| An agent | Auto-subscribe the agent as a session participant; enqueue an agent run so it reads the message and replies. |
| A user or a role (`@user:`, `@position:`) | Subscribe as a participant for visibility. No turn fires — humans aren't callable, and role routing is its own addressing path. |
| **An unknown name** | Skipped silently. Bare `@name` mentions resolve via agent-name lookup only; a name that matches no active agent does nothing. |

The first branch is what makes a session feel alive: you pull a teammate into the room by naming them in the act of asking.

## Subscribe, then send

The mention has to take effect *before* the mentioned agent's turn fires, otherwise the agent's first turn doesn't see itself in the participant list. The order is:

1. The message is appended to the session.
2. The mention parser resolves each `@`-token against the entity's agents, users, and roles.
3. Each resolved identity is added as a session participant (idempotently — mentioning someone twice is harmless).
4. For agent mentions only, a run is enqueued on the session's queue; the agent reads the message and replies.

No separate system message announces the join — the message itself is the notification. This is the Linear / Notion behavior: mentioning someone puts the thing you said in front of them, rather than generating a second artifact about the mention.

## Parity with external channels

The same gate shape governs external channels (Telegram, WhatsApp — see [Mention-gating](/docs/patterns/mention-gating)): the agent reads everything for context, but a turn fires only when the agent is named. The in-app mention wiring is the front door to the same discipline — one mention grammar, inside the app and out.

## Why this matters

The fastest path from a thought to an agent's attention is one sentence with an `@` in it. No "add participant" form, no separate notification step. You address the agent in the act of asking it to do something.

Spawning a *brand-new* agent from an unresolved mention — the team growing by being talked to — is a possible future direction; today an unknown name is simply skipped.

## Related

- [Mention-gating](/docs/patterns/mention-gating) — Layer 1/2 model, BotFather privacy, allowlists.
- [Sessions](/docs/concepts/sessions) — what mentions mutate.
- [Roles](/docs/concepts/roles) — role-addressed routing.
