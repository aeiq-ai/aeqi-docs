# Factory Flow Reference

> **Protocol reference — deployment-dependent.** This page describes the
> on-chain path for provisioning a Company on Solana. Most operators never
> touch it: launching a Company through the App, Architect, or API does not
> require reading this. The canonical chain is **Solana/Anchor**. The prior
> EVM/Solidity factory (`registerTRUST`, `Factory.sol`) is **retired**.

**Companion docs:**
- [Templates & modules](/docs/architecture/templates-and-modules) — company templates and the module system.
- [Company template schema](/docs/reference/blueprint-schema) — the JSON manifest spawned into a runtime Company.

## Programs

The on-chain factory lives at `projects/aeqi-solana/programs/aeqi-factory`. It
composes CPI calls into per-module Anchor programs: `aeqi-company` (the
Company account itself), `aeqi-role`, `aeqi-token`, `aeqi-governance`,
`aeqi-treasury`, `aeqi-budget`, `aeqi-vesting`, `aeqi-fund`, `aeqi-funding`,
and `aeqi-unifutures`.

## Accounts

- **Company PDA** — `[b"company", company_id]` under the `aeqi-company` program. Created via `aeqi_company::initialize`; the caller becomes the company authority.
- **Template PDA** — `[b"template", template_id]` under `aeqi-factory`. Stores a registered module set (`ModuleSpec[]`) and an ACL edge list (`AclEdgeSpec[]`) so it can be replayed against a fresh Company.
- **ModuleSpec** — `{ module_id, program_id, provider, implementation_version, implementation_metadata_hash, company_acl }`, one per module a template declares.
- **AclEdgeSpec** — `{ source_module_id, target_module_id, flags }`, an inter-module authority edge applied via `aeqi_company::set_module_acl`.

## Instructions

`aeqi-factory` exposes these instructions (all in `src/lib.rs`):

- `create_company(company_id)` — initializes a fresh Company PDA. Skeleton path; no modules.
- `create_with_modules(company_id, modules)` — initializes the Company and registers each declared module, but **does not finalize** — the caller still owes each module's `init` CPI plus a final `aeqi_company::finalize` once those land.
- `create_company_full(company_id, role_module_id, token_module_id, gov_module_id, ...)` — the fully atomic path: initialize, register the role/token/governance modules, CPI each module's `init`, write the token config bytes, finalize each module, then finalize the Company — all in one transaction.
- `register_template(template_id, modules, acl_edges)` — stores a reusable module + ACL graph in a Template PDA.
- `instantiate_template(company_id)` — reads a registered Template PDA and replays its module set and ACL edges against a fresh Company. Like `create_with_modules`, it **does not finalize**; the caller runs the per-module `init` CPIs and the Company finalize afterward.

## Flow

1. **Register** (once per template) — an admin calls `register_template` with the module set and ACL graph. This is the on-chain analog of a company template manifest.
2. **Provision** (once per Company) — either the atomic `create_company_full` for the common role + token + governance shape, or the two-step `create_with_modules` / `instantiate_template` path followed by per-module `init` CPIs and a final `aeqi_company::finalize`.
3. **Operate** — once finalized, the Company's modules are live; further changes to ACL edges or module config go through each module's own instructions, not the factory.

## Notes

- Module ids and template ids are caller-supplied `[u8; 32]` values — the factory does not derive them from a hash of a name; templates are looked up by the PDA seed, not a content hash.
- `create_with_modules` and `instantiate_template` intentionally leave the Company in creation mode after registering modules — finalizing early there breaks every subsequent module `init` (`CompanyNotInCreationMode`), a bug class fixed on 2026-05-17.
- Errors are typed (`FactoryError`): empty/oversized module sets, mismatched `remaining_accounts` counts, duplicate module ids, unknown ACL module references, inactive module implementations, and implementation-account mismatches.
