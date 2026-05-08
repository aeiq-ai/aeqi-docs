# Roles

Roles are aeqi's **WHO** primitive. A Role is the org-chart slot inside an entity, occupied by a human, an agent, or vacant. Authority flows along role edges; a Role doesn't *do* the work, an occupant does.

This was renamed from "Position" → "Role" in 2026-05-02. If you encounter "position" in old code or docs, treat it as the same primitive.

## The model

```
roles(id, entity_id, title, occupant_kind, occupant_id, role_type, ...)
role_edges(parent_role_id, child_role_id)   -- DAG, not tree
```

| Field | Purpose |
|---|---|
| `entity_id` | The Company that owns this slot. A role belongs to exactly one company. |
| `title` | "CEO", "Marketing Lead", "Director" — human-readable. |
| `occupant_kind` | `human` \| `agent` \| `vacant`. |
| `occupant_id` | The user or agent ID, or null when vacant. |
| `role_type` | `director` \| `operational` \| `advisor`. Drives on-chain treatment. |

Two role tiers, kept orthogonal:

| Tier | `role_type` | Where it lives | Power |
|---|---|---|---|
| **Board** | `director` | On-chain TRUST + runtime mirror | Governance: signs the smart account, votes proposals. |
| **Org chart** | `operational` | Runtime only (`roles` + `role_edges`) | Operational: spawns agents, configures tools, routes work. |

A founder typically holds both — one Director seat plus a CEO seat. They're the same human in two rows. See [Board vs org chart](/docs/methodology/org-architecture#board-vs-org-chart) for the full pattern.

## Authority via DAG closure

"Role X controls Role Y" iff there's a directed path from X to Y in `role_edges`, scoped to the same `entity_id`. The runtime computes this on demand via a recursive CTE — no ACL table.

```
Director (Founder)
   |
   +-- CEO
        |
        +-- COO --> Sales Lead --> Sales Rep
        +-- CTO --> Eng Lead   --> Engineer
        +-- CFO
```

The CEO controls the COO, Sales Lead, and Sales Rep transitively. The CFO doesn't control engineering. Orthogonal sub-trees.

Boards are flat — that's why it's a DAG, not a tree. Three founders all hold Director roles with no edges between them; they're a flat set at the top.

## Roles vs. agents

Agents are entity-owned **assets** — `agents.entity_id NOT NULL`, with their own UUID distinct from any role's. An agent can occupy a role; the role is the slot, the agent is the occupant.

The old "agents are WHO" framing collapsed when the same agent needed to occupy a fractional CFO role across three companies. Roles let one agent occupy seats in many entities; one human can hold roles across many companies; one role can be filled, vacated, and re-filled without losing its session history.

## Role-addressed sessions

A session can target a Role rather than a specific occupant. Messages route to whoever currently fills that seat. If the CEO turns over, the new CEO inherits the session queue. The session itself is preserved.

In the [Sessions](/docs/concepts/sessions) primitive: `message_to(target=<role_id>)`.

## Role-scoped credentials

Like agents, roles can hold scoped credentials — e.g., a CEO role can carry an OAuth token that any occupant inherits while in seat. Credential scopes are the precedence chain: **Entity > Role > Agent**, narrowest wins. See [Multi-scope integrations](/docs/patterns/multi-scope-integrations).

## On-chain mirroring

Director-tier roles mirror on-chain via `RoleModule.assignRole`. The TRUST contract records:

- The role's keccak256-hashed name (`keccak256("DIRECTOR_ROLE")`).
- The occupant's address.
- Permissions inherited via the role module's bit flags.

Operational-tier roles stay runtime-only. They don't get on-chain rows. Adding a Marketing Lead doesn't write to the chain.

This means: don't ship director-typed roles for non-board seats. A bug pattern from 2026-05-06 created CFO/CMO/CLO/CISO as `role_type='director'`, which made the on-chain board count jump from 1 to 5. Fix: flip director→operational; only founders get Director rows.

## Invites

A vacant role can be filled via invite. The Roles tab → role row → **Invite** opens an email link with a one-time-use code. When the invitee accepts, they're bound as the role's occupant.

| Step | What happens |
|---|---|
| Issue | Invite generated with `email`, `role_id`, `expires_at`. Email_sent=0 if SMTP not configured. |
| Accept | Invitee creates an account (if needed) and binds. |
| Bind | `roles.occupant_kind='human'`, `occupant_id=<user_id>`. |

Open invites for the AEQI dogfood: CEO, CTO, COO seats are pending until founder cofounders redeem.

## HTTP API

```
GET    /api/roles                  # list roles for the current entity
POST   /api/roles                  # create a role
PUT    /api/roles/{id}/occupant    # change occupant
DELETE /api/roles/{id}             # delete (denied if occupied)
```

See the [REST API reference](/docs/api/rest).

## What's gone (don't reach for these)

The Phase-4 cleanup retired:

- `agents.parent_id` — agents no longer chain through other agents; they're entity-owned assets.
- `agent_directors` — humans→agents grants merged into roles.
- `agent_ancestry` closure table — replaced by `role_edges` recursive CTE.
- "Root agent" special-case — there is no root; the role with no incoming edges is the equivalent.
- `entity.id == agent.id` collapse — entities now mint their own UUIDs.

If you find these in old code, they're legacy. Don't recreate them.

## Related

- [Agents](/docs/concepts/agents) — the occupant primitive.
- [Sessions](/docs/concepts/sessions) — role-addressed conversations.
- [TRUST](/docs/concepts/trust) — on-chain mirror of the director tier.
- [Board vs org chart](/docs/methodology/org-architecture#board-vs-org-chart) — when to use which `role_type`.
