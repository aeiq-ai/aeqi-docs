# Introduction

aeqi is the Company OS for the agent economy.

It is a runtime where humans set direction, agents execute inside roles, and
company work compounds into memory, accountability, governance, and authority.

The core move is simple: do not start from the agent. Start from the company.

## Why the company is first

Agents can write, research, code, sell, schedule, analyze, and coordinate. But
an agent by itself has no durable economic context. It has no real role, no
budget, no operating memory, no authority boundary, no governance surface, and
no programmable company where ownership can live.

A company gives agents that context.

In aeqi, a company is not a folder or workspace. It is an operating shell that
contains the primitives needed to run:

| Primitive | What it answers |
|---|---|
| **Company** | Where does the work belong? |
| **Roles** | Who can act, and with what authority? |
| **Agents** | Who executes? |
| **Quests** | What work needs to be done? |
| **Ideas / Memory** | What does the company know? |
| **Events** | When should the system wake up? |
| **Sessions** | What happened, who participated, and what changed? |

You may see `TRUST` in lower-level docs and API references. It is the
runtime/protocol vehicle behind a Company, especially where authority,
treasury, governance, ownership, or signer state are involved.

## The execution loop

The runtime turns intent into execution:

```
Human intent
  -> company context
  -> role-scoped authority
  -> agent execution
  -> quest outcome
  -> session trace
  -> ideas and memory
  -> accountability, governance, authority
```

This loop is why aeqi is more than task management. The work does not vanish
into chat history. It becomes company state.

## What you can do today

On the hosted platform, a Company can:

- hold its mission, roles, agents, quests, ideas, events, sessions, and memory
- run agent work through scoped sessions instead of loose chat
- expose API and MCP tools so local AI clients can use company context
- keep an operating history that future authority and governance can act on

Treasury, ownership, and on-chain authority are deployment-dependent protocol
surfaces. The product starts with the runtime because runtime history is the
source of truth those surfaces need.

## Hosted and self-hosted

On the hosted platform at [app.aeqi.ai](https://app.aeqi.ai), each company gets
its own managed runtime with isolated state, agents, quests, sessions, and
budget controls.

For local or self-hosted use, aeqi runs as one Rust binary with embedded
dashboard, REST API, MCP server, and SQLite state.

```
aeqi start
├── daemon        orchestration, workers, scheduler
├── REST API      dashboard and programmatic access
├── MCP server    tools for agent clients
└── dashboard     company control plane
```

## What comes next

- [Company](/docs/concepts/company) - the product surface that holds everything.
- [Getting started](/docs/getting-started/getting-started) - create your first Company.
- [Agent runtime overview](/docs/concepts/agent-runtime-overview) - how execution works.
- [TRUST](/docs/concepts/trust) - the protocol/runtime vehicle.
