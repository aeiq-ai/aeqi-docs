# IPC verbs

Internal verbs callable from the platform's IPC bus or by other runtime subsystems. Each verb is also exposed over HTTP at `/api/<verb>` for use by the dashboard, CLI, MCP, and external clients.

## Catalog

### Agents

| Verb | What |
|---|---|
| `agents.spawn` | Hire a new agent. Args: `template`, `entity_id`, `role_id?`, `name?`. |
| `agents.list` | List agents in the current entity. Filter by `status`, `role_id`. |
| `agents.update` | Update name, model, capabilities, or status. |
| `agents.delete` | Retire (soft delete) or hard delete. |

### Roles

| Verb | What |
|---|---|
| `roles.create` | Create a role. Args: `entity_id`, `title`, `role_type`, `parent_role_id?`. |
| `roles.update` | Update title or `role_type`. Cannot change `entity_id`. |
| `roles.delete` | Delete a role. Denied if occupied. |
| `roles.assign` | Bind an occupant. Args: `role_id`, `occupant_kind`, `occupant_id`. |
| `roles.unassign` | Vacate the role. |
| `roles.invite_create` | Issue an invite (vacant → human occupant). |
| `roles.invite_send` | Email the invite (no-op if SMTP not configured). |

### Quests

| Verb | What |
|---|---|
| `quests.create` | New quest. Args: `subject`, `description`, `priority`, `agent_id?`, `idea_id?`, `parent?`, `depends_on?`. |
| `quests.assign` | Assign to an agent. |
| `quests.update` | Change priority, description, status. |
| `quests.close` | Close with outcome. |
| `quests.list` | List quests. Filter by `status`, `agent_id`, `priority`. |

### Events

| Verb | What |
|---|---|
| `events.subscribe` | Register a detector (pattern → tool calls). |
| `events.fire` | Manually emit an event. |
| `events.list` | Query historical events. |

### Ideas

| Verb | What |
|---|---|
| `ideas.store` | Create or update an Idea. |
| `ideas.search` | Hybrid search (BM25 + vector + temporal). |
| `ideas.list` | List Ideas, filterable by `kind`, `tags`. |
| `ideas.delete` | Delete an Idea. |

### Sessions

| Verb | What |
|---|---|
| `message_to` | Append a message to a target's session. Target: `session_id` \| `agent_id` \| `user_id` \| `role_id` \| `idea_id`. |
| `add_participant` | Add a participant to an existing session. |
| `mention` | Inline mention; auto-subscribes the target. |

These three are the canonical conversation verbs. There is no `ask_director`, `escalate`, `notify`, `dm`, or `send`.

### Channels

| Verb | What |
|---|---|
| `channels.upsert` | Configure a channel (Telegram, WhatsApp, email). |
| `channels.delete` | Remove. |

### Credentials

| Verb | What |
|---|---|
| `credentials.ingest` | Persist OAuth tokens (called by platform OAuth callback). |
| `credentials.lookup` | Internal: find by `(scope, provider, name)` precedence. |
| `credentials.delete` | Remove a credential. |

### Treasury

| Verb | What |
|---|---|
| `treasury.transfer` | Execute treasury transfer (gated by role / session-key policy). |
| `treasury.swap` | Swap tokens via integrated AMM. |

### Governance

| Verb | What |
|---|---|
| `governance.propose` | Draft a proposal. |
| `governance.vote` | Cast a vote on an active proposal. |
| `governance.execute` | Execute a passed + timelocked proposal. |

### TRUST

| Verb | What |
|---|---|
| `trust.register` | On-chain `Factory.registerTRUST` call. |
| `trust.update` | Update IPFS metadata (operating agreement). |

## Authority gates

Each verb checks authority before executing:

- **Agent verbs** — caller must occupy a role with authority over the target agent (transitive closure on `role_edges`).
- **Role verbs** — caller must hold a Director role or be the role's current occupant.
- **Quest verbs** — caller must be the assignee, the assignee's authority chain, or the entity's Director.
- **Treasury / Governance / TRUST** — board-tier authority required.
- **Sessions** — anyone can `message_to` a session they participate in; `add_participant` requires authority over the target.

## Tool deny lists

An agent can have a `tool_deny[]` array that blocks specific verbs even if the agent's role grants them. Used heavily in the [Executive Assistant](/docs/patterns/executive-assistant) pattern (18 decisional tools blocked).

```json
{
  "tool_deny": [
    "treasury.transfer", "treasury.swap",
    "governance.propose", "governance.vote", "governance.execute",
    ...
  ]
}
```

## Truthful emission

Events fired during verb execution emit from the verb's actual side-effect point, not from a higher-level wrapper. This matters for stream observability — `quest.completed` fires when the runtime marks the quest done, not when the daemon stream reader sees the row update.

## Related

- [REST API](/docs/api/rest) — HTTP surface for all verbs.
- [MCP](/docs/api/mcp) — Model Context Protocol.
- [Authentication](/docs/api/authentication).
