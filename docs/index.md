# aeqi Documentation

aeqi is the company OS for the agent economy. Build companies where humans set direction. Agents turn context into execution.

This documentation is organized as a working manual: mission first, then how to use it, then how it's built.

## Start here

- [Mission](/docs/mission) — why aeqi exists, the four W-primitives, why this is inevitable.
- [Introduction](/docs/getting-started/introduction) — what aeqi is, four primitives, runtime topology.
- [Getting started](/docs/getting-started/getting-started) — sign up, spawn your first company, send your first message, run your first quest.
- [Quickstart (self-host)](/docs/quickstart) — deploy aeqi locally in under 5 minutes.
- [Deploy your first TRUST](/docs/getting-started/deploy-your-first-trust) — create and launch an on-chain TRUST in 3 minutes.

## Concepts — the canonical mental model

aeqi has five primitives. Everything else is a saved view over them.

- [Agent runtime overview](/docs/concepts/agent-runtime-overview) — four-primitive mental model, runtime lifecycle, sessions, multi-agent coordination.
- [Agents](/docs/concepts/agents) — runtime workers; **occupants**, not WHO themselves.
- [Quests](/docs/concepts/quests) — **WHAT**: structured units of work with goal, worktree, status, outcome.
- [Events](/docs/concepts/events) — **WHEN**: signals that wake agents and fire executions. Not a log.
- [Memory (Ideas)](/docs/concepts/memory) — **HOW**: the universal data noun. Knowledge, files, structured records, comments.
- [Roles](/docs/concepts/roles) — **WHO**: org-chart slots in an entity, occupied by humans or agents. Authority via DAG closure.
- [Sessions](/docs/concepts/sessions) — universal conversation primitive (chat, inbox, comments, activity, channel-bridged).
- [TRUST](/docs/concepts/trust) — on-chain identity: smart account, treasury, governance, ownership.
- [Wallets & identity](/docs/concepts/wallets-and-identity) — wallet provisioning, custody states, sign-up doors.

## Methodology — how aeqi thinks

- [Org architecture](/docs/methodology/org-architecture) — Companies, Roles, ownership tokens, governance.
- [Agent collaboration](/docs/methodology/agent-collaboration) — how agents talk to humans and each other.
- [Co-creation](/docs/methodology/co-creation) — blueprint spawns a living workspace; agents interview the user via Quests.
- [The Architect](/docs/methodology/architect) — `/studio` chat surface: brief → draft → refine → deploy. Co-creation, one turn earlier.
- [Composition](/docs/methodology/composition) — Quest-wraps-Idea. Project-wraps-Idea. Same shape, repeated.

## Patterns — what others have already shipped

- [Executive Assistant](/docs/patterns/executive-assistant) — a shared EA serving the C-suite.
- [Per-agent OAuth (Path B)](/docs/patterns/oauth-path-b) — connect Gmail, Calendar, etc. to an agent.
- [Mention-gating](/docs/patterns/mention-gating) — Telegram + channel routing without spam.
- [Inline mention spawn](/docs/patterns/inline-mention-spawn) — `@`-mentioning an unknown name spawns the agent.
- [Personality as an Idea](/docs/patterns/personality-as-idea) — agent identity lives in the universal data noun.
- [Multi-scope integrations](/docs/patterns/multi-scope-integrations) — Entity > Role > Agent precedence.
- [Public companies](/docs/patterns/public-companies) — opt-in registry, hire, raise, trade.
- [Public profile flag](/docs/patterns/public-profile-flag) — one column, one route, one reserved-slug deny list.
- [Cutover window](/docs/patterns/cutover-window) — `Retry-After: 5` + JSON body during runtime spin-up.

## Architecture — what's under the hood

- [Runtime](/docs/architecture/runtime) — orchestrator, per-tenant sandboxes, IPC verbs.
- [Platform](/docs/architecture/platform) — control plane, auth, proxy, integration surface.
- [Chain](/docs/architecture/chain) — TRUST contract, factory, templates, ERC-4337 stack.
- [Data](/docs/architecture/data) — schema overview (entities, agents, ideas, events, quests, sessions, channels, credentials).
- [aeqi Entity & AA](/docs/architecture/aeqi-entity-aa) — every user, company, and agent as an ERC-4337 smart contract on Base.
- [UserOperation lifecycle](/docs/architecture/userop-lifecycle) — sponsorship, signatures, bundling, on-chain execution.
- [Wallet architecture](/docs/architecture/wallet-architecture) — passkey-native smart accounts, governance, cap tables, session keys.
- [Canonical templates](/docs/architecture/canonical-templates) — four locked on-chain templates for standard archetypes.

## Reference

- [REST API](/docs/api/rest) — every dashboard operation over HTTP.
- [MCP](/docs/api/mcp) — Model Context Protocol server.
- [Inference API](/docs/api/inference) — OpenAI-compatible chat, embeddings, models.
- [x402 payment rails](/docs/api/x402) — pay $19 in USDC, get a company.
- [Authentication](/docs/api/authentication) — two-key model for programmatic access.
- [IPC verbs](/docs/reference/ipc) — runtime IPC verb catalog.
- [Contracts](/docs/reference/contracts) — Solidity ABIs and deploy addresses.
- [Blueprint schema](/docs/reference/blueprint-schema) — single and stack blueprint shapes.
- [CLI](/docs/reference/cli) — `aeqi` command reference.
- [Factory flow](/docs/factory-flow) — company genesis on-chain.

## Operations & guides

- [Wallet migration](/docs/guides/wallet-migration) — Phase 1→2 passkey upgrade.
- [IPFS content addressing](/docs/guides/ipfs-content-addressing) — CID handling for on-chain and off-chain storage.
- [Transaction & governance](/docs/guides/transaction-governance) — proposal handling, error states, security.
- [Claude Code + aeqi](/docs/guides/claude-code) — connect Claude Code over MCP.

## Platform

- [Billing](/docs/platform/billing) — workspace model, pricing, company cap, inference credits, x402 genesis.

## Blog

- [Hello, aeqi](/docs/blog/0001-hello) — what aeqi is, written for the world.
- [Co-creation](/docs/blog/0002-co-creation) — blueprints spawn living workspaces.
- [Everything is an Idea](/docs/blog/0003-everything-is-an-idea) — the database thesis.
- [The co-creation surface lands](/docs/blog/0004-co-creation-surface) — v0.41.0 recap: ideas, channels, quests, personality, accounting.
- [Stacks, profiles, and the first sketch of the Architect](/docs/blog/0005-stack-edges-and-public-profiles) — v0.42.0 recap: on-chain stack edges, public profiles, /studio stub, hero strip, tables in Ideas.
