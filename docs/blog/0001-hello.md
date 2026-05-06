# Hello, aeqi

aeqi is the company OS for the agent economy.

The thesis is short: a company is a state machine; it should be implemented as one. The corporate form is a 400-year-old technology running on a deprecated substrate — paper, email, spreadsheets, manual reconciliation between intent and reality. Every institution drifts. The cap table is out of date. The org chart in the wiki doesn't match the org chart in someone's head. The decision in the meeting hasn't propagated to the contract.

This was tolerable when verification was expensive and coordination was local. It is not tolerable when agents come online by the millions and need to participate in companies — to hold roles, sign contracts, move treasury, hire other agents. A document on a wiki is not the right substrate for that. A Slack thread is not the right substrate for that.

aeqi is the substrate.

## What we built

A self-hostable Rust binary. SQLite state. Embedded dashboard. One process runs an entire Company — agents, events, quests, ideas, sessions, channels — under a single tenant, on a single port. No Postgres, no Redis, no message queue. Free to start. Paid to scale.

On top: a chain layer. Every Company is a TRUST — a role-graph smart account on Base. Treasury, governance, ownership, role authority — on-chain, deterministic, enforceable. Cap tables stop being PDFs. They become state.

We picked four primitives and we hold the line:

- **Roles** answer **WHO**. Org-chart slots in an entity, occupied by humans or agents.
- **Events** answer **WHEN**. Signals that wake agents and fire executions.
- **Quests** answer **WHAT**. Structured units of work with goals, worktrees, outcomes.
- **Ideas** answer **HOW**. The universal data noun — knowledge, files, structured records, anything that's stored.

Plus Sessions — the universal conversation primitive — and TRUST — the on-chain identity. Five primitives, no more. Every other word someone tries to add (Customer, Contact, Vendor, Document, Project, Campaign) reduces to a saved view over Ideas.

## How to think about it

Today's products treat agents as bolted-on assistants. aeqi treats them as the substrate.

The capture-and-expand loop:

1. **Capture.** A user types into the inbox, mentions an agent in Telegram, drops an Idea, replies to a thread. Every input modality is a capture point. No idea should die in someone's head for lack of capture surface.
2. **Expand.** Agents pick it up. They draft, schedule, iterate, follow up. They interview the user via Quests and capture answers as Ideas.
3. **Commit.** When the work crosses an authority threshold — a contract to sign, a treasury move, a role to assign — the role graph routes the decision to the right human or governance flow. Sign-off is the gate.

The loop runs. Agents never have custody of your keys. Humans set direction. The chain enforces what was agreed.

## Why now

Three forces converge:

- Models commoditize. We never build models. We ride free model commoditization (DeepSeek, Llama, Qwen) via aeqi-inference — an OpenAI-compat endpoint billed in dollars, not tokens.
- Coordination doesn't shrink. Every new agent online needs a context, a budget, a role, a counterparty. Every coordination event is a capture surface for us. Stripe is "payments." Shopify is "commerce." aeqi is "the company OS."
- Companies become legible. Once a company is a deterministic state machine, legal work targets the system, not the entity. Risk pricing becomes model-based. Integrations become universal because every Company speaks the same grammar.

The marginal cost of forming and operating a company moves toward zero. More ventures become viable on day one. The efficiency frontier of the global economy expands.

## What's shipping right now

- **Click-to-TRUST.** Sign up, pick a blueprint, name it, deploy. End-to-end on-chain registration in about 90 seconds. Production trustsCount: 14+.
- **Agent runtime.** Five primitives live. Agents greet you, open kickoff Quests, ask the right questions to fill in your Company's context.
- **Per-agent OAuth.** Connect Gmail, Calendar, etc. — per agent, scoped, revocable.
- **aeqi-inference.** OpenAI-compatible chat completions. Phase 1 live with DeepInfra.
- **x402.** Pay $19 USDC, get a Company. One HTTP call.
- **Workspace billing.** $49/mo gets you up to 10 Companies, $25 of pooled inference.

## What we don't say

We don't say "DAO" in user-facing copy. A TRUST is a smart account with role-based authority; "DAO" is shorthand we reserve for blog posts and investor calls.

We don't say "autonomous companies" in headlines. The category survives in FAQ tags and Terms boilerplate. The H1 is the canonical positioning: "the company OS for the agent economy." The subline names human direction explicitly. Agents coordinate execution; humans set the direction.

We don't pretend we have features that aren't shipped. If a feature is in flight, it's tagged in the docs.

## Where to go

- [Mission](/docs/mission) — the long form.
- [Getting started](/docs/getting-started/getting-started) — your first Company in 10 minutes.
- [Concepts](/docs/index#concepts--the-canonical-mental-model) — the five primitives.
- [Methodology](/docs/index#methodology--how-aeqi-thinks) — how aeqi thinks about org architecture, agent collaboration, co-creation.

aeqi is an instruction set. The compiler is shipping. Build something that can work without you.
