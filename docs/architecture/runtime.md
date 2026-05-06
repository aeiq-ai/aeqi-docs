# Runtime

The aeqi runtime is a Rust process that orchestrates a single Company. It runs the agents, executes Quests, fires Events, holds Ideas, manages Sessions, bridges Channels.

One binary. Per-tenant. Self-hostable.

## Topology

```
aeqi-platform                          aeqi (runtime)
  ↑ HTTPS                                 :8400+ per tenant
  | proxy                                  ↑
  | by entity_id  ─────────────►  one runtime per Company
  ↑                                       │
external client                            ├── orchestrator
(dashboard, MCP, API caller)               ├── REST API
                                           ├── IPC server
                                           ├── scheduler
                                           ├── channel gateway
                                           └── workers
```

A runtime hosts ONE Company's data and agents. The platform spawns and manages tenant runtimes; clients hit the platform proxy and get routed to the right runtime by `entity_id`.

## What lives in the runtime

| Component | Responsibility |
|---|---|
| **Orchestrator** | Picks up events, routes to detectors, dispatches tool calls, runs agent turns. |
| **REST API** | HTTP surface for the dashboard, CLI, MCP server. `:8400+`. |
| **IPC server** | Internal verbs callable from in-process subsystems and the platform's IPC bus. |
| **Scheduler** | Walks the active scheduled events every minute; fires due cron ticks. |
| **Channel gateway** | Long-poll / webhook bridges for Telegram, WhatsApp, etc. Bridges inbound to sessions. |
| **Workers** | Per-Quest execution. Worktree-isolated when running code. |
| **Embedded UI** | rust-embed static assets — the dashboard SPA. |

All in one process. No separate services to wire.

## Storage

Two SQLite databases per tenant:

| DB | Contents |
|---|---|
| `sessions.db` | Quests, sessions, transcripts. The execution substrate. |
| `aeqi.db` | Ideas, agents, events, roles, role_edges, channels, credentials. The state substrate. |

The repo-root `agents.db` is a 0-byte stub — historical artifact. Agents live in `aeqi.db`.

No Postgres, no Redis, no message queue. Two SQLite files per tenant; backups are file copies.

## Quest execution

A Quest in `pending` is picked up by the assigned agent's worker:

1. Worker creates an isolated git worktree for the Quest.
2. Worker opens a session for the Quest (linked via `idea_id`).
3. Worker loads the agent's `injection_mode=always` Ideas plus any explicit `idea_ids` on the Quest.
4. Worker dispatches turns: LLM call → tool calls → state updates → repeat.
5. Each turn's state is committed to the worktree (per-turn commits — replayable, auditable).
6. On completion, worker records an outcome, closes the session's `awaiting`, marks Quest `done`.

Tool permissions are enforced per-agent via `bwrap` sandbox. Network, filesystem, and contract-write access are gated.

## Multi-tenant isolation

Per-tenant runtimes (`aeqi-host-<entity_id>.service`) isolate by:

- **Process** — each tenant is a separate systemd unit on a separate port.
- **Filesystem** — each tenant has its own data directory under `/var/lib/aeqi/<entity_id>/`.
- **Network** — bound to `127.0.0.1:<port>`, fronted by the platform proxy.
- **Credentials** — per-tenant encrypted credentials substrate; platform never sees plaintext.

This is the canonical deploy topology (locked 2026-04-29, retiring the older shared `aeqi-runtime.service`).

## Self-host

Self-host runs a single-tenant runtime (no platform proxy, no per-tenant spawn). The same binary, same APIs, same UI — just bound to localhost.

```bash
aeqi setup
aeqi start  # binds 8400, dashboard at http://127.0.0.1:8400
```

See [Quickstart](/docs/quickstart) for the full local dev path.

## IPC verbs

Internal verbs callable from the platform's IPC bus or by other runtime subsystems:

- `agents.spawn`, `agents.list`, `agents.update`, `agents.delete`
- `roles.create`, `roles.update`, `roles.assign`, `roles.unassign`
- `quests.create`, `quests.assign`, `quests.close`
- `events.subscribe`, `events.fire`
- `ideas.store`, `ideas.search`, `ideas.update`
- `message_to`, `add_participant`
- `channels.upsert`, `channels.delete`
- `credentials.ingest`, `credentials.lookup`

See [IPC verbs](/docs/reference/ipc) for the full catalog.

## Model providers

Model-agnostic. Configure via:

```bash
aeqi secrets set OPENROUTER_API_KEY sk-or-...
aeqi secrets set ANTHROPIC_API_KEY sk-ant-...
aeqi secrets set OLLAMA_HOST http://localhost:11434
```

Per-agent `model` field picks which provider to use; defaults inheritable from parent role/entity.

The aeqi-platform's hosted runtime exposes [aeqi-inference](/docs/api/inference) — an OpenAI-compatible endpoint that routes through DeepInfra for open-weights models. Self-host runtimes hit upstream providers directly.

## Embed

The dashboard SPA is `rust-embed`'d into the binary. No separate npm install on the deploy host. `aeqi start` serves UI + API from the same port.

For UI-only iteration:

```bash
cd aeqi/apps/ui
npm run build
rsync dist/ /home/claudedev/aeqi-platform/ui-dist/
```

Skips the Rust rebuild when only TS/CSS changed. See `/docs/guides/claude-code` for hosted dev tips.

## Observability

| Signal | Where |
|---|---|
| Logs | systemd journal (`journalctl -u aeqi-host-<id>.service`). |
| Metrics | Prometheus endpoint at `:8400/metrics` (when feature-enabled). |
| Traces | OpenTelemetry export (configurable). |
| Events | All internal events queryable via `GET /api/events`. |

## Related

- [Platform](/docs/architecture/platform)
- [Data](/docs/architecture/data)
- [IPC verbs](/docs/reference/ipc)
- [Quickstart](/docs/quickstart)
