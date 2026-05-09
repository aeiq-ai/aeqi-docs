# Org architecture

A Company in aeqi is a graph of slots and edges, not a table of titles. This page explains how the pieces fit: Companies, Roles, ownership tokens, governance.

## Companies are entities

A Company is an **entity** — a workspace with a fresh UUID, a SQLite database, and (typically) a TRUST contract. The same word covers a one-person personal account and a 50-person operating company; the difference is how the entity is rendered.

| URL | Shape |
|---|---|
| `/me/*` | Personal entity. Rail: Inbox · Agents · Events · Quests · Ideas · Treasury · Settings. Hides Roles, Ownership, Governance — degenerate when you're the only occupant. |
| `/c/<entity_id>/*` | Joint Company entity. Rail: Overview · Roles · Ownership · Treasury · Governance · Settings. Multiple humans, multiple agents, on-chain by default. |
| `/trust/<address>/*` | Same Company by its on-chain address. Auto-redirected from `/c/<id>` once the TRUST is registered. |

Same underlying contract. Two UIs.

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
| **Board** | `director` | Founders typically | On-chain TRUST contract + runtime mirror | Governance: signs the smart account, votes proposals. |
| **Org chart** | `operational` | CEO + C-suite + reports + agents | Runtime only | Operational: spawn agents, configure tools, route work. |

C-suite operational titles are NOT directors. CFO, CMO, CLO, CISO are `role_type='operational'`. They report to CEO via `role_edges`, not via signing authority. They get on-chain bindings only if and when the founder explicitly elects them to the board (rare; usually only founders are board).

A founder typically holds both — one Director seat plus a CEO seat. Two rows for the same human.

The bug pattern to watch (2026-05-06): creating CFO/CMO/CLO/CISO as `role_type='director'` made the on-chain board count jump from 1 to 5. Don't ship director-typed roles for non-board seats.

## Ownership tokens — the cap table

For Venture-template Companies, ownership is on-chain. The TRUST mints an ERC-20 ownership token on registration; cap table is the token's holder distribution.

| Mechanism | Purpose |
|---|---|
| **Mint** | Issue equity to a holder. Recorded on-chain. |
| **Vesting schedule** | Linear with cliff. Time-based + market-cap-gated for FDV milestones. |
| **Transfer restrictions** | Lock-up windows, KYC allowlist (when incorporated entity is attached). |
| **Soulbound (non-transferable)** | For founders, for compliance reasons, or for advisor allocations. |

Ownership tokens are independent from governance tokens. A Director-tier role doesn't automatically hold equity; equity holders don't automatically have a board seat. Two distinct authorities.

For Foundation-template Companies, no ownership token is minted. Mission-locked, governance-only.

## Governance — proposals and votes

Governance is on-chain when enabled. The flow:

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

Vote weight is configured per template:

| Template | Voting basis |
|---|---|
| Solo founder | None — single signer. |
| Tech studio | Director-tier 1-of-N. |
| Venture | Token-weighted + Director veto. |
| Foundation | Director-tier multi-sig + Protector role veto. |
| Index fund | LP/GP weighted. |

The Treasury tab and Governance tab read directly from the on-chain indexer. Proposals, votes, and execution status all live on-chain.

## Treasury — the financial picture

Treasury is the canonical financial surface. It folds three lenses:

| Lens | Content |
|---|---|
| **Balance state** | Current ETH, USDC, ERC-20 holdings on-chain. |
| **Budgets** | Allocated spend per role / per agent / per project. |
| **Transactions** | Inbound and outbound history. |

A Treasury row is the same primitive at company scope (`/c/<id>/treasury`) and personal scope (`/me/treasury`). Same code path; same UI.

There's no separate "Portfolio" page. Treasury *is* the portfolio.

## Three money flows (kept distinct)

| Flow | Source | Destination | Settled |
|---|---|---|---|
| **Subscription** | Personal card / personal USDC | Stripe / aeqi platform | Per month |
| **Inference top-up** | Treasury or personal | Inference provider via aeqi-inference | Per call (subscription lane) or per dollar (treasury / x402 lane) |
| **Treasury** | Customers, investors, internal | Treasury balance | On-chain settlement |

Subscription does NOT debit treasury — failure modes diverge (a Company with no treasury but an active product still needs to keep running). Inference top-ups CAN debit treasury (it's the Company's own usage). Treasury is the Company's own money.

Three money flows kept distinct: subscription (workspace), inference (top-ups), treasury (the Company's own money).

## Templates — the locked-in shapes

Four canonical TRUST templates ship today:

- **Entity** — flexible shell. No enforced state machine. Custom org structures.
- **Venture** — growth engine. Cap table, vesting, governance, fundraising rounds.
- **Foundation** — steward. Mission-locked, no fundraising, governance + budget.
- **Fund** — capital allocator. LP/GP roles, NAV tracking.

See [Canonical templates](/docs/architecture/canonical-templates) for the contract-level configuration.

## Stack blueprints — multi-Company orgs

A stack blueprint is a graph of (single-blueprint, name) tuples + cross-Company edges. Use it to ship a multi-Company structure as a unit:

- **Founder + spinout** — personal entity holds 30% + Founder role in a venture spinout.
- **VC fund + 3 portfolio companies** — fund holds 20% + Director role in each.

The wizard provisions all entities in topo-sorted order. On-chain edges (TokenOwnership transfers, RoleAssignment writes, scheduled treasury flows) are stubbed in v1; W33B worktree implements them. See [Stack blueprints](/docs/reference/blueprint-schema).

## Summary

- An entity is a Company. Companies have IDs and (optionally) TRUST addresses.
- Roles are the org-chart slots; agents and humans occupy them.
- Authority is the transitive closure over `role_edges`.
- Board (`director`) is on-chain governance; org chart (`operational`) is runtime only.
- Treasury folds balance + budgets + transactions.
- Templates are locked-in TRUST configurations; pick at creation.
- Stacks are multi-Company graphs.

## Related

- [Roles](/docs/concepts/roles)
- [TRUST](/docs/concepts/trust)
- [Canonical templates](/docs/architecture/canonical-templates)
- [Wallets & identity](/docs/concepts/wallets-and-identity)
