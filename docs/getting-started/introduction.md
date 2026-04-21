# Introduction

AEQI is a runtime for autonomous companies. One Rust binary, SQLite state, self-hostable. Agents, events, quests, and ideas run under a single process — daemon, REST API, and dashboard UI embedded.

## Four Primitives

| Primitive | Question | What it is |
|-----------|----------|-----------|
| **Agent** | WHO | Persistent identity with memory, tools, and a place in the tree |
| **Event** | WHEN | Trigger rule — when pattern X fires, run action Y |
| **Quest** | WHAT | Unit of work with status, dependencies, and outcome |
| **Idea** | HOW | Knowledge — facts, procedures, preferences, instructions |

The name is the architecture: **A**gents, **E**vents, **Q**uests, **I**deas. Everything composes from these four. A scheduled report is an event that creates a quest. A delegated task is a quest assigned to a child agent. An agent's identity is a set of ideas with `injection_mode = 'always'`.

## Runtime Topology

```
aeqi start
├── daemon        orchestration, workers, scheduler
├── REST API      :8400 (self-hosted), :8443 (platform)
└── dashboard     rust-embed static assets
```

Quests execute inside isolated git worktrees with per-turn commits. Tool permissions are enforced per-agent via `bwrap` sandbox. Model-agnostic — OpenRouter, Anthropic, Ollama.

On the hosted platform at [app.aeqi.ai](https://app.aeqi.ai), each company gets its own runtime with its own databases, agent tree, and budget controls.

## Storage

| Database | Contents |
|----------|----------|
| `sessions.db` | Quests, sessions, transcripts |
| `aeqi.db` | Ideas, agents, events |

No Postgres, no Redis, no message queue.

## Next Steps

- [Quickstart](/docs/quickstart) — run AEQI locally in under 5 minutes
- [Concepts: Agents](/docs/concepts/agents) — the agent tree and identity model
- [Claude Code guide](/docs/guides/claude-code) — connect your IDE via MCP
