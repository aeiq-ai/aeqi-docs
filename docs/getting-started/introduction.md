# Introduction

AEQI is an agent runtime — it deploys, orchestrates, and manages persistent AI agents that work autonomously on your behalf.

## Four Primitives

| Primitive | What it is |
|-----------|-----------|
| **Agent** | Persistent identity with memory, capabilities, and a place in a hierarchy |
| **Quest** | A unit of work — trackable, assignable, with dependencies and outcomes |
| **Idea** | Knowledge — facts, procedures, preferences, instructions. Agents accumulate these over time |
| **Event** | A reaction rule — when pattern X fires, run action Y |

These four primitives compose into everything: a scheduled report is an event that creates a quest. A delegated task is a quest assigned to a child agent. An agent's personality is a set of ideas with `injection_mode` set.

## How It Works

1. **You create a company** — your workspace on the platform
2. **Agents are hired** from templates (or spawned by other agents)
3. **Quests drive work** — created by you, by events, or by other agents
4. **Ideas accumulate** — agents learn from their work and store knowledge for future sessions
5. **Events automate** — lifecycle hooks and schedules keep things running without you

## Architecture

AEQI is a single Rust binary. The daemon, web server, and dashboard UI are all embedded. SQLite is the only storage dependency — no Postgres, no Redis, no message queue.

```
aeqi start
├── daemon (orchestration, workers, scheduler)
├── web server (REST API on /api)
└── dashboard UI (embedded via rust-embed)
```

For the hosted platform at [app.aeqi.ai](https://app.aeqi.ai), each company gets an isolated runtime with its own database, agent tree, and budget controls.

## Next Steps

- [Quickstart](/docs/quickstart) — get running in 5 minutes
- [Installation](/docs/installation) — all installation methods
- [API & MCP](/docs/api/authentication) — connect programmatically
