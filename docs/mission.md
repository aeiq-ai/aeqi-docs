# Mission

> "The goal is to capture the pure stream of thought from the user and execute upon it. All the ideas in someone's head — all the output the human can produce in the most simple manner — is captured and then expanded into the most powerful execution possible." — Luca Eich, founder

## Why aeqi exists

The corporate form is a 400-year-old technology. It runs on a deprecated substrate — paper, email, spreadsheets, manual reconciliation between intent and reality. Every institution drifts. The cap table is out of date. The org chart in someone's head doesn't match the org chart in the wiki. The decision in the meeting hasn't propagated to the contract.

A company is a state machine. Today it is implemented in text. Text guarantees ambiguity. Ambiguity guarantees drift.

The agent economy makes this untenable. Agents need an institutional substrate that is unambiguous: roles, authority, treasury, decisions, contracts — all encoded in a way that both humans and agents can read and act on. A document on a wiki is not that substrate. A Slack thread is not that substrate. A spreadsheet is not that substrate.

aeqi is that substrate.

## What we're building

aeqi is the company OS for the agent economy. It captures human cognition at the lowest possible friction — text, voice, mention, idea, message, channel — and ladders it up into the highest possible execution: Quests run, Ideas become specs, specs become agreements, agreements become on-chain commitments, commitments become deliverables, deliverables become company outcomes.

Humans set direction. Agents turn context into execution.

The product is two halves:

1. **The runtime.** A self-hostable Rust binary that runs an autonomous company — agents, events, quests, ideas, sessions, channels — under a single process. SQLite state. No Postgres, no Redis, no message queue. Free to start, paid to scale.
2. **The chain.** Every Company is a TRUST: a role-graph smart account on Base. Treasury, governance, ownership, role authority — all on-chain. Cap tables stop being PDFs. They become deterministic state.

The wedge: agents are the executor layer; humans are the prompter layer. Today's products treat agents as bolted-on assistants. aeqi treats them as the substrate.

## The four W-primitives

Every coordination question reduces to one of four:

| Primitive | Question | What it is |
|-----------|----------|-----------|
| **Roles** | WHO | Org-chart slot inside an entity. Occupied by a human, an agent, or vacant. |
| **Events** | WHEN | Signal, trigger, cause. A webhook, a cron, another agent finishing. |
| **Quests** | WHAT | Structured work unit with a goal and a worktree. Picked up, shipped, closed. |
| **Ideas** | HOW | Instructions, memory, strategy, context. Knowledge an agent carries into a session. |

The execution flow: an event fires, an agent wakes, loads ideas, picks up a quest, executes, emits new events, the loop continues. The recursion: a sub-agent's sub-agents are themselves agents with their own events, quests, and ideas. The shape is identical at every level.

A fifth primitive is the universal noun for everything that gets stored: the **Idea**. CRM contacts, hiring candidates, marketing campaigns, vendor records, SOPs, files — all Ideas with different `kind` tags and views over them. Notion's exact architecture, applied to a company.

## The on-chain thesis

A company runtime that lives only in a database is software, not an institution. To be an institution, the rules must be enforceable. To be enforceable, they must be on-chain.

Every Company in aeqi is a **TRUST** — a Solana smart account, controlled by a secp256r1 passkey, with native fee payment from the program. The TRUST holds:

- **The treasury** — SOL, USDC (Token-2022), other SPL tokens. Roles can spend within budget; the board can move freely.
- **The role graph** — directors, executives, contributors, advisors. Authority is the transitive closure over `role_edges` — a DAG, not a tree, because boards are flat sets at the top.
- **Ownership tokens** — the cap table. Equity issuance, vesting, cliffs, transfer restrictions, all native.
- **Governance** — proposals, votes, execution queue. The board can table a proposal; quorum + timelock executes it.
- **Agent runtime hooks** — on-chain attestation that a runtime agent acted on behalf of a role. Optional layer.

A TRUST is not a multisig. Squads is a threshold signature program; we add a role graph, governance, vesting, and an agent runtime on top of (or instead of) a 1-of-N signer set. A TRUST is not a DAO. "DAO" implies token-vote governance as the primary mechanism; a solo-founder TRUST has no token and no governance module enabled. A TRUST is general-purpose: pick the template, get the right configuration.

## Capture and expand

The product is a capture-and-expand loop.

**Capture** is a low-friction surface: an inbox, an Ideas wall, a chat, a Telegram message, an email, an OAuth integration. Every input modality is a capture point. No idea should die in someone's head for lack of capture surface.

**Expand** is what agents do once captured: draft, schedule, iterate, follow up, route, propose, sign. They interview the user via Quests, capture answers as Ideas, then act on the Ideas.

The user provides direction; agents execute. The Co-creation release (v0.41.0) makes this loop legible — a blueprint spawns not a static company shell but a living workspace with kickoff Quests, seeded Ideas, and agents already greeting the user.

## Why this is inevitable

Three forces converge:

1. **Models commoditize.** OpenAI's moat is the API endpoint, not the weights — and even the endpoint commodities downward. We never build models. We ride free model commoditization (DeepSeek, Llama, Qwen).
2. **Coordination doesn't.** Stripe is "payments." Shopify is "commerce." aeqi is "the company OS." The category exists because coordination doesn't shrink — it grows. Every new agent that comes online needs a context, a budget, a role, a counterparty. Every coordination event is a capture surface for us.
3. **Companies become legible.** Once a company is a deterministic state machine, legal work targets the system, not the entity. Risk pricing becomes model-based. Integrations become universal because every company speaks the same grammar. The marginal cost of forming and operating a company moves toward zero.

When institutions compile into code, the entire coordination stack becomes programmable.

aeqi is the compiler.

## What aeqi is not

- Not a chatbot platform. Chat is one of many capture surfaces.
- Not a workflow tool. Quests are work, not workflow steps; agents decide the workflow.
- Not a Notion / Linear / Slack clone. Those are surfaces; aeqi is the substrate they would all collapse into.
- Not a custodial wallet provider. We never hold keys. The TRUST contract holds treasury funds; you (or your agents) sign UserOperations.
- Not a DAO platform. A TRUST is a smart account with role-based authority; "DAO" is a marketing word we don't use in product copy.
- Not autonomous-without-oversight. Humans set direction. Agents coordinate execution. The thesis demands both.

## Founding voice

> "We literally build the most simple primitive-capable runtime to be able to do anything. Most importantly, we allow it to modify itself according to the requirements of the user. It will guide the user. It will be guided. And it will run an efficient operation to achieve goals — it evolves."

> "Classy design. Superior product. After MVP, the next stage is the capital formation step: the on-chain cap table and internet capital markets."

> "No idea should die in someone's head for lack of capture surface."

## Where to next

- [Getting started](/docs/getting-started) — sign up and spawn your first company.
- [Primitives](/docs/index#primitives--the-canonical-mental-model) — the four W-primitives in detail.
- [Co-creation](/docs/methodology/co-creation) — how a blueprint becomes a living workspace.
- [TRUST](/docs/primitives/trust) — the on-chain primitive.
