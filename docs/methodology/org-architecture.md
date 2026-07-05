# Org architecture

A Company in aeqi is a graph of slots and edges, not a table of titles. This page explains how the pieces fit: Companies, Roles, ownership, and governance. (The Company's on-chain vehicle is its trust contract — the Company's smart account; this page names it only where the on-chain artifact is what's actually meant.)

## Companies are entities

A Company is the programmable operating shell in aeqi: a workspace with its own entity ID, a runtime database, runtime state, and optional protocol state. The same model can cover a one-person personal account and a 50-person operating company; the difference is how the entity is rendered.

| URL | Shape |
|---|---|
| `/company/<address-or-id>/*` | The canonical operating-system route. Every entity — your personal entity or a joint Company — lives here. Rail: HQ · Sessions · Views · Roles · Apps · Agents · Events · Quests · Ideas. Single-occupant entities render the same registers gracefully. |
| `/account` | User-scoped settings only (auth, billing, signers). Not an entity surface — your own entity is at `/company/<your-address-or-id>/*`. |

## Roles are the org chart

Every participant occupies one or more **Roles**. A Role is a slot in the company's role DAG; an agent or human occupies it.

```
Director (Founder)
   |
   +-- CEO
        |
        +-- COO --> Sales Lead --> Sales Rep
        +-- CTO --> Eng Lead   --> Engineer
        +-- CFO
```

Authority: Role X controls Role Y iff there's a directed path from X to Y in `role_edges`, scoped to the same `entity_id`. Recursive CTE, no ACL table.

See [Roles](/docs/concepts/roles) for the full primitive.

## Board vs org chart

Two distinct layers, kept orthogonal.

| Layer | `role_type` | Who | Where it lives | Power |
|---|---|---|---|---|
| **Board** | `director` | Founders typically | The Company's trust contract (when protocol state is enabled) + runtime mirror | Governance: signs the smart account, votes proposals. |
| **Org chart** | `operational` | CEO + C-suite + reports + agents | Runtime only | Operational: spawn agents, configure tools, route work. |

C-suite operational titles are NOT directors. CFO, CMO, CLO, CISO are `role_type='operational'`. They report to CEO via `role_edges`, not via signing authority. They get on-chain bindings only if and when the founder explicitly elects them to the board (rare; usually only founders are board).

A founder typically holds both — one Director seat plus a CEO seat. Two rows for the same human.

Operational seats (CFO/CMO/CLO/CISO) must not be typed as `director`: a director-typed role binds to the on-chain board and inflates the signer count. Reserve `director` for actual board seats.

## Ownership — the cap table (protocol roadmap)

Ownership as protocol state is roadmap, not a shipped surface. The design: for Venture-shaped Companies, the Company tracks ownership issuance, transfer restrictions, and cap-table state on chain when protocol features are enabled.

| Mechanism | Purpose |
|---|---|
| **Mint** | Issue equity to a holder. Recorded on-chain. |
| **Vesting schedule** | Linear with cliff. Time-based + market-cap-gated for FDV milestones. |
| **Transfer restrictions** | Lock-up windows, KYC allowlist (when incorporated entity is attached). |
| **Soulbound (non-transferable)** | For founders, for compliance reasons, or for advisor allocations. |

Ownership tokens are independent from governance tokens. A Director-tier role doesn't automatically hold equity; equity holders don't automatically have a board seat. Two distinct authorities.

## Governance — proposals and votes (protocol roadmap)

On-chain governance follows the same staging: the design below describes the protocol layer, which is not exposed as an in-app tab today. The flow:

```
draft proposal → table → quorum → timelock → execute
```

| Stage | Who acts |
|---|---|
| **Draft** | Anyone with proposal rights (typically Director or Executive). |
| **Table** | Move from draft to active. Votable from this point. |
| **Vote** | Any voter casts for/against/abstain. Vote weight per role bit and/or token balance. |
| **Quorum** | Minimum participation required. Per-template default. |
| **Timelock** | Configurable delay between pass and execute (typically 24-72h). |
| **Execute** | Anyone can execute a passed proposal after timelock. |

In the runtime today, governance shows up as read authority: the `governance.read` grant gates who can inspect governance state, and `roles.manage` gates who can restructure the org.

## Budgets and Transactions — the financial picture

The shipped financial surfaces are two registers on the Company:

| Register | Content |
|---|---|
| **Budgets** (`/company/<address-or-id>/budgets`) | Allocated spend per role / per agent / per project — the agentic credits ledger. |
| **Transactions** (`/company/<address-or-id>/transactions`) | Inbound and outbound history. |

These render through the same code path at every entity scope — a joint Company and your personal entity use the same UI. An on-chain treasury (protocol balances and assets folded into the same picture) is roadmap; in the runtime today, treasury shows up as the `treasury.read` grant gating who can see financial state.

## Three money flows (kept distinct)

| Flow | Source | Destination | Settled |
|---|---|---|---|
| **Subscription** | Personal card | aeqi platform | Per month |
| **Runtime credit add-on** | Billing page | aeqi platform | Monthly subscription |
| **Treasury** | Customers, investors, internal | Treasury balance | Protocol or off-chain settlement |

Subscription does NOT debit treasury — failure modes diverge. A Company with no treasury but an active product still needs to keep running. Treasury is the Company's own money.

## Templates — the canonical shapes

Two Company templates ship today:

- **Company** — flexible shell. No enforced state machine. Custom org structures.
- **Venture** — growth engine. Cap table, vesting, governance, fundraising rounds.

Two more are roadmap:

- **Foundation** — steward. Mission-locked, no fundraising, governance + budget.
- **Fund** — capital allocator. LP/GP roles, NAV tracking.

See [Canonical templates](/docs/architecture/canonical-templates) for the contract-level configuration.

## Stack blueprints — multi-Company graphs

A stack blueprint is a graph of (single-blueprint, name) tuples + cross-Company edges. Use it to ship a multi-Company structure as a unit:

- **Founder + spinout** — personal entity holds 30% + Founder role in a venture spinout.
- **VC fund + 3 portfolio companies** — fund holds 20% + Director role in each.

The wizard provisions all entities in topo-sorted order. The cross-company on-chain edges (ownership transfers, role assignment writes, scheduled treasury flows) are not yet written on chain. See [Stack blueprints](/docs/reference/blueprint-schema).

## Related

- [Roles](/docs/concepts/roles)
- [Company](/docs/concepts/company)
- [Canonical templates](/docs/architecture/canonical-templates)
- [Wallets & identity](/docs/concepts/wallets-and-identity)
