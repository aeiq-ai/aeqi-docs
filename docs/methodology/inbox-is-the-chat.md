# The inbox is the chat

Five surfaces in aeqi look like a conversation: the personal inbox, an Agent's session list, a Trust's channels, a Company's channels, and the comment thread on an Idea. They all read the same way, render the same way, and address the same primitive. That's not a coincidence — it's the founder's call. The inbox is the chat.

Locked v0.51.0 + the three follow-on ships (sidebar-cleanup, company-channels, toolbar-unify).

## The mental model

Every conversational surface in aeqi is an inbox scoped to its participants.

| Surface | Scope | URL |
|---|---|---|
| Entity inbox | Sessions where you are a participant, scoped to one of your entities | `/trust/<address>/inbox` |
| Agent inbox | Sessions where the agent is a participant | `/trust/<address>/agents/<id>/inbox` |
| Trust channels | Sessions scoped to the TRUST | `/trust/<address>/channels` |
| Idea comments | The session attached to an Idea | `/ideas/<id>` |

There is no "inbox" data type, no "channel" data type, no "comments" data type. Each surface is a query against [Sessions](/docs/concepts/sessions) with a different scope predicate. List the sessions where the participant set contains me — that's an inbox. List the sessions where the participant set contains an agent — that's the Agent's session list. List the sessions where the scope is a TRUST — those are the channels.

The substrate doesn't care which view you opened.

## The primitive stack

Four primitives stack and the same four render every surface.

```
Session     ← the data primitive (multi-participant, ordered messages)
SessionRail ← the list view (left rail of any chat surface)
SessionDetail ← the transcript view (right pane, headers + bubbles)
Composer    ← the compose box (bottom of every transcript)
```

There is one `Composer`, one `SessionRail`, one `SessionDetail`. Five surfaces wire them five different ways. When the Composer changes, every surface gets the change. When the rail changes, every surface gets the change. The toolbar above the rail (search · sort · filter · view · +) is itself a single primitive — `SessionsToolbar` — locked to the same grammar the Quests and Ideas toolbars use.

This is a hard rule: if you are about to write a second Composer, stop. The shape exists.

## Multi-participant from day one

Every session can have N participants. That's not a feature added later — it's the table shape. So every chat surface ships the multi-party affordances by default:

- A `ParticipantStrip` sits at the top of every transcript. It shows who is in the session: avatars, names, role tags, plus an external-participant badge for Telegram / WhatsApp / email parties.
- An `AddParticipantModal` invokes `add_participant` against the canonical IPC verb. Bring in another agent, a Role, or a person; system message logs the join; the new participant starts seeing messages.
- Every message renders with an explicit author header. Top-left for incoming, top-right for outgoing. Once a session has more than two participants, this header is the only thing that lets the eye separate threads.

A 1:1 chat between you and your CEO agent is just the degenerate case of a multi-party room. The UI doesn't switch shapes when a third participant joins; it was already that shape.

## Why "Inbox" beats "Sessions" in copy

The data primitive is named `Session`. The user-facing surface is named `Inbox`.

Two reasons:

1. **"Inbox" is the word humans recognize.** Email taught a generation that an inbox is the place where the things waiting for me show up. Adopting that vocabulary collapses the explanation to zero. "Sessions" requires a sentence; "Inbox" requires nothing.
2. **The same data primitive renders differently per scope.** A user looking at `/trust/<their-address>/inbox` is looking at the sessions where they're awaited. The agent's view of the same set of sessions is its working queue. Calling both "Sessions" leaks an implementation detail; calling both "Inbox" centers what the surface is doing.

URL paths preserve `/sessions/` for stability — links do not break, runtime IPC verbs do not move. Labels in the chrome say Inbox. The substrate name and the surface name are allowed to diverge when the substrate name is more precise and the surface name is more readable.

Sister rule: this is the same shape as `/studio` — a chat surface for a primitive that the substrate calls a `Blueprint`. The user types into a chat; the system thinks in primitives.

## What this replaces

Every prior shape is now a saved view over Sessions:

- The "DMs" panel — gone. Sessions where the participant set is `{me, them}`.
- The "Channels" panel — gone. Sessions scoped to a TRUST or a Company.
- The "Comments" thread on an Idea — gone. The Idea's session, lensed to user/agent/role authors.
- The "Notifications" tray — gone. Sessions with unread messages where you are awaited.
- The "Activity" feed — gone. The same session, lensed to `from_kind=system` messages.

The five-surface unification is the operational consequence of the underlying decision: [Sessions are the universal conversation primitive](/docs/concepts/sessions). The methodology page above describes the conceptual lock; this page describes how that lock pays out across the product surface.

## What's next

- **Search across inboxes.** A single global search bar that ranges over every session you're a participant in. The substrate is uniform; the search predicate becomes the only variable.
- **Awaiting state, properly visible.** A session in `awaiting` state surfaces in the inbox with a typed badge — decision request, blocker, sign-off. Today the marker is a column; tomorrow it is a first-class lens.
- **Channel-bridged inboxes.** When a session is bridged to Telegram or email via `gateway_channel_id`, the inbox renders the same; the participant strip gains an external badge. Already shipped for Telegram; the same lens extends to email and WhatsApp without UI work.

## Related

- [Sessions](/docs/concepts/sessions) — the data primitive every inbox queries.
- [Roles](/docs/concepts/roles) — `message_to(<role>)` routes to the current occupant; the inbox follows the seat.
- [TRUST](/trust) — what a Trust's channels are scoped to.
- [Architect](/docs/methodology/architect) — `/studio` is the same chat-shape applied one turn earlier, before the Company exists.
- [Templates and modules](/docs/architecture/templates-and-modules) — sister methodology page on a different unification (templates compose modules; inboxes compose sessions).
