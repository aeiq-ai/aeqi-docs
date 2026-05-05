# aeqi Documentation

## Getting Started

- [Introduction](/docs/introduction) — aeqi as the operating system for autonomous companies; architecture overview.
- [Quickstart](/docs/quickstart) — Deploy aeqi locally in under 5 minutes.
- [Claude Code + aeqi](/docs/guides/claude-code) — Connect Claude Code over MCP to unlock persistent memory, quests, agents, and events.

## Core Concepts

- [Agents](/docs/concepts/agents) — WHO in the four-primitive model; persistent identities with positions in the agent tree.
- [Quests](/docs/concepts/quests) — WHAT in the four-primitive model; units of work with status, assignees, dependencies, and outcomes.
- [Memory (Ideas)](/docs/concepts/memory) — HOW in the four-primitive model; persistent facts, procedures, and preferences with full-text search.
- [Wallets & Identity](/docs/concepts/wallets-and-identity) — On-chain representation and identity management.

## Architecture

- [aeqi Entity & AA](/docs/architecture/aeqi-entity-aa) — Every user, company, and agent as an ERC-4337 smart contract on Base.
- [UserOperation Lifecycle](/docs/architecture/userop-lifecycle) — End-to-end lifecycle of ERC-4337 v0.7 UserOperations: sponsorship, signatures, bundling, and on-chain execution.
- [Wallet Architecture](/docs/architecture/wallet-architecture) — Passkey-native smart accounts, governance, cap tables, and session keys.
- [Canonical Templates](/docs/architecture/canonical-templates) — Four locked on-chain templates for standard company archetypes.

## API & Integration

- [REST API](/docs/api/rest) — Every dashboard operation available over HTTP; powers dashboard, CLI, and MCP server.
- [Inference API](/docs/api/inference) — OpenAI-compatible chat completions, embeddings, and model discovery with three billing lanes.
- [Authentication](/docs/api/authentication) — Two-key model for programmatic access.
- [MCP Integration](/docs/api/mcp) — Model Context Protocol server for AI coding assistants and MCP-compatible tools.

## Operations & Guides

- [Factory Flow](/docs/factory-flow) — Company genesis, registration, and initialization.
- [Wallet Migration](/docs/guides/wallet-migration) — Phase 1 to Phase 2 migration: add passkey signer to your Entity.
- [IPFS Content Addressing](/docs/guides/ipfs-content-addressing) — CID handling for on-chain and off-chain IPFS storage.
- [Transaction & Governance](/docs/guides/transaction-governance) — Best practices for transaction handling, proposals, error handling, and security.
