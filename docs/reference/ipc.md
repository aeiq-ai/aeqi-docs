# IPC verbs

The aeqi runtime exposes two related surfaces:

| Surface | Where | Shape |
|---------|-------|-------|
| **MCP tool catalog** | `/api/mcp`, Codex/Claude Code | Action-based: `tool(action='…', …)` |
| **Internal IPC handlers** | Unix socket, platform proxy | Many `handle_<verb>` functions in `aeqi-orchestrator::ipc` |

The MCP catalog is the stable, externally-callable surface — it's what dashboards, CLIs, and MCP clients use. The internal handlers are implementation details the runtime uses to talk to itself, the platform, and the dashboard; they shift more often.

## MCP tool catalog (stable)

Every MCP tool takes an `action` parameter plus tool-specific args. Caller-kind ACLs (`Llm` / `Event` / `System`) are enforced inside `ToolRegistry::invoke` before the tool's `execute()` runs.

| Tool | Actions | Description |
|------|---------|-------------|
| `me` | `profile`, `permissions` | Authenticated actor + runtime metadata. |
| `agents` | `get`, `hire`, `retire`, `list`, `projects` | Runtime workers, delegation targets, project registry. |
| `ideas` | `store`, `search`, `update`, `delete`, `link`, `feedback`, `walk` | Durable memory, decisions, idea graph. |
| `quests` | `create`, `list`, `show`, `update`, `close`, `cancel` | Work ledger. |
| `events` | `create`, `list`, `enable`, `disable`, `delete`, `trigger`, `trace` | Pattern handlers, lifecycle automation. |
| `code` | `search`, `context`, `impact`, `diff_impact`, `file`, `file_summary`, `stats`, `index`, `incremental`, `synthesize` | Code intelligence graph. |
| `sessions` | `search` | Read-only FTS5 search over session transcripts (calling-agent scoped). |

Internal-only tools that don't appear on the MCP surface (event-only or system-only callers):

- `session.info` — emit canonical session metadata for an event handler.
- `budgets` — read-only budget queries (set as `event_only` in `tools/mod.rs`).
- `shell`, `code` (system bash/grep helper), `web` — LLM utility tools registered in the orchestrator's `tools/mod.rs`.

## Internal IPC handlers

The runtime's IPC bus exposes the lower-level handlers below. Most clients won't call these directly — they're invoked by the platform proxy when forwarding `/api/*` traffic into a Company runtime.

### Entities + agents

| Module | Handlers |
|--------|----------|
| `ipc/entities.rs` | `handle_entities` (returns `{ ok, roots: [...] }`), `handle_create_entity`, `handle_update_entity`, `handle_delete_entity`, plus per-Company view CRUD (`handle_list_views`, `handle_upsert_views`, `handle_delete_view`) |
| `ipc/entity_agents.rs` | `handle_create_default_agent`, `handle_update_default_agent` |
| `ipc/agents.rs` | `handle_agents_registry`, `handle_agent_children`, `handle_agent_spawn`, `handle_agent_delete`, `handle_agent_set_status`, `handle_agent_info`, `handle_agent_identity`, `handle_save_agent_file`, `handle_budget_policies`, `handle_create_budget_policy`, `handle_set_can_ask_director`, `handle_agent_recent_inference_calls` |
| `ipc/templates.rs` | `handle_list_templates`, `handle_template_detail`, `handle_spawn_template`, `handle_spawn_template_into_entity` — back the company-template catalog and spawn. (There is no `ipc/roots.rs` or `ipc/blueprints.rs` module.) |
| `ipc/roles.rs` | role CRUD, occupancy, parent edges |

### Ideas, quests, events

Each lives in its own module (`ipc/ideas.rs`, `ipc/quests.rs`, `ipc/events.rs`). The MCP `ideas` / `quests` / `events` tools delegate into these handlers, so the catalog above is the user-facing contract — the IPC names will shift as the orchestrator refactors.

### Sessions + messaging

`ipc/sessions.rs` + `ipc/messages.rs` implement the canonical conversation primitive. The three semantic verbs locked by [`architecture_session_primitive.md`](/) are:

- `message_to` — append a message to a target's session (target may be `session_id`, `agent_id`, `user_id`, `role_id`, or `idea_id`).
- `add_participant` — add a participant to an existing session.
- `mention` — inline mention; auto-subscribes the target.

These are runtime-internal verbs. From MCP/REST you reach them through the proxied runtime endpoints (`/api/sessions/*`, `/api/chat`, `/api/chat/stream`), not as MCP tool actions.

### Inbox

`ipc/inbox.rs` — `handle_inbox`, `handle_answer_inbox`, `handle_dismiss_inbox`. Backs the cross-Company inbox at `/me/inbox`.

### Channels + credentials

| Module | Handlers |
|--------|----------|
| `ipc/channels.rs` | Configure inbound channel gateways (Telegram, WhatsApp, email). |
| `ipc/credentials.rs` | Per-agent OAuth tokens (Google, GitHub) — written by the platform OAuth callback. |

### Files + VFS

`ipc/files.rs` + `ipc/vfs.rs` — list/upload/read/delete files in an agent's working tree.

### Architect

`ipc/architect.rs` — the Architect agent's `draft` and `refine` verbs. (The `deploy` verb is platform-side and lives at `POST /api/architect/deploy`, not in the IPC surface.)

### Status + seed

`ipc/status.rs` — runtime health snapshot.
`ipc/seed.rs` — `handle_seed_ideas` for bootstrapping fresh installs.

## On-chain verbs (planned)

The on-chain protocol layer (Company registration, treasury transfers, governance proposals) is shipped as Solana programs under `projects/aeqi-solana/programs/` (`aeqi-factory`, `aeqi-company`, `aeqi-governance`, `aeqi-treasury`, plus module programs) but is **not yet exposed as IPC verbs** from the orchestrator. Today these flow through:

- **Platform-side** — `POST /api/companies/create` (Solana company genesis), the `/api/solana/*` operation routes, and orchestrator-internal calls into `solana_provisioner` / `dao_provisioner`.

Per the protocol roadmap, the next slice exposes `treasury.transfer`, `treasury.swap`, `governance.propose`, `governance.vote`, `governance.execute`, and `trust.update` as first-class verbs gated by role authority. The doc that landed earlier listing them as already-shipped IPC verbs was aspirational — they don't yet exist in the orchestrator's IPC module.

## Authority gates

For shipped verbs, authority checks happen inside the handler (or, for tools, inside `ToolRegistry::invoke`):

- **Agent verbs** — caller must occupy a role with authority over the target agent (transitive closure on `role_edges`).
- **Role verbs** — caller must hold a Director role or be the role's current occupant.
- **Quest verbs** — caller must be the assignee, the assignee's authority chain, or the entity's Director.
- **Sessions** — anyone can `message_to` a session they participate in; `add_participant` requires authority over the target.

Once on-chain verbs land, they will be board-tier gated (treasury / governance / TRUST writes).

## Tool deny lists

An agent can have a `tool_deny[]` array on its definition that blocks specific verbs even when the agent's role grants them. Used heavily in the [Executive Assistant](/docs/patterns/executive-assistant) pattern (18 decisional tools blocked):

```json
{
  "tool_deny": [
    "agents.hire", "agents.retire",
    "quests.close", "quests.cancel",
    "ideas.delete"
  ]
}
```

The deny list is checked inside `ToolRegistry::invoke` after the ACL but before `execute()`. A denied call returns the stable `tool_denied` reason code.

## Truthful emission

Events fired during verb execution emit from the verb's actual side-effect point, not from a higher-level wrapper. This matters for stream observability: `session:quest_end` fires when the runtime marks the quest done, not when the daemon stream reader sees the row update downstream.

## Related

- [REST API](/docs/api/rest) — HTTP surface for the platform.
- [MCP](/reference/mcp) — Model Context Protocol catalog (the stable external surface).
- [Authentication](/docs/api/authentication) — JWT and API key models.
