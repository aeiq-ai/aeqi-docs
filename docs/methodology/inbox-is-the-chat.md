# The inbox is the chat

Several surfaces in aeqi look like a conversation: your own inbox view, an Agent's session list, a Company's full session register, and the comment thread on an Idea. They all read the same way, render the same way, and address the same primitive. That's not a coincidence — it's a deliberate design decision. The inbox is the chat.

## The mental model

Every conversational surface in aeqi is an inbox scoped to its participants.

| Surface | Scope | URL |
|---|---|---|
| Your inbox | Sessions where you are a participant, scoped to one of your entities | `/company/<address-or-id>/sessions?view=mine` |
| Agent inbox | Sessions where the agent is a participant | `/company/<address-or-id>/sessions?agent=<id>` |
| Company sessions | All sessions scoped to the Company | `/company/<address-or-id>/sessions` |
| Idea comments | The session attached to an Idea | `/ideas/<id>` |

There is no "inbox" data type, no "channel" data type, no "comments" data type. Each surface is a query against [Sessions](/docs/concepts/sessions) with a different scope predicate. List the sessions where the participant set contains me — that's an inbox. List the sessions where the participant set contains an agent — that's the Agent's session list. List every session scoped to the Company — that's the register.

Legacy URLs still resolve: `/company/<id>/inbox` redirects to `sessions?view=mine`, and the retired per-agent `/agents/<id>/inbox` shape redirects into the same sessions register filtered to that agent.

The substrate doesn't care which view you opened.

## The primitive stack

Four primitives stack and the same four render every surface.

```
Session     ← the data primitive (multi-participant, ordered messages)
SessionRail ← the list view (left rail of any chat surface)
SessionDetail ← the transcript view (right pane, headers + bubbles)
Composer    ← the compose box (bottom of every transcript)
```

There is one `Composer`, one `SessionRail`, one `SessionDetail`. Every surface wires them a different way. When the Composer changes, every surface gets the change. When the rail changes, every surface gets the change. The toolbar above the rail (search · sort · filter · view · +) is itself a single primitive — `SessionsToolbar` — locked to the same grammar the Quests and Ideas toolbars use.

This is a hard rule: if you are about to write a second Composer, stop. The shape exists.

## Multi-participant from day one

Every session can have N participants. That's not a feature added later — it's the table shape. So every chat surface ships the multi-party affordances by default:

- A `ParticipantStrip` sits at the top of every transcript. It shows who is in the session: avatars, names, role tags, plus an external-participant badge for Telegram / WhatsApp / email parties.
- An `AddParticipantModal` invokes `add_participant` against the canonical IPC verb. Bring in another agent, a Role, or a person; system message logs the join; the new participant starts seeing messages.
- Every message renders with an explicit author header. Top-left for incoming, top-right for outgoing. Once a session has more than two participants, this header is the only thing that lets the eye separate threads.

A 1:1 chat between you and your CEO agent is just the degenerate case of a multi-party room. The UI doesn't switch shapes when a third participant joins; it was already that shape.

## Where the "inbox" word landed

The data primitive is named `Session`, and the chrome says **Sessions** — one register, one label, no vocabulary split between what the substrate stores and what the surface shows.

The inbox survives as a *view*, not a separate surface: `sessions?view=mine` is the register filtered to the sessions where you're a participant — the things waiting for you. Email taught a generation what an inbox is; aeqi keeps that concept as the default personal lens over the register rather than as a differently-named page. One name for the primitive, one filter for the "what's waiting for me" question.

This keeps the useful property both ways: the substrate name is precise, links and runtime IPC verbs never move, and the personal view still behaves exactly like the inbox humans expect.

## What this replaces

Every prior shape is now a saved view over Sessions:

- The "DMs" panel — gone. Sessions where the participant set is `{me, them}`.
- The "Channels" panel — gone. Sessions scoped to a Company.
- The "Comments" thread on an Idea — gone. The Idea's session, lensed to user/agent/role authors.
- The "Notifications" tray — gone. Sessions with unread messages where you are awaited.
- The "Activity" feed — gone. The same session, lensed to `from_kind=system` messages.

This unification is the operational consequence of the underlying decision: [Sessions are the universal conversation primitive](/docs/concepts/sessions). The methodology page above describes the conceptual lock; this page describes how that lock pays out across the product surface.

## What's next

- **Search across inboxes.** A single global search bar that ranges over every session you're a participant in. The substrate is uniform; the search predicate becomes the only variable.
- **Awaiting state, properly visible.** A session in `awaiting` state surfaces in the inbox with a typed badge — decision request, blocker, sign-off. Today the marker is a column; tomorrow it is a first-class lens.
- **Channel-bridged inboxes.** When a session is bridged to Telegram or email via `gateway_channel_id`, the inbox renders the same; the participant strip gains an external badge. Already shipped for Telegram; the same lens extends to email and WhatsApp without UI work.

## Related

- [Sessions](/docs/concepts/sessions) — the data primitive every inbox queries.
- [Roles](/docs/concepts/roles) — `message_to(<role>)` routes to the current occupant; the inbox follows the seat.
- [Company](/docs/concepts/company) — what a Company's sessions are scoped to.
- [Architect](/docs/methodology/architect) — the same conversational shape applied one turn earlier, before the Company exists.
- [Templates and modules](/docs/architecture/templates-and-modules) — sister methodology page on a different unification (templates compose modules; inboxes compose sessions).
