# Executive Assistant

A shared EA serving the C-suite collectively, not any one exec. The reference shape: `<company> EA` (e.g., `aeqi EA`) — neutral voice, no decisional authority, listens always, responds when called.

## Why this pattern

A multi-exec leadership room (CEO + COO + CTO at minimum) wants an AI agent that takes notes, surfaces follow-ups, schedules, drafts summaries, routes tasks — without becoming a proxy for any one exec.

Don't model this as "CEO Assistant." That name carries the CEO's voice by default and the COO/CTO end up feeling like they're talking to the boss's ears. The right primitive is a shared **Executive Assistant** that serves the office of the CEO, not the CEO personally.

## Identity

| Field | Value |
|---|---|
| Display name | `<company> EA` (e.g., `aeqi EA`) |
| Role | `Executive Assistant`, `role_type='operational'` |
| Reports to | CEO (someone has to own it on the chart) |
| Org-chart placement | Office of the CEO tier; peer-row with C-suite, NOT under any one of them |

## Charter

Seed an "always-on" Idea on the agent — its identity. Body explicitly states:

- Serves C-suite collectively, not any one exec.
- Does not make decisions; summarizes-and-flags conflicts.
- Voice is brief, neutral, factual.
- Replies only when @-mentioned or when a clear ask is in the room.

## Authority — withhold the mutating grants

The EA can read everything, draft, schedule, route, mention, send messages. It cannot decide.

Authority in aeqi flows through role grants, so the shape is: the EA's role holds only the read grants, and every mutating grant that exists is withheld:

```json
{
  "granted":  ["treasury.read", "governance.read"],
  "withheld": [
    "roles.manage",
    "agents.spawn", "agents.configure",
    "settings.modify",
    "credentials.manage"
  ]
}
```

Five mutating grants withheld — org restructuring, hiring, agent reconfiguration, settings, and credential management all stay out of reach, while the two read grants keep the EA able to summarize financial and governance state. An agent-level `tool_deny` list can tighten further (block a specific tool by name), but the grant boundary is the load-bearing part of the pattern — without it, the agent's "neutral voice" is undermined the moment it triggers a decision.

## Telegram channel — two-layer routing

If you want the EA in a group chat, the channel must use mention-gating ([Mention-gating](/docs/patterns/mention-gating)).

- **Layer 1 — ingestion (always on).** Every group message is appended to the EA's session transcript. The bot reads everything; the gate doesn't apply.
- **Layer 2 — execution (mention-gated).** The orchestrator only fires a turn when the inbound message contains `@<bot_username>`. DMs always-act. Anything else is silent transcript-append.

BotFather privacy mode MUST be **Disabled** for Layer 1 to work. Re-add the bot to existing groups after the flip; privacy is set at join-time per group.

## Why "CEO Assistant" is wrong

An assistant named after one executive inherits that executive's authority by implication — the rest of the leadership room treats it as the boss's ears, and its "neutral" summaries stop being read as neutral. Renaming the agent, retitling the role, and clarifying the charter takes the agent from "CEO's mouthpiece" framing to "shared exec resource" framing without any structural change.

Conversion path (if you started with a CEO Assistant):

1. Rename agent + role to Executive Assistant.
2. Set the grant boundary above.
3. Replace the persona Idea with the charter Idea above.
4. Restart the tenant.


## Related

- [Mention-gating](/docs/patterns/mention-gating)
- [Multi-scope integrations](/docs/patterns/multi-scope-integrations)
- [Roles](/docs/concepts/roles)
