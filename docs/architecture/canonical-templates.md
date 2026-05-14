# Four Canonical Templates

aeqi uses four locked on-chain templates. Each is a pre-configured module set for a specific TRUST archetype. Many off-chain blueprints can map to one template (N-to-1 mapping).

## The two-layer architecture

**On-chain:** 4 canonical templates in Factory.sol. Exactly these archetypes. ~200 module addresses + value-config bytes per template. What the chain sees.

**Off-chain:** Blueprints in JSON. Each declares a `templateSlug` selecting one of the 4. Blueprints layer agent role trees, ideas, events, sessions, and default persona on top of the on-chain shape. Runtime concerns the chain doesn't model. The public catalog currently ships only the conservative `aeqi` default; specialized manifests remain draft inventory until their product and protocol assumptions are audited.

## The four templates

### Foundation

- **Module set:** role + budget + token + vesting + foundation
- **Use case:** Philanthropic / non-equity orgs. Governance is opinionated; economics are budget-and-vesting-only (no funding rounds, no AMM).
- **Default for:** draft personal and foundation-style blueprints
- **Bytecode:** ~45k (5 modules)

### Entity

- **Module set:** role + budget + token + vesting + funding
- **Use case:** Lightweight joint companies. Startups with cap table and employees but no heavy Uniswap/Unifutures economics.
- **Default for:** draft solo-founder and studio-style blueprints
- **Bytecode:** ~48k (5 modules)

### Venture

- **Module set:** role + budget + token + vesting + funding + uniswap + unifutures
- **Use case:** Full economic stack. Companies that issue equity, run AMM positions, do token-curated funding.
- **Default for:** aeqi and future venture-style blueprints
- **Bytecode:** ~62k (7 modules)

### Fund

- **Module set:** role + token + vesting + budget + fund
- **Use case:** Investment funds. Fund-provisioning pattern (NAV tracking, LP positions, fund flows), not companies that raise capital.
- **Default for:** (reserved for fund-archetype blueprints; not yet mapped)
- **Bytecode:** ~48k (5 modules)

## Why exactly four

### Complexity ladder

Foundation → Entity → Venture form a staircase: each adds modules horizontally without breaking prior configs. A TRUST coded for Foundation can't suddenly demand Uniswap. A TRUST coded for Entity can't run futures. The ladder is intentional.

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

A studio draft and a software-studio draft can live on Entity without losing meaning. The difference isn't on-chain; it's in:
- Role trees
- Seed events
- Operating instructions
- Default treasury allocations

All of that lives in JSON and the runtime. The chain stays simple.

### Prior art precedent

The original aeqi-app already used this 4-archetype taxonomy (Foundation/Entity/Venture/Fund routes in `/app/(app)/`). We're codifying that proven shape into on-chain primitives.

## Public blueprint → template mapping

| Blueprint | Template | Why |
|---|---|---|
| aeqi | Venture | The default TRUST shell uses the venture template already wired for hosted genesis. Its JSON stays minimal: one primary agent, one Steward, shared memory, a bootstrap Quest, and weekly review. |

## Draft blueprint inventory

These manifests exist in the repo for future work but are not embedded in the public catalog:

| Draft | Intended template | Status |
|---|---|---|
| personal-os | Entity | Draft; not public. |
| solo-founder | Entity | Draft; not public. |
| studio | Entity | Draft; not public. |
| tech-studio | Venture | Draft; not public. |
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

Users see Blueprints only when the product can stand behind the operating behavior. Engineers still see templates as the underlying contract archetypes.

## Decision authority

**The 4-template structure is locked.** No further templates without explicit founder decision and audit budget allocation.

**Blueprint drafts can be added freely.** A draft that points at an existing template does not require a new contract review by itself. Making that draft public is a product decision: it needs a fresh audit of the operating copy, seed roles, seed Quests, and protocol assumptions.

**Modifying an existing template's module set is a breaking contract change.** Don't. If Module Y needs a config change, bump its version on-chain and redeploy. Old Entities instantiated against the old template; new ones can opt into the new template via a new templateSlug if the change is significant enough.

## Open questions deferred

- **When does a 5th template become worth the audit cost?** Defer until a real blueprint can't fit any of the 4 existing templates. Prove market demand, then request founder decision and audit budget.
- **Should blueprints override individual module configs at templateSlug-resolution time?** E.g., "use Entity but with a tweaked vesting curve." Defer to v2. For now, blueprints are pure templateSlug selectors; module configs are locked per-template.
- **Cross-chain template parity?** EVM Foundation = Solana Foundation? Will surface during Solana port. Current assumption: archetypes map, but module implementations differ per chain.
