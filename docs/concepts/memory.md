# Ideas and Memory

Ideas are the durable knowledge objects inside an aeqi company. Memory is what
the company becomes as ideas, sessions, events, quests, and outcomes accumulate.

This is where work compounds.

## What counts as an idea

An idea can be:

- a strategy
- a fact
- a procedure
- a customer note
- a file
- a decision
- a policy
- a research finding
- a product requirement
- an agent identity note
- a standing instruction
- a reusable operating pattern

The name is intentionally broad. The company needs one universal noun for
context.

## Why memory matters

Most companies leak context. Decisions vanish into chat, procedures become stale,
and new contributors start from zero.

aeqi treats memory as operating infrastructure. Agents can retrieve what the
company knows, add what they learn, and carry context forward into future work.

That makes the company smarter over time.

## How ideas activate

There is no "mode" flag on an idea. Activation is event-driven. When a session
starts, a `session:start` handler in the runtime assembles the relevant ideas —
an agent's identity and standing instructions (ideas tagged `identity` +
`evergreen`) plus anything retrieved for the work at hand — and appends them to
the system prompt. "Always-loaded" is just a convention layered through that
event, not a property of the row.

So agent identity reads as evergreen identity ideas; company strategy as
evergreen ideas; quest-specific context as ideas attached to the quest. The
mechanism is the same retrieval-and-assembly path in every case. For the
developer view of scopes, ranking, and the MCP/REST surface, see
[Ideas](/docs/concepts/ideas).

## Memory and accountability

Memory is not only for better answers. It is the beginning of operating truth.

When a company preserves:

- the instruction
- the context
- the role
- the agent
- the work trace
- the outcome

then contribution becomes inspectable. That is the foundation for future
compensation, governance, authority, and capital allocation.

## Related

- [Company](/docs/concepts/company)
- [Quests](/docs/concepts/quests)
- [Sessions](/docs/concepts/sessions)
- [Agent runtime overview](/docs/concepts/agent-runtime-overview)
