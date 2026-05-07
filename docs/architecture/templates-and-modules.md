# Templates and Modules: the Beacon-impl wiring trap

How aeqi's on-chain templates compose modules, what goes wrong when a template references a module slot with no implementation, and the discipline that prevents it.

This page is a sibling to [Canonical templates](/docs/architecture/canonical-templates) — that page tells you which four templates exist; this page tells you what has to be wired up for any of them to actually mint a TRUST.

## The four canonical templates

aeqi recognises exactly four on-chain templates. Each is a fixed module set chosen for one company archetype.

| Template | Modules | Use case |
|---|---|---|
| `foundation` | role + budget + token + vesting + foundation | Personal entities, non-profit shells, personal-OS archetype. No venture economics. |
| `entity` | role + budget + token + vesting + funding | Solo founders, studios, lightweight commercial entities. Has fundraising, no AMM/derivatives. |
| `venture` | role + budget + token + vesting + funding + uniswap + unifutures | Full DeFi capital formation: token, Uniswap v4 pool, UniFutures derivatives. |
| `fund` | role + token + vesting + budget + fund | Investment vehicles. Fund-provisioning archetype. Reserved — no current blueprint maps here. |

The `templateId` registered on-chain is `keccak256(<slug>)`. Source of truth: `aeqi-core/scripts/foundry/RegisterTemplates.s.sol`.

## The wiring requirement

A template is just a list of module slots. Each slot is identified by `keccak256(<moduleName>)`. At `registerTRUST` time the Factory walks the slot list in order and, for each slot, deploys a `BeaconProxy` whose implementation is read from the Beacon contract:

```
Beacon.getImplementation(factory, keccak256("role"))    -> RoleModule.sol
Beacon.getImplementation(factory, keccak256("budget"))  -> BudgetModule.sol
Beacon.getImplementation(factory, keccak256("token"))   -> TokenModule.sol
...
```

Two contracts have to agree:

- **`RegisterTemplates.s.sol`** — declares which slots each template lists.
- **`Deploy.s.sol`** — registers an implementation against each slot in the Beacon.

The set of slots that `Deploy.s.sol` registers must be a **superset** of every slot listed across all `_register*` functions in `RegisterTemplates.s.sol`. If a slot is declared in a template but missing from the Beacon, every `registerTRUST` call against that template reverts.

## The trap: `BeaconProxy_ImplementationNotFound()`

When a template lists a slot with no registered implementation, `Factory._createModules` reverts at the n-th module init:

- Custom error selector `0x269dea0a`
- Decodes to `BeaconProxy_ImplementationNotFound()`
- The slot in the trace is `keccak256(<missing-name>)`

The TRUST is never minted. Any IPFS pins (operating agreement, role descriptions) that were uploaded before the chain call are orphaned but harmless.

This is silent in the sense that nothing in the template registration script or the deploy script catches it — both succeed in isolation. The mismatch only surfaces at TRUST mint time.

## Two precedents

This trap has now surfaced twice in two weeks. Both fit the same shape.

### `keccak256("uniswap")` — 2026-05-05

The `venture` template listed the `uniswap` slot for `UniswapPositionManagerModule`, but `Deploy.s.sol` never registered it on the Beacon. Every venture-template TRUST reverted at module 5. Hot-fixed by `RegisterUniswapModule.s.sol` (one-shot script) plus a permanent addition to `Deploy.s.sol` for future chains.

Documented in `aeqi-core/CLAUDE.md` under "Deploy.s.sol must register ALL modules referenced by any template."

### `keccak256("foundation")` — 2026-05-08

The `foundation` template registers a 5th module slot named after itself, `keccak256("foundation")`. No `FoundationModule.sol` exists in the codebase; nothing in `Deploy.s.sol` wires that slot. Walk-3 of the autonomous-push gauntlet hit it: the LLM emitted `template: "foundation"` for a personal-OS-shaped brief, the architect's deploy seam computed `templateId = keccak256("foundation")`, the Factory reverted at module 5.

The `entity` and `venture` templates are fully wired and pass the same gauntlet deterministically.

## Fix recipe — chain side

Two options. Pick one based on whether the template's archetype carries semantics nothing else covers.

### Option A: shrink the template's module list

If the missing slot was speculative and there is no contract intended to occupy it, drop it from the `_register*` function:

1. Edit `aeqi-core/scripts/foundry/RegisterTemplates.s.sol`.
2. Remove the offending `mc[N] = _moduleConfig(keccak256("<name>"))` line.
3. Resize the `ModuleConfig[]` length accordingly.
4. Re-run `RegisterTemplates.s.sol` against the live factory:

   ```bash
   forge script scripts/foundry/RegisterTemplates.s.sol \
     --rpc-url <rpc> \
     --broadcast
   ```

   `Factory.replaceTemplate` is an UPSERT keyed by `templateId`, so re-running is idempotent. No contract redeploy. No factory address change. Existing TRUSTs minted under the old (broken) shape are unaffected — they have no entries for the dropped slot.

5. If `CanonicalConfigs.sol` had value-configs keyed under the dropped slot, drop those too.

This was the right shape for the `foundation` trap: the slot was never going to be filled, so the template's module set legitimately shrank to four.

### Option B: build and wire the missing module

If the slot represents a real archetype need (the `uniswap` case), build the contract:

1. Add `<Name>Module.sol` under `aeqi-core/contracts/modules/` following the `<Name>.module.sol` naming convention (see `aeqi-core/CLAUDE.md`).
2. Register an implementation in `Deploy.s.sol` against the slot key.
3. Run a one-shot hotfix script (e.g. `RegisterUniswapModule.s.sol`) to wire the new impl into the existing Beacon, so live chains pick it up without a full factory redeploy.
4. Update `CanonicalConfigs.sol` value-configs if the module needs runtime parameters.
5. Re-run `RegisterTemplates.s.sol` only if the slot list itself changed.

Option B is heavier and pulls in audit cost. Default to Option A unless the archetype demands the new module.

## Architect-side guard

The chain-side fix is the canonical layer. The architect adds defense in depth.

[The Architect](/docs/methodology/architect) takes a brief, asks an LLM to draft a blueprint, then deploys. The blueprint includes a `template` field. LLM output is non-deterministic — same brief, different sample, different template choice. Without a guard, an LLM that picks a known-broken template (`foundation` between 2026-05-04 and 2026-05-08) would revert every walk on that sample.

The schema-gate in `crates/aeqi-architect/src/llm.rs` narrows the allow-list to the templates the on-chain world is currently wired for:

```rust
const VALID_TEMPLATES: &[&str] = &["entity", "venture"];
```

Anything else snaps to `entity` (the smallest viable fully-wired template). `foundation` and `fund` ride along on the snap path on purpose — `foundation` was structurally broken until it was hot-fixed; `fund` is registered on-chain but has no walked blueprint behind it.

When chain-side wiring catches up, restore the entry in `VALID_TEMPLATES`. The walk gauntlet is the gate: a template is in the allow-list once a clean walk against a real blueprint mints a TRUST against it.

## Discipline going forward

Every change to `RegisterTemplates.s.sol` (or any new module slot in any template) must be paired with:

1. A matching entry in `Deploy.s.sol` registering the implementation against the slot key.
2. A walk against a real blueprint that minds a TRUST under the changed template, end-to-end.
3. An update to `VALID_TEMPLATES` in `crates/aeqi-architect/src/llm.rs` if the template is meant to be reachable from architect-driven flows.

The `templateId = keccak256(templateSlug)` invariant is locked — see `aeqi-core/CLAUDE.md`. Don't compute `templateId` from blueprint slugs; always hash the canonical template slug from the four-name set.

## Cross-references

- [Canonical templates](/docs/architecture/canonical-templates) — what the four templates are and which blueprints map onto them.
- [Factory flow](/docs/factory-flow) — the end-to-end company-genesis path on-chain.
- [TRUST](/docs/concepts/trust) — what gets minted at the end of a successful `registerTRUST`.
- [The Architect](/docs/methodology/architect) — the chat-shape surface that drives blueprint selection.
- `aeqi-core/scripts/foundry/RegisterTemplates.s.sol` — source of truth for template module sets.
- `aeqi-core/CLAUDE.md` — `Deploy.s.sol must register ALL modules referenced by any template`.
