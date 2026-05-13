# Blueprint schema

A blueprint is a JSON file describing a TRUST shape. Two kinds: **single** (one TRUST per blueprint) and **stack** (multi-TRUST graphs).

## Single blueprint

```jsonc
{
  "slug": "tech-studio",
  "name": "Tech studio",
  "tagline": "Small team building software",
  "description": "...",
  "template_id": "venture",      // 'entity' | 'venture' | 'foundation' | 'fund'
  "category": "company",
  "icon": "rocket",

  "roles": [
    {
      "title": "Director",
      "role_type": "director",   // founder seat, on-chain
      "auto_fill": "creator"     // bind the creator
    },
    {
      "title": "CEO",
      "role_type": "operational",
      "edges_to": ["CTO"]        // CEO → CTO edge in role_edges
    },
    {
      "title": "CTO",
      "role_type": "operational"
    }
  ],

  "agents": [
    {
      "template": "ceo-assistant",
      "name_suffix": " EA",      // "<TRUST> EA"
      "role_title": "CEO",       // assign to the role with this title
      "ideas": [
        {
          "name": "Charter",
          "kind": "charter",
          "injection_mode": "always",
          "content": "I serve the C-suite collectively, not any one of them. ..."
        }
      ]
    }
  ],

  "ideas": [
    {
      "name": "Mission",
      "kind": "doc",
      "content": "..."
    }
  ],

  "events": [
    {
      "name": "Daily standup",
      "cron": "0 9 * * 1-5",
      "paused": true,            // off by default; user enables
      "fires": {
        "tool": "quests.create",
        "args": {
          "subject": "Daily standup notes",
          "agent_role": "CEO",   // route to whoever's on the CEO seat
          "priority": "normal"
        }
      }
    }
  ],

  "kickoff_quests": [
    {
      "subject": "Calibrate your CEO Assistant's voice",
      "description": "Let the EA know your tone preferences. It will ask 3 questions in its first session.",
      "agent_role": "CEO Assistant",
      "priority": "high"
    }
  ],

  "trust_config": {
    "register_on_create": true,
    "modules": ["Token", "Vesting", "Funding", "Governance", "Role", "Budget"]
  }
}
```

## Stack blueprint

A stack is a graph of `(component, blueprint, name)` tuples plus cross-TRUST edges.

```jsonc
{
  "id": "founder-plus-spinout",
  "name": "Founder + spinout",
  "tagline": "Personal entity + a venture spinout",
  "description": "...",

  "umbrella": {                  // optional top-level TRUST
    "slot": "founder",
    "blueprint_id": "personal-os",
    "display_name_default": "Personal"
  },

  "components": [
    {
      "slot": "founder",
      "blueprint_id": "personal-os",
      "display_name_default": "Personal"
    },
    {
      "slot": "spinout",
      "blueprint_id": "solo-founder",
      "display_name_default": "Spinout"
    }
  ],

  "edges": [
    {
      "from_slot": "founder",
      "to_slot": "spinout",
      "relationship": {
        "kind": "TokenOwnership",
        "percent_bps": 3000      // 30% of ownership tokens
      }
    },
    {
      "from_slot": "founder",
      "to_slot": "spinout",
      "relationship": {
        "kind": "RoleAssignment",
        "role_type": "Founder"
      }
    }
  ]
}
```

### Relationships

| Relationship | Effect | Status |
|---|---|---|
| `TokenOwnership { percent_bps }` | Transfers a basis-points share of `to_slot`'s ownership tokens to `from_slot` post-mint. | v1: stubbed (W33B) |
| `RoleAssignment { role_type }` | Assigns the `role_type` role in `to_slot` to `from_slot`'s TRUST. | v1: stubbed (W33B) |
| `TreasuryFlow { amount_usd, schedule_seconds }` | Schedules a recurring USDC transfer from `from_slot` to `to_slot`. | v1: stubbed (W33B) |

`bps` = basis points; 10000 = 100%.

### Topo-sort ordering

`TokenOwnership` and `RoleAssignment` impose ordering: `from_slot` must be provisioned before `to_slot`. `TreasuryFlow` imposes no ordering.

The orchestrator topo-sorts before provisioning. A cyclic graph errors at parse time:

```
stack blueprint 'X' has cyclic edges — cannot topo-sort
```

## Built-in stacks

Two ship today:

| ID | Components | Edges |
|---|---|---|
| `founder-plus-spinout` | personal-os + solo-founder | 30% TokenOwnership + Founder role |
| `vc-fund-with-3-portfolios` | index-fund + 3× tech-studio | 20% TokenOwnership + Director role each |

## HTTP routes

```
GET /api/blueprints                  # combined single + stack catalog
GET /api/stacks/{id}                 # full stack detail
POST /api/start                      # provision a single TRUST
POST /api/start/stack                # provision a stack
```

`GET /api/blueprints` returns each entry with `kind: "single"` or `kind: "stack"`. Frontend must branch on `kind` before rendering — single entries have `slug`, stack entries have `id`.

## Where they live

```
aeqi/presets/blueprints/
  ├── solo-founder.json
  ├── tech-studio.json
  ├── personal-os.json
  ├── venture.json
  ├── foundation.json
  ├── index-fund.json
  ├── aeqi-company.json          (the aeqi reference company blueprint)
  └── stacks/
      ├── founder-plus-spinout.json
      └── vc-fund-with-3-portfolios.json
```

Compiled into the binary via `include_str!`. Changes require a full `./scripts/deploy.sh` + aeqi-platform redeploy.

## Editing tips

When changing an existing blueprint:

- Bump a `version` field if you add one — older provisions stay on the old shape.
- Don't rename `slot` IDs in stacks; they're load-bearing for edge resolution.
- Test locally with `aeqi start` and `POST /api/start { "blueprint": "your-slug" }`.

## Related

- [Stack blueprints architecture](/docs/methodology/org-architecture#stack-blueprints--multi-company-orgs)
- [Co-creation](/docs/methodology/co-creation)
- [Canonical templates](/docs/architecture/canonical-templates)
