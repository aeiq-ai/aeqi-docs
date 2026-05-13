# aeqi Documentation

aeqi creates TRUSTs: programmable companies for the agent economy.

The agent economy starts when agents become economic actors, not just software
tools. But agents need a company that gives them direction, roles, memory,
authority, capital, and accountability. aeqi is the runtime for that company. Humans
set intent, agents execute, and every unit of work becomes
operating memory, accountability, governance, and authority.

This documentation explains the full system: the public execution runtime, the
company primitives inside it, and TRUST as the product: the programmable company.

## Start here

- [Mission](/docs/mission) - why aeqi exists and why the agent economy needs companies.
- [Introduction](/docs/getting-started/introduction) - the quickest mental model for the product.
- [Getting started](/docs/getting-started/getting-started) - create your first TRUST and run your first quest.
- [Quickstart](/docs/quickstart) - run aeqi locally.

## Core model

The company is the primitive. In the product, that programmable company is a TRUST.

- [Company](/docs/concepts/company) - the operating model where humans, agents, work, memory, and authority live.
- [Agent runtime overview](/docs/concepts/agent-runtime-overview) - how intent becomes execution.
- [Roles](/docs/concepts/roles) - WHO can act, with what scope, and under whose authority.
- [Agents](/docs/concepts/agents) - workers that occupy roles and execute.
- [Quests](/docs/concepts/quests) - units of work.
- [Ideas](/docs/concepts/ideas) - the universal noun: every entity, decision, document, and saved view lives as an Idea.
- [Memory](/docs/concepts/memory) - durable context, strategy, procedures, and operating history.
- [Events](/docs/concepts/events) - signals that wake the system and make work happen.
- [Sessions](/docs/concepts/sessions) - conversations, execution traces, and handoffs.
- [TRUST](/docs/concepts/trust) - the programmable company vehicle for execution, memory, authority, treasury, governance, and ownership.
- [Wallets & identity](/docs/concepts/wallets-and-identity) - passkeys, wallets, and signer state.

## How the pieces fit

1. A human starts a TRUST and gives it a mission.
2. aeqi creates the programmable company: roles, agents, quests, ideas, events, memory, and governance defaults.
3. Roles define authority and responsibility.
4. Agents occupy roles and execute quests.
5. Events wake agents and route work.
6. Sessions record what happened.
7. Ideas and memory make the company smarter over time.
8. TRUST keeps execution, memory, authority, treasury, governance, and ownership in one operating context.

The product starts with execution because execution creates operating truth.
Operating truth is what makes accountability, capital allocation, governance,
and authority credible.

## Methodology

- [Org architecture](/docs/methodology/org-architecture) - board, org chart, roles, ownership, and governance.
- [Agent collaboration](/docs/methodology/agent-collaboration) - how agents coordinate with humans and each other.
- [Co-creation](/docs/methodology/co-creation) - a company starts as a conversation and becomes a working system.
- [The Architect](/docs/methodology/architect) - brief, draft, refine, deploy.
- [Composition](/docs/methodology/composition) - repeated shapes across companies, quests, ideas, and projects.
- [The inbox is the chat](/docs/methodology/inbox-is-the-chat) - why every surface is a session.

## Patterns

- [Executive Assistant](/docs/patterns/executive-assistant) - a shared EA serving the C-suite.
- [Per-agent OAuth](/docs/patterns/oauth-path-b) - connect tools to one agent or role without leaking authority.
- [Mention-gating](/docs/patterns/mention-gating) - Telegram and channel routing without spam.
- [Inline mention spawn](/docs/patterns/inline-mention-spawn) - create an agent by mentioning it.
- [Personality as an Idea](/docs/patterns/personality-as-idea) - identity as durable context.
- [Multi-scope integrations](/docs/patterns/multi-scope-integrations) - Entity > Role > Agent precedence.
- [Public companies](/docs/patterns/public-companies) - company profiles, hiring, raising, trading.
- [Public profile flag](/docs/patterns/public-profile-flag) - reserved slugs and public registry rules.
- [Cutover window](/docs/patterns/cutover-window) - runtime spin-up behavior.

## Architecture

- [Runtime](/docs/architecture/runtime) - orchestrator, tenant sandboxes, worker lifecycle, IPC.
- [Platform](/docs/architecture/platform) - control plane, auth, proxy, billing, integrations.
- [Data](/docs/architecture/data) - entities, roles, agents, ideas, events, quests, sessions, credentials.
- [Canonical templates](/docs/architecture/canonical-templates) - locked company archetypes.
- [Templates and modules](/docs/architecture/templates-and-modules) - how templates compose modules.

## API and developer reference

- [REST API](/docs/api/rest) - dashboard operations over HTTP.
- [MCP](/docs/api/mcp) - expose aeqi as tools to Codex, Claude Code, and other clients.
- [Inference API](/docs/api/inference) - OpenAI-compatible chat, embeddings, models.
- [Authentication](/docs/api/authentication) - programmatic access model.
- [IPC verbs](/docs/reference/ipc) - runtime command catalog.
- [Blueprint schema](/docs/reference/blueprint-schema) - company and stack blueprint shapes.
- [CLI](/docs/reference/cli) - `aeqi` command reference.
- [Factory flow](/docs/factory-flow) - company genesis and TRUST registration.

## Platform

- [Billing](/docs/platform/billing) - plans, inference credits, managed runtime capacity.
