# Four Canonical Templates

AEQI uses four locked on-chain templates. Each is a pre-configured module set for a specific company archetype. Many off-chain blueprints can map to one template (N-to-1 mapping).

## The two-layer architecture

**On-chain:** 4 canonical templates in Factory.sol. Exactly these archetypes. ~200 module addresses + value-config bytes per template. What the chain sees.

**Off-chain:** Many blueprints in JSON. Each declares a `templateSlug` selecting one of the 4. Blueprints layer agent role trees, ideas, events, sessions, default persona on top of the on-chain shape. Runtime concerns the chain doesn't model.

## The four templates

### Foundation

- **Module set:** role + budget + token + vesting + foundation
- **Use case:** Philanthropic / non-equity orgs. Governance is opinionated; economics are budget-and-vesting-only (no funding rounds, no AMM).
- **Default for:** personal-os blueprint
- **Bytecode:** ~45k (5 modules)

### Entity

- **Module set:** role + budget + token + vesting + funding
- **Use case:** Lightweight joint companies. Startups with cap table and employees but no heavy Uniswap/Unifutures economics.
- **Default for:** solo-founder, studio (most blueprints)
- **Bytecode:** ~48k (5 modules)

### Venture

- **Module set:** role + budget + token + vesting + funding + uniswap + unifutures
- **Use case:** Full economic stack. Companies that issue equity, run AMM positions, do token-curated funding.
- **Default for:** tech-studio, aeqi (the platform itself)
- **Bytecode:** ~62k (7 modules)

### Fund

- **Module set:** role + token + vesting + budget + fund
- **Use case:** Investment funds. Fund-provisioning pattern (NAV tracking, LP positions, fund flows), not companies that raise capital.
- **Default for:** (reserved for fund-archetype blueprints; not yet mapped)
- **Bytecode:** ~48k (5 modules)

## Why exactly four

### Complexity ladder

Foundation → Entity → Venture form a staircase: each adds modules horizontally without breaking prior configs. A company coded for Foundation can't suddenly demand Uniswap. A company coded for Entity can't run futures. The ladder is intentional.

We reject à-la-carte module selection — the audit surface would explode.

### Fund is orthogonal

Fund swaps "funding" for "fund" — a different lifecycle. Investment vehicles don't fundraise; they manage LP capital. Can't be expressed as Foundation + module X. Worth its own template because on-chain semantics are distinct.

We ship one orthogonal template. More fund-like archetypes (DAO, Cooperative, Syndicate) would require separate decisions.

### Audit cost discipline

On-chain Solidity audits are expensive per contract surface. Four templates × audit = bounded cost. Adding a fifth template doubles review surface for the new archetype alone. Each new template requires:
- Factory registration
- Module set coordination
- Test suite coverage

Fewer templates = faster iteration on blueprints (they're just JSON changes, no contract changes).

### Fewer templates doesn't mean less differentiation

A Studio blueprint and a Tech Studio blueprint can live on Entity without losing meaning. The difference isn't on-chain; it's in:
- Role trees
- Seed events
- Prompt style
- Default treasury allocations

All of that lives in JSON and the runtime. The chain stays simple.

### Prior art precedent

The original aeqi-app already used this 4-archetype taxonomy (Foundation/Entity/Venture/Fund routes in `/app/(app)/`). We're codifying that proven shape into on-chain primitives.

## Blueprint → template mapping (current)

| Blueprint | Template | Why |
|---|---|---|
| personal-os | Foundation | Personal entity is degenerate — owner-only, no equity, simplest archetype |
| solo-founder | Entity | Lightweight company, founder + maybe token, no governance complexity |
| studio | Entity | Multi-founder with vesting, no heavy economics |
| tech-studio | Venture | Adds governance + funding rounds + AMM positions |
| aeqi | Venture | The platform itself is a Venture-shape company |
| (future) | Fund | Reserved for investment-fund blueprints |

## How provisioning uses templates

In aeqi-platform's dao_provisioner, when provisioning a new Entity for a blueprint:

1. Read `blueprint.templateSlug` → one of `"foundation"`, `"entity"`, `"venture"`, `"fund"`
2. Compute `template_id_hex = keccak256(templateSlug)` — the on-chain templateId
3. Pass templateId in the `registerTRUST` tx
4. Factory looks up the registered template by templateId
5. Instantiates the module set on a new Entity proxy

**Key invariant:** templateId is computed from `templateSlug` (the canonical name), NOT from blueprint's own slug. A blueprint named "studio" with `templateSlug="entity"` maps to Entity template. The on-chain world never knows or cares about blueprint naming.

## What this enables

### Audit-friendly

Four templates × audit-cycle is bounded. Adding a new blueprint doesn't open the audit window. New blueprints ship as JSON, zero contract changes.

### Forward-compatible

New blueprints can ship without contract changes — just declare an existing `templateSlug`. Blueprint velocity is decoupled from contract audit cycles.

### Cross-chain portability

When Solana port lands, the same 4 archetypes map to Solana primitives (Squads-style multisig + Realms governance + token-2022 vesting). Templates are the chain-agnostic abstraction layer. JSON stays the same; `templateSlug` stays the same; underlying modules change per chain.

### Brand clarity

Marketing shows blueprints (many); platform/contract layer shows templates (4). Two layers, two audiences. Users see "Solo Founder" and "Tech Studio." Engineers see "entity" and "venture."

## Decision authority

**The 4-template structure is locked.** No further templates without explicit founder decision and audit budget allocation.

**Blueprints can be added freely.** Any `templateSlug` pointing at an existing (Foundation/Entity/Venture/Fund) template can ship as a JSON PR without contract review.

**Modifying an existing template's module set is a breaking contract change.** Don't. If Module Y needs a config change, bump its version on-chain and redeploy. Old Entities instantiated against the old template; new ones can opt into the new template via a new templateSlug if the change is significant enough.

## Open questions deferred

- **When does a 5th template become worth the audit cost?** Defer until a real blueprint can't fit any of the 4 existing templates. Prove market demand, then request founder decision and audit budget.
- **Should blueprints override individual module configs at templateSlug-resolution time?** E.g., "use Entity but with a tweaked vesting curve." Defer to v2. For now, blueprints are pure templateSlug selectors; module configs are locked per-template.
- **Cross-chain template parity?** EVM Foundation = Solana Foundation? Will surface during Solana port. Current assumption: archetypes map, but module implementations differ per chain.
