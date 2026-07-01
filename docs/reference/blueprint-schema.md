# Company template schema

A company template is a JSON manifest describing a Company starter kit: one root agent plus seed agents, events, ideas, quests, roles, and views. The runtime spawns a fresh Company from this manifest in one IPC call.

The canonical Rust type is `aeqi_orchestrator::ipc::templates::CompanyTemplate`. The on-disk JSON lives at `aeqi/presets/templates/*.json` and is the source of truth for editing. The product ships **exactly two** company templates (founder decision 2026-06-10): `new-company.json` and `existing-company.json`. Other manifests are draft inventory under `presets/templates/drafts/` until they pass a fresh product and protocol audit.

> The older `Blueprint` naming and the `/api/blueprints/*` routes are still present for backward compatibility; the catalog they return is the same company-template set.

## Shape

```jsonc
{
  "slug": "new-company",
  "name": "New company",
  "tagline": "Start a new company with a full team behind one CEO ...",
  "description": "...",

  // User-facing category. One of: "company" | "foundation" | "fund". Defaults to "".
  "category": "company",

  // On-chain archetype. One of: "entity" | "venture" | "foundation" | "fund".
  // The Factory expects templateId = keccak256(template).
  "template": "entity",

  // Required. The single root agent that owns the Company.
  "root": {
    "name": "CEO",
    "model": "deepseek/deepseek-v4-flash",
    "color": "#0a0a0b",
    "system_prompt": "...",
    "proactive_greeting": "I'm your CEO — your single point of contact ..."
  },

  // Optional. Saved dashboard views installed at spawn.
  "seed_views": [
    { "key": "my-sessions", "label": "My sessions", "path": "sessions", "search": "?view=mine", "pinned": true }
  ],

  // Optional. Child agents under root. owner is "default" (DEFAULT_AGENT_OWNER);
  // "root" is a legacy alias, still normalized to the same default agent.
  "seed_agents": [
    {
      "owner": "default",
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
      "owner": "default",
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
      "owner": "default",
      "name": "Mission",
      "content": "...",
      "tags": ["mission"]
    }
  ],

  // Optional. Seed quests created at spawn.
  "seed_quests": [
    {
      "owner": "default",
      "subject": "Define the Company mission",
      "description": "Write the one-sentence mission into the Company mission idea.",
      "labels": ["onboarding"]
    }
  ],

  // Optional. Declared role surface, actively installed at spawn: when
  // non-empty, install_declared_roles wipes the auto-derived per-agent
  // positions and installs this declared structure (plus seed_role_edges
  // and any operator RoleOverrides) as the company's authority map. When
  // empty, spawn falls back to the auto-derived one-position-per-agent set.
  // Declared roles should still mirror the agent tree so the preview stays
  // honest with what spawns.
  "seed_roles": [
    {
      "key": "founder",
      "title": "Founder",
      "default_occupant_agent": "default",
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
| `category` | string | no | Display category. One of `company`, `foundation`, `fund`. Defaults to `""`. |
| `template` | string | no | On-chain archetype slug. One of `entity`, `venture`, `foundation`, `fund`. The Factory routes provisioning by `keccak256(template)`. Both shipped company templates use `entity`. Defaults to `""`. |
| `root` | object | yes | The single root agent (see [Root agent](#root-agent)). |
| `seed_views` | array | no | Saved dashboard views installed at spawn. Defaults to `[]`. |
| `seed_agents` | array | no | Child agents. Defaults to `[]`. |
| `seed_events` | array | no | Event handlers. Defaults to `[]`. |
| `seed_ideas` | array | no | Seed memory. Defaults to `[]`. |
| `seed_quests` | array | no | Initial work. Defaults to `[]`. |
| `seed_roles` | array | no | Declared roles. Defaults to `[]`. |
| `seed_role_edges` | array | no | Parent/child edges. Defaults to `[]`. |

### Root agent

`root` is a single `DefaultAgentSpec`, not an array. Every Company has exactly one root agent.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string (required) | Display name. |
| `model` | string | `provider/model-id` (e.g. `anthropic/claude-sonnet-4.6`). |
| `color` | string | Hex color for the dashboard. |
| `avatar` | string | Avatar slug or icon name. |
| `system_prompt` | string | Stored as an idea tagged `identity`; injected by the runtime's `assemble_ideas` path on `session:start`. |
| `proactive_greeting` | string | When present, an agent-bound DM session is created and the greeting posted as the first `assistant` turn at spawn time. Surfaces immediately in the inbox. |

### Seed agents

Each `SeedAgentSpec` matches the root shape plus an `owner` field. `owner` must be `"default"` (`DEFAULT_AGENT_OWNER`, the root/CEO agent); `"root"` is accepted as a legacy alias and normalized to the same default agent. Nested hierarchies beyond root → seed_agent are deferred.

### Seed events

| Field | Type | Notes |
|-------|------|-------|
| `owner` | string | `"default"` (legacy alias `"root"`) or the name of a seed_agent. |
| `name` | string (required) | Display name for the handler. |
| `pattern` | string (required) | Full pattern. Cron handlers use the `schedule:<cron>` form, e.g. `schedule:0 9 * * 1-5`. Lifecycle handlers use `session:<event>`, e.g. `session:quest_result`. |
| `cooldown_secs` | integer | Minimum seconds between fires; `0` for no cooldown. |
| `tool_calls` | array | One or more `{ tool, args }` calls fired in order. |

### Seed ideas

| Field | Type | Notes |
|-------|------|-------|
| `owner` | string | `"default"` (legacy alias `"root"`) or a seed_agent name. |
| `name` | string (required) | Stable slug. |
| `content` | string (required) | Body. |
| `tags` | string[] | Classification tags. |

### Seed quests

| Field | Type | Notes |
|-------|------|-------|
| `owner` | string | `"default"` (legacy alias `"root"`) or a seed_agent name. |
| `subject` | string (required) | Quest title. |
| `description` | string | Long form. |
| `labels` | string[] | Tags. |

### Seed roles

| Field | Type | Notes |
|-------|------|-------|
| `key` | string (required) | Stable identifier referenced by `seed_role_edges`. |
| `title` | string (required) | User-visible label, e.g. `"CTO"`. |
| `default_occupant_agent` | string | seed_agent name or `"default"` (legacy alias `"root"`); `null` means vacant. |
| `role_type` | enum | `director`, `operational`, etc. Defaults to `operational`. |
| `grants` | string[] | Explicit grant set. `null` means "use the type-default bundle". |

### Seed role edges

| Field | Type | Notes |
|-------|------|-------|
| `parent` | string (required) | `seed_roles[].key` of the upstream role. |
| `child` | string (required) | `seed_roles[].key` of the downstream role. |

## Catalog endpoints

Public, no auth required. Two parallel families return the same company-template catalog:

```
GET /api/templates                  # Company launch catalog (templates[] + agent_templates[])
GET /api/templates/default          # The default launch template (new-company)
GET /api/templates/{slug}           # Full template JSON for one slug

GET /api/blueprints                 # Legacy alias: same catalog under blueprints[]
GET /api/blueprints/default         # Configured default blueprint slug
GET /api/blueprints/{slug}          # Full template JSON for one slug
```

The `/api/templates` family is the current launch surface; `/api/blueprints` is retained for older clients. Both wrap `full_catalog()` over the two shipped company templates. List responses carry the catalog plus a parallel `agent_templates[]`; detail responses include the full `seed_agents` / `seed_events` / `seed_ideas` / `seed_quests` arrays.

## Provisioning

Spawn a Company from a template with one of:

```
POST /api/start/launch              # Company via the /start experience
POST /api/architect/deploy          # Architect-generated inline JSON instead of a catalog slug
POST /api/blueprints/spawn          # Tenant-scoped IPC spawn (proxied to the runtime)
```

`/api/start/launch` is the canonical user-facing path; `/api/blueprints/spawn` is the lower-level IPC verb the orchestrator owns (it maps to the `spawn_template` handler in `ipc/templates.rs`). Both pass through gates on subscription status and the workspace company cap.

## Built-in catalog

The runtime and platform binaries embed these two manifests via `include_str!` from `aeqi/presets/templates/`:

| Slug | Template | What |
|------|----------|------|
| `new-company` | entity | A new company with a full team behind one CEO. The default launch template. |
| `existing-company` | entity | Import an existing operation: map bottlenecks and open the first improvement quest. |

Draft manifests live under `aeqi/presets/templates/drafts/`, but they are not part of the public catalog until they are explicitly promoted. Each template declares its on-chain archetype via `template`; the Factory expects `keccak256(template)`, **not** `keccak256(slug)`.

## Editing

```bash
# Edit the source
$EDITOR aeqi/presets/templates/new-company.json

# Rebuild — templates are embedded via include_str!
cd aeqi && ./scripts/deploy.sh
# Then redeploy the platform binary so it picks up the new catalog
```

Tips:

- Templates are embedded at compile time. JSON edits require a full rebuild + redeploy.
- Don't rename `slug` — it's the catalog primary key and ends up in URLs.
- Don't rename role `key`s — they're load-bearing for `seed_role_edges`.
- Test a new template locally with `aeqi start` then `POST /api/blueprints/spawn` against the local runtime, or `POST /api/start/launch` against the hosted platform once the new JSON ships.

## Related

- [Templates & modules](/docs/architecture/templates-and-modules) — what `template` controls on-chain.
- [Canonical templates](/docs/architecture/canonical-templates) — module bundles per template.
- [Roles](/docs/concepts/roles) — role primitive and authority model.
