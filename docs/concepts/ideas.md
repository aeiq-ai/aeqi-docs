# Ideas

Ideas are aeqi's universal data noun: facts, procedures, preferences,
instructions, files, structured records, comments, decisions, and reusable
context. Anything that should persist in the company is an Idea unless it is
another core primitive.

This page is the architectural view of Ideas. For the developer/MCP API surface (search, store, scopes, ranking), see [Memory (Ideas)](/docs/concepts/memory).

## The thesis

Four operating primitives. Everything else is a saved view over Ideas.

A CRM contact is an Idea tagged `kind:customer`. A hiring candidate is an Idea tagged `kind:recruit`. A vendor is an Idea tagged `kind:vendor`. A doc, an SOP, a roadmap entry, an ad copy variant, a press contact — Ideas with different tag conventions, different properties, different views over them.

Notion's exact architecture, applied to a company:

- One universal noun (the page / Idea).
- Structured properties on top.
- Multiple views below.

When tempted to add a primitive (Contact, Customer, Vendor, Document, File, Project, Campaign), stop. It's an Idea.

## Anatomy

Logical shape — the API surface presents a narrower view than the full `aeqi.db` schema. Common fields:

```
ideas(
  id, name, content,
  agent_id, scope, session_id,
  tags[], properties{},
  authored_by, status,
  parent_idea_id,
  created_at, updated_at, expires_at,
  embedding_pending,
  ...
)
```

| Field | Purpose |
|---|---|
| `name` | Stable label. `kind:<x>` is a tag convention, not a column — discriminate views by tag, not by a `kind` field. |
| `content` | Markdown body. Block editor in the dashboard; raw markdown via API. |
| `agent_id` | Anchor agent. Combined with `scope` this controls visibility. |
| `scope` | See [Scope](#scope) below. |
| `session_id` | The comments / activity session for this idea (see below). |
| `tags` | Free-form labels. `kind:*` discriminators live here. |
| `properties` | Typed JSON bag — strings, numbers, dates, selects, multi-selects, relations. The Tables surface reads + writes this. |
| `authored_by` | Who created the idea (agent or user id). |
| `status` | One of `active` (default), `archived`, `superseded`. |
| `parent_idea_id` | Self-referential — Ideas form trees. Children appear under the parent's detail page. |
| `embedding_pending` | Set to 1 between insert and the async embed-worker run; retrieval falls back to BM25-only until it clears. |

The full sqlite schema also carries `expires_at`, `content_hash`, `access_count`, `last_accessed`, `confidence`, `verified_by`, `verified_at`, `last_feedback_at`, `feedback_boost`, `valid_from`, `valid_until`, `time_context`, `wrong_feedback_count`, `assignee`. Most clients don't touch them directly — they're written by the runtime's hotness / dedup / supersession paths.

## Activation

There is no `injection_mode` column. Activation is event-driven:

- An agent's identity, charter, persona, and standing instructions are Ideas tagged `identity` + `evergreen`.
- A `session:start` event handler in the runtime calls `ideas.assemble({names:[…]})` (or `ideas.search`), and the matching ideas are appended to the system prompt.
- "Always-loaded" is a convention layered through that event — not a flag on the row.

`status: archived` hides an idea from default surfaces but keeps it in the FTS index for retrieval. `status: superseded` marks an idea that has been replaced by a newer version; the supersession path is automatic when dedup decides two ideas are the same.

## Scope

`scope` controls who can see an idea. The canonical values match the MCP tool schema:

| Scope | Visibility |
|---|---|
| `self` (default) | The anchor agent only (`agent_id`). |
| `siblings` | The anchor agent and its sibling agents under the same parent. |
| `children` | The anchor agent and its descendants. |
| `branch` | The anchor agent, its ancestors, and its descendants. |
| `global` | Every agent in the entity. `agent_id` is cleared on store. |

Passing any other value to `ideas.store` returns `400 invalid scope`. There is no `domain` / `system` / `entity` scope today — those names predate the role-graph rewrite.

Role titles do not propagate Idea visibility. If Alice and Bob both occupy roles titled `cto`, Alice does
not see Bob's `self` Ideas by virtue of the matching title. Visibility is anchored to concrete `agent_id`
values plus the explicit role DAG and `scope`: a parent can inspect descendant Ideas through the DAG, and
wider sharing must be expressed with `siblings`, `children`, `branch`, or `global`.

## Comments and activity

Every Idea can carry a session. Open the Idea, and below the content is a thread:

- User comments (`from_kind=user`).
- Agent replies (`from_kind=agent`).
- System activity (`from_kind=system` + structured payload — "field changed", "linked to quest", etc.).

This is just [Sessions](/docs/concepts/sessions) lensed over `idea.session_id`. No separate comments table. The session is created lazily on first comment via `messages.message_to` with `target_kind=idea`.

## Tags vs `kind:*`

Tags are free-form metadata. A `kind:customer` Idea might carry tags like `inbound`, `enterprise`, `q3-pipeline`. The `kind:` prefix is a convention the dashboard uses to discriminate views — it lives in the `tags` array, not in a dedicated column.

When a function gets its own rail tab (e.g., a Hiring tab with a stages-kanban), the implementation is "saved view over Ideas tagged `kind:recruit`, plus a `stages` property, plus a board view." The substrate doesn't change — the view does.

## Reserved tags

A small set of tags are load-bearing at the runtime layer. Renaming them silently breaks persona assembly and event-driven context. Keep them stable:

| Tag | What it does |
|---|---|
| `identity` | Marks an agent's persona / system-prompt content. Injected at `session:start`. |
| `evergreen` | Marks an idea as long-lived (skips TTL sweeps). Identity ideas carry both. |
| `personality:<agent_id>` | Stable handle for the Personality tab in the dashboard. Co-exists with `identity`. |
| `procedure` | Written by event handlers that record "this happened" memory. |
| `charter` | Agent / team charter content (used by the Executive Assistant pattern). |
| `aeqi:backfill` | Marker for quest-idea backfills; safe to filter out of search results. |

## When does a function get its own tab?

A function gets a Company-rail tab only when its UI diverges enough from existing tab patterns to deserve a distinct surface. Hiring needs a stages-kanban; Marketing needs a campaign-graph; Customers might just be a saved view in the Ideas tab.

Default: **don't promote**. Promote only when the UI shape is genuinely different.

## Typed properties and views

Ideas carry typed properties on top of `name + content + tags`. Each Idea has a `properties` JSONB bag — strings, numbers, dates, selects, multi-selects — plus a self-referential `parent_idea_id` so Ideas form trees. The Ideas surface in the dashboard renders multiple view modes against the same substrate:

| View | Shape |
|---|---|
| **List** (default) | Linear, ranked rows. The browse-and-search default. |
| **Table** | Sortable columns over flattened properties. The structured-records view. |
| **Kanban** | Lanes by `status` (or any select property). Drag a card across lanes to update the property. |
| **Graph** | Force-directed view of `entity_edges` between Ideas (links, mentions, embeds). |
| **Canvas** | Single-idea editor surface with property chips, children, links, and conversation. |

The view mode is URL-persisted (`?view=list|table|kanban|graph`), so a saved link is a saved view.

The property bag is typed at the view layer, not the schema layer. Adding a new property to one Idea does not migrate the others — it just appears as a column when a view is configured to read it. This is the same shape Notion uses to unify pages and databases.

### Children — Ideas inside Ideas

`parent_idea_id` makes Ideas a tree. An Idea's detail page renders its children below the body — so a "Hiring" Idea can carry `kind:recruit` candidates as children, a "Q3 Roadmap" Idea can carry `kind:roadmap_item` children, and so on. Children are searchable as Ideas in their own right; the parent is just one of their tags.

### Why this is the wedge

CRM, Hiring, Marketing, Docs, Files, SOPs, Roadmaps — every one of these is now expressible as a saved view over Ideas. No new tables, no new primitives, no schema migration per domain. The operating primitive set stays locked while domain coverage expands through view configuration.

When a function eventually deserves its own rail tab (Hiring with a custom kanban shape, say), the underlying data is still Ideas — the rail just renders a tailored view over them.

## Inline links and graph edges

Idea content can create graph edges with wikilink-style syntax:

| Syntax | Relation | Meaning |
|---|---|---|
| `[[X]]` | `mention` | Lightweight reference. The surrounding prose carries the meaning. |
| `![[X]]` | `embed` | Stronger body-level reference. Retrieval and graph ranking treat it as more important than a mention. |

`![[X]]` does not transclude or inline `X`'s content in the editor or read views today. It records an `embed` edge in `entity_edges`; renderers may choose how to display that edge, but the substrate contract is a relation, not content expansion.

## Composition: Quest wraps Idea

A Quest is structured work; an Idea is the artifact. The shape repeats:

- A Quest has `idea_id` — the spec / draft / artifact attached to the work.
- A Project (when shipped) has `idea_id` — the brief.
- A Round (when shipped) has `idea_id` — the term sheet.

Same shape, repeated at every level. See [Composition](/docs/methodology/composition).

## What Ideas are not

- Not files. A file is an Idea tagged `kind:file` with a `properties.cid` pointing to IPFS. The Idea is the wrapper; the file is the artifact.
- Not a task system. Quests are tasks. Ideas hold the spec a Quest works on, but Ideas don't have a workflow status of their own — only the `active` / `archived` / `superseded` lifecycle.
- Not a chat system. Sessions are chat. Ideas can carry a session for comments, but the Idea itself is content, not conversation.

## Storage

Ideas live in `aeqi.db` (FTS5 full-text search + optional vector embeddings) on a per-tenant runtime. Per-tenant means: Ideas don't cross Companies unless you explicitly export/import. The graph of typed edges between Ideas (`mention` / `embed` / `link` / `co_retrieved` / `contradiction`) lives in `entity_edges` in the same database.

## REST ↔ MCP surface

Ideas are reachable via two surfaces, and the split is deliberate:

- **MCP** exposes the agent-facing verbs an agent runs *during* execution: writing the lesson, finding the precedent, opening a graph walk. The unified `ideas` tool routes everything by an `action` field.
- **REST** under `/ideas/*` exposes the UI-facing reads and the surfaces that back live UI streams (activity, comments, subscribe, children, typed properties). These are read-shaped, multi-call, and don't fit a single agent verb.

Both speak to the same store; neither shadows the other.

### MCP — `ideas` tool actions

| `action` | Purpose |
|---|---|
| `store` | Persist an Idea (`name`, `content`, `tags`). Goes through dedup + tag policy. |
| `search` | Tag-routed BM25 + vector retrieval with MMR diversification. |
| `update` | Patch an Idea by id (`name` / `content` / `tags`). |
| `delete` | Remove an Idea by id. |
| `link` | Write a typed edge between two Ideas (`mention` / `embed` / `link`). |
| `feedback` | Record `used` / `useful` / `ignored` / `corrected` / `wrong` / `pinned` to shape future retrieval. |
| `walk` | BFS the idea graph from a starting Idea, filtered by relation set and `strength_threshold`. |

The action enum is pinned by `ideas_mcp_action_enum_drift_guard` in `aeqi-cli/src/cmd/mcp.rs`. Any add/remove/rename fires that test and points back to this table.

### REST — `/ideas/*` endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/ideas` | List Ideas (entity-scoped or agent-filtered). |
| `POST` | `/ideas` | Store a new Idea (same dedup pipeline as MCP `store`). |
| `POST` | `/ideas/files` | Upload a root file-backed Idea with `multipart/form-data`. |
| `GET` | `/ideas/search` | Search endpoint (UI-side counterpart to MCP `search`). |
| `GET` | `/ideas/prefix` | Prefix lookup for picker UIs. |
| `POST` | `/ideas/by-ids` | Batch hydrate Ideas by id list. |
| `GET` | `/ideas/profile` | Idea profile view (tag groups, edges, neighbours). |
| `GET` | `/ideas/graph` | Graph view payload. |
| `POST` | `/ideas/seed` | Bulk-seed Ideas from a preset. |
| `PUT` | `/ideas/{id}` | Update an Idea (MCP `update`). |
| `DELETE` | `/ideas/{id}` | Delete an Idea (MCP `delete`). |
| `POST` | `/ideas/{id}/files` | Upload a file-backed child Idea under an existing Idea. |
| `GET` `POST` `DELETE` | `/ideas/{id}/edges` | Read / add / remove typed edges. |
| `GET` | `/ideas/{id}/activity` | Activity feed (system-emitted rows). |
| `GET` | `/ideas/{id}/comments` | Comments (user/agent session messages). |
| `POST` | `/ideas/{id}/subscribe` | Subscribe to the Idea's session for live updates. |
| `GET` | `/ideas/{id}/children` | Tables-in-Ideas: nested Ideas under a parent. |
| `PUT` | `/ideas/{id}/properties` | Tables-in-Ideas: schema-less property bag. |

File uploads require `agent_id` and a `file` multipart field. They may include
`scope`; child uploads take the parent from the `{id}` path segment. The runtime
stores the artifact through the file pipeline and returns an Idea wrapper so the
uploaded file participates in search, trees, and activity like every other Idea.

The REST surface is pinned by `npm run check:rest-routes` in this repo, which walks `aeqi-platform/src/server.rs` and asserts every registered route is mentioned here or in `docs/api`.

### Why the asymmetry

- `feedback` and `walk` are agent-internal — they shape retrieval quality and graph traversal in ways the UI doesn't need to expose directly.
- `activity` / `comments` / `subscribe` / `children` / `properties` back live UI streams and span multiple round-trips per view; collapsing them under a single MCP `action` would force the agent to re-implement the UI's data-loading shape.

When you add a verb, decide which surface it belongs on. If it's both, wire both — don't make one a thin wrapper around the other.

## Related

- [Memory (Ideas)](/docs/concepts/memory) — developer/MCP surface for search, store, ranking.
- [Sessions](/docs/concepts/sessions) — Idea comments are session messages.
- [Quests](/docs/concepts/quests) — Quests can wrap an Idea via `idea_id`.
- [Composition](/docs/methodology/composition) — the wrapper pattern.
- [Personality as an Idea](/docs/patterns/personality-as-idea) — agent identity lives here too.
