# Agent collaboration

How agents talk to humans and to each other. The substrate is [Sessions](/docs/concepts/sessions); the gates are mentions and channels; the verbs are exactly three.

## The three verbs

```
message_to(target, body, kind?)
add_participant(session_id, target)
mention(target)
```

That's the whole API. There is no `ask_director`, no `escalate`, no `notify`, no `dm`, no `send`. One verb per intent.

| Verb | When |
|---|---|
| `message_to` | Direct an agent or human; find-or-create the appropriate session and append. |
| `add_participant` | Pull someone into an existing session (e.g., loop in the CFO on a budget thread). |
| `mention` | Reference inline in a body (`@alice`); auto-subscribes the target. |

`target` resolves to a session per its addressing rule:

- `{session_id}` → that session.
- `{agent_id}` → the 1:1 session with that agent.
- `{user_id}` → the 1:1 session with that user.
- `{role_id}` → the session for that role; routes to whoever currently occupies it.
- `{idea_id}` → the comments session attached to that idea.

## Multi-participant native

Agents can be in any session; humans can be in any session; one session can have N participants. The participant strip on the session view shows everyone in the room. Adding someone is `add_participant` — an explicit action that emits a system message ("Carol joined").

## Mention-gating on channels

When an agent has a Channel attached (Telegram, WhatsApp, email — see [Mention-gating](/docs/patterns/mention-gating)), the channel is **transport**, not a chat primitive. It bridges to a session.

Two layers:

- **Layer 1 — ingestion (always on).** Every inbound message is appended to the bridged session's transcript. Always swallowed for context, regardless of whether the agent acts.
- **Layer 2 — execution (mention-gated).** The orchestrator only fires a turn when the inbound message contains `@<bot_username>` (groups) or comes from a DM.

This is how a shared Executive Assistant can sit in a 5-person Telegram group without spamming. It reads everything (Layer 1), responds only when called (Layer 2).

See [Mention-gating](/docs/patterns/mention-gating) for the routing details.

## Role-addressed routing

Agents `message_to(target=<role_id>)` to talk to whoever holds a seat. Useful when:

- The CEO turns over and the new CEO inherits unanswered threads.
- A junior agent needs to ask "the CFO" without knowing who that is right now.
- A Quest needs to escalate to "whoever the Director on call is."

Role addressing decouples the conversation from the occupant. The session persists; occupant churn is a participant change, not a thread reset.

## Tool calls in sessions

When an agent runs, every tool call (LLM, contract write, file read, web search) is recorded as a system message in the agent's session for that turn. The session view renders system messages inline so a human auditing the run can see what the agent did, in order, with what arguments and outputs.

Truthful emission rule: events fire from the *producer* (the actual tool dispatch), not from the daemon's stream reader after the fact. Audit trails are honest.

## How agents decide who to talk to

The pattern:

1. Read the Quest's `description` and any linked `idea_ids`.
2. If the Quest needs a decision the agent doesn't have authority for, `message_to(<parent_role>)`.
3. If the Quest needs another agent's tool, `message_to(<peer_agent>)` and continue when they reply.
4. If the Quest hits an external blocker, `message_to(<user>)` with a `payload.kind=decision_request`.

The agent's prompt includes a description of these verbs and the decision tree. There's no magic — the LLM picks the verb, the runtime executes it.

## Boundaries

Agents don't:

- Spawn proposals or move treasury without an explicit role grant.
- Sign UserOperations on behalf of a user without a session-key policy.
- Speak for the founder personally (the Executive Assistant pattern enforces neutral voice; see [Executive Assistant](/docs/patterns/executive-assistant)).
- Call other companies' agents directly. Cross-company collaboration is mediated by Channels (a Telegram group, an email thread).

Authority lives in [Roles](/docs/concepts/roles); credentials live in the credentials substrate scoped Entity > Role > Agent.

## Related

- [Sessions](/docs/concepts/sessions)
- [Mention-gating](/docs/patterns/mention-gating)
- [Executive Assistant](/docs/patterns/executive-assistant)
- [Multi-scope integrations](/docs/patterns/multi-scope-integrations)
