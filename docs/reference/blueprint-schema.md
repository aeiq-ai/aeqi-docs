# Blueprint schema

A blueprint is a JSON manifest describing a TRUST starter kit: one root agent plus seed agents, events, ideas, quests, and roles. The runtime spawns a fresh TRUST from this manifest in one IPC call.

The canonical Rust type is `aeqi_orchestrator::ipc::blueprints::Blueprint`. The on-disk JSON in `aeqi/presets/blueprints/*.json` is the source of truth for editing. The current public catalog embeds only `aeqi.json`; the other manifests are draft inventory until they pass a fresh product and protocol audit.

## Shape

```jsonc
{
  "slug": "aeqi",
  "name": "aeqi",
  "tagline": "Start a TRUST with one primary agent and one operating steward.",
  "description": "...",

  // User-facing category. Free-form string, defaults to "".
  "category": "company",

  // On-chain archetype. One of: "entity" | "venture" | "foundation" | "fund".
  // The Factory expects templateId = keccak256(template).
  "template": "venture",

  // Required. The single root agent that owns the TRUST.
  "root": {
    "name": "aeqi",
    "model": "anthropic/claude-sonnet-4.6",
    "color": "#0a0a0b",
    "avatar": "rocket",
    "system_prompt": "...",
    "proactive_greeting": "Hi — I'm your Founder. ..."
  },

  // Optional. Child agents under root. owner is always "root" in v1.
  "seed_agents": [
    {
      "owner": "root",
      "name": "Steward",
      "model": "anthropic/claude-sonnet-4.6",
      "color": "#5a4fcf",
      "system_prompt": "...",
      "proactive_greeting": "Hi — I'm your CTO. ..."
    }
  ],

  // Optional. Scheduled or pattern-fired event handlers.
  "seed_events": [
    {
      "owner": "root",
      "name": "Daily standup",
      "pattern": "schedule:0 9 * * 1-5",
      "cooldown_secs": 0,
      "tool_calls": [
        {
          "tool": "quests.create",
          "args": { "subject": "Daily standup notes", "priority": "normal" }
        }
      ]
    }
  ],

  // Optional. Seed ideas (memory, charters, docs).
  "seed_ideas": [
    {
      "owner": "root",
      "name": "Mission",
      "content": "...",
      "tags": ["mission"]
    }
  ],

  // Optional. Seed quests created at spawn.
  "seed_quests": [
    {
      "owner": "root",
      "subject": "Define the TRUST mission",
      "description": "Write the one-sentence mission into the TRUST mission idea.",
      "labels": ["onboarding"]
    }
  ],

  // Optional. Declared role surface — round-tripped to the dashboard.
  // The orchestrator does not yet use these at spawn (Phase-B refactor);
  // until then, declared roles should mirror the agent tree 1:1.
  "seed_roles": [
    {
      "key": "founder",
      "title": "Founder",
      "default_occupant_agent": "root",
      "role_type": "operational",
      "grants": null
    },
    {
      "key": "cto",
      "title": "CTO",
      "default_occupant_agent": "CTO",
      "role_type": "operational"
    }
  ],

  // Optional. Parent→child edges in the role DAG.
  "seed_role_edges": [
    { "parent": "founder", "child": "cto" }
  ]
}
```

## Field reference

### Top level

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `slug` | string | yes | Stable identifier; used in URLs and as the catalog key. |
| `name` | string | yes | User-facing display name. |
| `tagline` | string | no | One-liner. Defaults to `""`. |
| `description` | string | no | Long form. Defaults to `""`. |
| `category` | string | no | Free-form display category. Defaults to `""`. |
| `template` | string | no | On-chain archetype slug. One of `entity`, `venture`, `foundation`, `fund`. The Factory routes provisioning by `keccak256(template)`. Defaults to `""`. |
| `root` | object | yes | The single root agent (see [Root agent](#root-agent)). |
| `seed_agents` | array | no | Child agents. Defaults to `[]`. |
| `seed_events` | array | no | Event handlers. Defaults to `[]`. |
| `seed_ideas` | array | no | Seed memory. Defaults to `[]`. |
| `seed_quests` | array | no | Initial work. Defaults to `[]`. |
| `seed_roles` | array | no | Declared roles. Defaults to `[]`. |
| `seed_role_edges` | array | no | Parent/child edges. Defaults to `[]`. |

### Root agent

`root` is a single `RootAgentSpec`, not an array. Every TRUST has exactly one root agent.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string (required) | Display name. |
| `model` | string | `provider/model-id` (e.g. `anthropic/claude-sonnet-4.6`). |
| `color` | string | Hex color for the dashboard. |
| `avatar` | string | Avatar slug or icon name. |
| `system_prompt` | string | Stored as an idea tagged `identity`; injected by the runtime's `assemble_ideas` path on `session:start`. |
| `proactive_greeting` | string | When present, an agent-bound DM session is created and the greeting posted as the first `assistant` turn at spawn time. Surfaces immediately in the inbox. |

### Seed agents

Each `SeedAgentSpec` matches the root shape plus an `owner` field. In v1, `owner` must be `"root"` — nested hierarchies are deferred.

### Seed events

| Field | Type | Notes |
|-------|------|-------|
| `owner` | string | `"root"` or the name of a seed_agent. |
| `name` | string (required) | Display name for the handler. |
| `pattern` | string (required) | Full pattern. Cron handlers use the `schedule:<cron>` form, e.g. `schedule:0 9 * * 1-5`. Lifecycle handlers use `session:<event>`, e.g. `session:quest_result`. |
| `cooldown_secs` | integer | Minimum seconds between fires; `0` for no cooldown. |
| `tool_calls` | array | One or more `{ tool, args }` calls fired in order. |

### Seed ideas

| Field | Type | Notes |
|-------|------|-------|
| `owner` | string | `"root"` or a seed_agent name. |
| `name` | string (required) | Stable slug. |
| `content` | string (required) | Body. |
| `tags` | string[] | Classification tags. |

### Seed quests

| Field | Type | Notes |
|-------|------|-------|
| `owner` | string | `"root"` or a seed_agent name. |
| `subject` | string (required) | Quest title. |
| `description` | string | Long form. |
| `labels` | string[] | Tags. |

### Seed roles

| Field | Type | Notes |
|-------|------|-------|
| `key` | string (required) | Stable identifier referenced by `seed_role_edges`. |
| `title` | string (required) | User-visible label, e.g. `"CTO"`. |
| `default_occupant_agent` | string | seed_agent name or `"root"`; `null` means vacant. |
| `role_type` | enum | `director`, `operational`, etc. Defaults to `operational`. |
| `grants` | string[] | Explicit grant set. `null` means "use the type-default bundle". |

### Seed role edges

| Field | Type | Notes |
|-------|------|-------|
| `parent` | string (required) | `seed_roles[].key` of the upstream role. |
| `child` | string (required) | `seed_roles[].key` of the downstream role. |

## Catalog endpoints

Public, no auth required:

```
GET /api/blueprints                 # Catalog summary (kind, slug, name, tagline, counts)
GET /api/blueprints/{slug}          # Full Blueprint JSON for one entry
```

Catalog entries carry `kind: "single"` so the frontend can branch consistently if other blueprint families ship later. They include counts (`agent_count`, `event_count`, `idea_count`, `quest_count`) plus a trimmed `root` (name/model/color) for card rendering.

## Provisioning

Spawn a TRUST from a blueprint with one of:

```
POST /api/start/launch              # TRUST via the /start experience
POST /api/architect/deploy          # Architect-generated inline JSON instead of a catalog slug
POST /api/blueprints/spawn          # Tenant-scoped IPC spawn (proxied to the runtime)
```

`/api/start/launch` is the canonical user-facing path; `/api/blueprints/spawn` is the lower-level IPC verb the orchestrator owns. Both pass through gates on subscription status and the workspace company cap.

## Built-in catalog

The platform binary embeds this public manifest (`aeqi-platform/blueprints/aeqi.json`, mirrored from `aeqi/presets/blueprints/aeqi.json`):

| Slug | Template |
|------|----------|
| `aeqi` | venture |

Draft manifests can still live under `aeqi/presets/blueprints/`, but they are not part of the public catalog until they are explicitly added to the embedded list in both runtime and platform. Each blueprint declares its on-chain template via `template`; the Factory expects `keccak256(template)`, **not** `keccak256(slug)`.

## Editing

```bash
# Edit the source
$EDITOR aeqi/presets/blueprints/aeqi.json

# Rebuild — blueprints are embedded via include_str!
cd aeqi && ./scripts/deploy.sh
# Then redeploy the platform binary so it picks up the new catalog
```

Tips:

- Blueprints are embedded at compile time. JSON edits require a full rebuild + redeploy.
- Don't rename `slug` — it's the catalog primary key and ends up in URLs.
- Don't rename role `key`s — they're load-bearing for `seed_role_edges`.
- Test a new blueprint locally with `aeqi start` then `POST /api/blueprints/spawn` against the local runtime, or `POST /api/start/launch` against the hosted platform once the new JSON ships.

## Related

- [Templates & modules](/docs/architecture/templates-and-modules) — what `template` controls on-chain.
- [Canonical templates](/docs/architecture/canonical-templates) — module bundles per template.
- [Roles](/docs/concepts/roles) — role primitive and authority model.
