# Data

The aeqi runtime's storage model. Two SQLite databases per tenant. No Postgres, no Redis, no message queue.

## Two databases

| Database | Tables | What |
|---|---|---|
| `aeqi.db` | `entities`, `agents`, `roles`, `role_edges`, `ideas`, `events`, `channels`, `credentials`, `runtime_placements` (in some deployments) | The state substrate — who, what, where, why. |
| `sessions.db` | `sessions`, `session_participants`, `session_messages`, `quests` | The execution substrate — conversations, work, transcripts. |

Quests live in `sessions.db` (NOT `aeqi.db` — common mistake). Ideas live in `aeqi.db`.

## Core tables (aeqi.db)

### entities

```sql
entities(
  id                TEXT PRIMARY KEY,  -- UUID; the workspace/Company id
  type              TEXT NOT NULL,     -- 'company' today
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL,     -- unique
  parent_entity_id  TEXT?,             -- REFERENCES entities(id)
  owner_user_id     TEXT?,
  metadata          TEXT NOT NULL,     -- JSON, default '{}'
  created_at        TEXT NOT NULL,
  updated_at        TEXT?
)
```

Fresh entity_id at creation, distinct from any agent or role UUID. The runtime row lives here.

### agents

```sql
agents(
  id          TEXT PRIMARY KEY,
  entity_id   TEXT NOT NULL REFERENCES entities(id),
  name        TEXT,
  model       TEXT?,                -- preferred LLM
  capabilities TEXT?,               -- JSON tool permissions
  status      TEXT,                 -- 'active' | 'paused' | 'retired'
  created_at  INTEGER
)
```

Agents are entity-owned assets. `parent_id` is GONE (legacy). An agent's tree position is determined by which Roles it occupies and the role DAG.

### roles + role_edges

```sql
roles(
  id, entity_id, title, occupant_kind, occupant_id,
  role_type        -- 'director' | 'operational' | 'advisor'
)

role_edges(parent_role_id, child_role_id)
```

Authority via recursive CTE on demand. No ACL table. See [Roles](/docs/concepts/roles).

### ideas

```sql
ideas(
  id, entity_id, kind, name, content,
  tags, properties, embedding,
  created_at, updated_at, author_id,
  session_id?
)
```

FTS5 virtual table for full-text search. Optional vector embeddings for semantic retrieval. Hybrid ranking combines BM25 + vector cosine + temporal decay.

### events

```sql
events(
  id, agent_id?,                  -- NULL = global; visible to every agent
  name, pattern,                  -- what the rule matches
  scope,                          -- default 'self'
  tool_calls,                     -- JSON: the actions to run on fire
  enabled, cooldown_secs,
  last_fired?, fire_count,
  total_cost_usd, system,
  created_at
)
```

An events row is a standing reaction rule — a pattern plus the tool calls to
run when it matches — not a log line. Events are workflows, not an append-only
log: their first-class job is to fire actions, and `last_fired` / `fire_count`
track firing history. See [Events](/docs/concepts/events).

### channels

```sql
channels(
  id, agent_id, kind,            -- telegram | whatsapp | email | slack
  bot_token (encrypted),
  allowed_chats[],
  on_mention,                     -- behavior: 'fire_turn' | 'spawn_from_template:<slug>'
  config (JSON)
)
```

A channel attaches to an agent and bridges to sessions via `gateway_channel_id`.

### credentials

```sql
credentials(
  scope_kind,                     -- Entity | Role | Agent
  scope_id,
  provider,                       -- google | slack | github | stripe | telegram
  name,                           -- 'oauth_token' | 'api_key' | etc.
  data (encrypted)
)
```

Lookup precedence: Agent > Role > Entity, narrowest wins. See [Multi-scope integrations](/docs/patterns/multi-scope-integrations).

## Core tables (sessions.db)

### sessions

```sql
sessions(
  id, agent_id?, session_type, name, status,
  gateway_channel_id?,            -- bridge to a channel (Telegram, etc.)
  awaiting_at?,                   -- legacy, scheduled for removal
  created_at, updated_at
)
```

A session is multi-participant; participants live in their own table.

### session_participants

```sql
session_participants(
  session_id, identity_kind,      -- user | agent | role | external
  identity_id,
  joined_at, joined_by,
  history_visibility,             -- 'full' default
  PRIMARY KEY (session_id, identity_kind, identity_id)
)
```

Adding someone is an explicit verb. See [Sessions](/docs/concepts/sessions).

### session_messages

```sql
session_messages(
  id, session_id,
  from_kind,                      -- user | agent | role | system
  from_id,
  role,                           -- legacy llm role tag (user/assistant/...)
  content, payload?,
  timestamp, sender_id
)
```

`from_kind` discriminates message author. `from_kind=system` → activity row (state changes, tool calls). `from_kind ∈ {user, agent, role}` → comment/message.

### quests

```sql
quests(
  id, entity_id, agent_id,
  subject, description,
  status,                         -- backlog | todo | in_progress | in_review | done | cancelled
  priority,
  parent_id?, depends_on?,
  idea_id?,                       -- the artifact this work produces or refines
  outcome?,                       -- one-line summary on close
  created_at, updated_at
)
```

Quest wraps Idea. See [Composition](/docs/methodology/composition).

## Indexes & FTS

- `ideas_fts5` virtual table over `ideas.name + content`.
- B-tree on `events(kind, fired_at)`, `quests(entity_id, status)`, `session_messages(session_id, timestamp)`.
- Optional `vec0` index on `ideas.embedding` when embeddings are enabled.

## Migrations

Forward-only migrations under `crates/aeqi-orchestrator/migrations/`. The runtime applies them at startup before opening the API. Never drop a column without a migration; never rename in-place.

Legacy agent-ancestry columns and tables are gone; fresh spawns mint three distinct UUIDs (entity, agent, role).

## Backups

A backup is a file copy. Stop writes briefly (or use SQLite's online backup API), copy the two `.db` files plus the encrypted credentials KEK wrap, done.

```bash
sqlite3 /var/lib/aeqi/<entity_id>/aeqi.db ".backup /backup/aeqi.db"
sqlite3 /var/lib/aeqi/<entity_id>/sessions.db ".backup /backup/sessions.db"
```

Restore is the reverse — drop the new files in place and restart the service.

## Per-tenant isolation

Each tenant runtime has its own data directory; the platform proxy routes the per-request Company selector (`X-Company`, fallback `X-Entity`) to the right tenant and the runtime never sees other tenants' data. The data directory's location depends on whether the tenant runs sandboxed or in-host:

| Placement | systemd unit | Data directory |
|---|---|---|
| **sandbox** (containerized) | `aeqi-sandbox-<entity_id>.service` | `/var/lib/aeqi/containers/<entity_id>/aeqi.db` |
| **host** (in-host) | `aeqi-host-<entity_id>.service` | Resolved from the environment the unit configures (`~/.aeqi/aeqi.db` under the unit's home directory) |

## Related

- [Runtime](/docs/architecture/runtime)
- [Roles](/docs/concepts/roles)
- [Sessions](/docs/concepts/sessions)
- [Events](/docs/concepts/events)
- [Memory (Ideas)](/docs/concepts/memory)
