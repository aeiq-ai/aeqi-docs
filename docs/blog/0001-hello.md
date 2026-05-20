# Hello, aeqi

aeqi creates TRUSTs: programmable companies for the agent economy.

The thesis is short: a company is a state machine; it should be implemented as one. The corporate form is a 400-year-old technology running on a deprecated substrate — paper, email, spreadsheets, manual reconciliation between intent and reality. Every institution drifts. The cap table is out of date. The org chart in the wiki doesn't match the org chart in someone's head. The decision in the meeting hasn't propagated to the contract.

This was tolerable when verification was expensive and coordination was local. It is not tolerable when agents come online by the millions and need to participate in companies — to hold roles, sign contracts, move treasury, hire other agents. A document on a wiki is not the right substrate for that. A Slack thread is not the right substrate for that.

aeqi is the substrate.

## What we built

A self-hostable Rust binary. SQLite state. Embedded dashboard. One process can run a TRUST - agents, roles, events, quests, ideas, sessions, and memory - under a single tenant. Source-available to inspect and self-host; hosted access opens through the launch plans.

On top: a protocol layer. Every TRUST can carry treasury, governance, ownership, and role authority as programmable state. Cap tables stop being disconnected PDFs. They become company state.

We picked four operating primitives and we hold the line:

- **Agents** answer **WHO EXECUTES**. Software workers that occupy roles and run scoped work.
- **Events** answer **WHEN**. Signals and records that wake agents and preserve what happened.
- **Quests** answer **WHAT**. Structured units of work with goals, worktrees, outcomes.
- **Ideas** answer **HOW**. The universal data noun: knowledge, files, structured records, anything the company stores.

Roles define authority, Sessions carry conversation, and TRUST is the
programmable company vehicle. Every other word someone tries to add (Customer,
Contact, Vendor, Document, Project, Campaign) reduces to a saved view over
Ideas.

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
- Coordination doesn't shrink. Every new agent online needs a context, a budget, a role, a counterparty. Every coordination event is a capture surface for us. Stripe is "payments." Shopify is "commerce." aeqi is "programmable companies."
- Companies become legible. Once a company is a deterministic state machine, legal work targets the system, not the entity. Risk pricing becomes model-based. Integrations become universal because every Company speaks the same grammar.

The marginal cost of forming and operating a company moves toward zero. More ventures become viable on day one. The efficiency frontier of the global economy expands.

## What's shipping right now

- **Click-to-TRUST.** Sign up, pick a blueprint, name it, deploy. The launch path creates the company runtime and anchors the TRUST through the protocol path as the rollout stage allows.
- **Agent runtime.** The core primitives are live. Agents greet you, open kickoff Quests, ask the right questions, and build the company's context.
- **API and MCP.** The same company state is reachable from the web UI, REST API, and MCP clients.
- **aeqi-inference.** OpenAI-compatible chat completions for agent execution.
- **Payments and billing.** Hosted plans and usage-based inference are staged so companies can pay for the runtime and the work it performs.

## What we don't say

We don't say "DAO" in user-facing copy. A TRUST is a smart account with role-based authority; "DAO" is shorthand we reserve for blog posts and investor calls.

We don't say "autonomous companies" in headlines. The category survives in FAQ tags and Terms boilerplate. The current canonical positioning is: "programmable companies for the agent economy." The subline names human direction explicitly. Agents execute; humans set the direction.

We don't pretend we have features that aren't shipped. If a feature is in flight, it's tagged in the docs.

## Where to go

- [Product overview](/docs/overview) — the product shape.
- [Getting started](/docs/getting-started/getting-started) — your first Company in 10 minutes.
- [Concepts](/docs/concepts/agent-runtime-overview) — the core model.
- [Methodology](/docs/methodology/org-architecture) — how aeqi thinks about org architecture, agent collaboration, co-creation.

aeqi is an instruction set. The compiler is shipping. Build something that can work without you.
