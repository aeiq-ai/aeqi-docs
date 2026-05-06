# Ideas

Ideas are aeqi's universal data noun — **HOW** in the four-primitive model. Facts, procedures, preferences, instructions, files, structured records, comments. Anything that's stored is an Idea unless it's another primitive.

This page is the architectural view of Ideas. For the developer/MCP API surface (search, store, scopes, ranking), see [Memory (Ideas)](/docs/concepts/memory).

## The thesis

Five primitives. Everything else is a saved view over Ideas.

A CRM contact is an Idea with `kind:customer`. A hiring candidate is an Idea with `kind:recruit`. A vendor is an Idea with `kind:vendor`. A doc, an SOP, a roadmap entry, an ad copy variant, a press contact — Ideas with different `kind` tags, different properties, different views over them.

Notion's exact architecture, applied to a company:

- One universal noun (the page / Idea).
- Structured properties on top.
- Multiple views below.

When tempted to add a primitive (Contact, Customer, Vendor, Document, File, Project, Campaign), stop. It's an Idea.

## Anatomy

```
ideas(
  id, entity_id, kind, name, content,
  tags[], properties{}, embedding,
  created_at, updated_at, author_id,
  session_id?         -- the comments session for this idea
)
```

| Field | Purpose |
|---|---|
| `kind` | The discriminator. `note` (default), `customer`, `recruit`, `vendor`, `doc`, `sop`, `quest_outcome`, etc. |
| `name` | Title. |
| `content` | Markdown body. Block editor in the dashboard; raw markdown via API. |
| `tags` | Free-form labels. |
| `properties` | Typed fields (string, number, date, select, multi-select, relation, person/agent). When shipped, this is the database surface. |
| `embedding` | Optional vector for semantic search. |
| `session_id` | The comments session for this idea. |

## Activation modes

Ideas can be loaded into agent context.

| Mode | Behavior |
|---|---|
| `always` | Loaded into every session for the agent that owns this idea. Agent identity, charter, persona, standing instructions live here. |
| `on_demand` | Searchable; loaded when the agent asks for it. Most knowledge. |
| `archived` | Hidden from default views; full-text searchable for retrieval. |

An agent's identity is a set of Ideas with `injection_mode=always`. The agent's "personality" lives in Ideas, not code.

## Scope

| Scope | Visibility |
|---|---|
| `domain` (default) | Project-level — all agents in the entity. |
| `system` | Cross-entity — all agents, every entity (rare; system prompts). |
| `entity` | Agent-specific — only one agent. |

## Comments and activity

Every Idea can carry a session. Open the Idea, and below the content is a thread:

- User comments (`from_kind=user`).
- Agent replies (`from_kind=agent`).
- System activity (`from_kind=system` + structured payload — "field changed", "linked to quest", etc.).

This is just [Sessions](/docs/concepts/sessions) lensed over `idea.session_id`. No separate comments table.

## Tags vs `kind`

`kind` is the discriminator for what view this Idea fits into. Tags are free-form metadata. A `kind:customer` Idea might carry tags like `inbound`, `enterprise`, `q3-pipeline`.

When a function gets its own rail tab (e.g., a Hiring tab with a stages-kanban), the implementation is "saved view over Ideas with `kind:recruit`, plus a stages property, plus a board view." The substrate doesn't change — the view does.

## When does a function get its own tab?

A function gets a Company-rail tab only when its UI diverges enough from existing tab patterns to deserve a distinct surface. Hiring needs a stages-kanban; Marketing needs a campaign-graph; Customers might just be a saved view in the Ideas tab.

Default: **don't promote**. Promote only when the UI shape is genuinely different.

## Typed properties (shipping)

Today Ideas have `name + content + tags`. The next lift is **typed properties** — strings, numbers, dates, selects, multi-selects, relations, person/agent references — plus typed views (table, board, gallery, timeline, list). Same lift Notion did to unify pages and databases.

When typed properties ship, "saved view over Ideas" becomes "Notion-style database query." The page surface stays the same; the property substrate enables ad-hoc structured records.

Until then: properties is a JSON blob. Don't promise typed-DB UX in user-facing copy beyond "Ideas with tags."

## Composition: Quest wraps Idea

A Quest is structured work; an Idea is the artifact. The shape repeats:

- A Quest has `idea_id` — the spec / draft / artifact attached to the work.
- A Project (when shipped) has `idea_id` — the brief.
- A Round (when shipped) has `idea_id` — the term sheet.

Same shape, repeated at every level. See [Composition](/docs/methodology/composition).

## What Ideas are not

- Not files. A file is an Idea with `kind:file` and a `properties.cid` pointing to IPFS. The Idea is the wrapper; the file is the artifact.
- Not a task system. Quests are tasks. Ideas hold the spec a Quest works on, but Ideas don't have status.
- Not a chat system. Sessions are chat. Ideas can carry a session for comments, but the Idea itself is content, not conversation.

## Storage

Ideas live in `aeqi.db` (FTS5 full-text search + optional vector embeddings) on a per-tenant runtime. Per-tenant means: Ideas don't cross Companies unless you explicitly export/import.

## Related

- [Memory (Ideas)](/docs/concepts/memory) — developer/MCP surface for search, store, ranking.
- [Sessions](/docs/concepts/sessions) — Idea comments are session messages.
- [Quests](/docs/concepts/quests) — Quests can wrap an Idea via `idea_id`.
- [Composition](/docs/methodology/composition) — the wrapper pattern.
