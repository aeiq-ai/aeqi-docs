# Canonical on-chain archetypes

aeqi defines a small set of on-chain **archetypes** — `entity`, `venture`,
`foundation`, and `fund`. Each is a fixed module set for one company shape.
Two on-chain templates are registered with the Solana factory today — BASIC
and VENTURE; the rest of the archetype set is protocol direction. Many
off-chain **company templates** can map to one archetype (N-to-1).

Don't confuse the two layers: the archetype is the protocol module set the
chain registers; the company template is the off-chain starter kit a user
launches. See [Templates and modules](/docs/architecture/templates-and-modules)
for the distinction.

## The two-layer architecture

**On-chain:** archetype templates registered with the Solana factory program
(`projects/aeqi-solana/programs/aeqi-factory`). Each archetype is a set of module
programs; this is what the chain sees. The factory registry today holds two
shipped templates — **BASIC** (role + token + governance) and **VENTURE**
(BASIC + treasury + vesting + unifutures). The four archetypes below describe
the protocol direction those registrations grow into.

**Off-chain:** company templates in JSON (`aeqi/presets/templates/*.json`). Each
declares a `template` field selecting one archetype, then layers agent role
trees, ideas, events, views, and default personas on top. The shipped public
catalog is two templates — `new-company` and `existing-company` — both on the
`entity` archetype. Other manifests are draft inventory.

## The four archetypes (protocol direction)

### Foundation

- **Module set:** role + budget + token + vesting + foundation
- **Use case:** philanthropic / non-equity orgs. Budget-and-vesting economics, no funding rounds, no AMM.

### Entity

- **Module set:** role + budget + token + vesting + funding
- **Use case:** lightweight companies and studios — cap table and employees, no heavy AMM/derivatives. **Both shipped company templates use this archetype.**

### Venture

- **Module set:** role + budget + token + vesting + funding + treasury + unifutures
- **Use case:** full economic stack — equity issuance, AMM positions, token-curated funding.

### Fund

- **Module set:** role + token + vesting + budget + fund
- **Use case:** investment funds (NAV tracking, LP positions, fund flows), not companies that raise capital. Reserved; no public template maps here yet.

## Why a small archetype set

### Complexity ladder

Foundation → Entity → Venture form a staircase: each adds modules without
breaking prior configs. The ladder is intentional. à-la-carte module selection
is rejected — the audit surface would explode.

### Fund is orthogonal

Fund swaps "funding" for "fund" — a different lifecycle. Investment vehicles
manage LP capital rather than fundraising, so it earns its own archetype.

### Audit cost discipline

On-chain audits are expensive per surface. A bounded archetype set keeps review
cost bounded; new company templates ship as JSON with zero contract changes.

### Fewer archetypes doesn't mean less differentiation

`new-company` and `existing-company` both live on `entity` without losing
meaning. The difference is off-chain — role trees, seed events, operating
instructions, default allocations — all in JSON and the runtime. The chain
stays simple.

## Public company template → archetype mapping

| Company template | Archetype | Why |
|---|---|---|
| `new-company` | entity | Full-team company starter on the lightweight commercial archetype. |
| `existing-company` | entity | Operating-import starter on the same lightweight archetype. |

## Draft inventory

Manifests under `presets/templates/drafts/` exist for future work but are not in
the public catalog. Promoting a draft is a product decision: it needs a fresh
audit of its operating copy, seed roles, seed quests, and protocol assumptions.

## How provisioning uses archetypes

When the platform provisions a new Company for a template:

1. Read the template's `template` field → one of `entity`, `venture`, `foundation`, `fund`.
2. Resolve the archetype to its registered on-chain `templateId` — a fixed 32-byte identifier holding a short ASCII handle (`"BSC"`, `"VNT"`), zero-padded.
3. Pass the `templateId` when registering the Company with the Solana factory.
4. The factory looks up the registered archetype by its template PDA (`[b"template", template_id]`) and instantiates its module set on the new Company account.

**Key invariant:** the `templateId` is derived from the archetype's on-chain
handle, never from the company-template slug. A company template named
`new-company` with `template: "entity"` registers under the archetype's
on-chain template; the on-chain world never knows or cares about the off-chain
template's name.

## Decision authority

- **The archetype set is locked.** No new archetype without an explicit founder decision and audit budget.
- **Company-template drafts can be added freely.** A draft pointing at an existing archetype needs no new contract review by itself; making it public is a product decision.
- **Modifying an existing archetype's module set is a breaking contract change.** Bump a module version and redeploy rather than mutate an archetype in place.

## Related

- [Templates and modules](/docs/architecture/templates-and-modules) — the off-chain/on-chain split and the chain layer.
- [Blueprint schema](/docs/reference/blueprint-schema) — the company-template JSON manifest.
- [On-chain layer](/docs/concepts/company) — the chain construct behind a Company.
