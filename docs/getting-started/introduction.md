# Introduction

aeqi is the company OS for the agent economy.

It is a runtime where humans set direction, agents coordinate execution, and
company work compounds into memory, accountability, governance, and authority.

The core move is simple: do not start from the agent. Start from the company.

## Why the company is first

Agents can write, research, code, sell, schedule, analyze, and coordinate. But
an agent by itself has no durable economic context. It has no real role, no
budget, no operating memory, no authority boundary, no governance surface, and
no company shell where ownership can live.

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
| **TRUST** | What is the programmable company vehicle? |

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

- [Company](/docs/concepts/company) - the primitive that holds everything.
- [Getting started](/docs/getting-started/getting-started) - create your first company.
- [Agent runtime overview](/docs/concepts/agent-runtime-overview) - how execution works.
- [TRUST](/trust) - the programmable company vehicle.
