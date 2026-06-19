# Templates and modules

How aeqi separates the **company-template catalog** (the off-chain starter kits a
user launches from) from the **on-chain archetype** each template maps to, and
where the chain layer lives today.

This page is a sibling to [Canonical templates](/docs/architecture/canonical-templates).

## Two layers, two meanings of "template"

The word "template" names two different things; keep them apart:

| Layer | What it is | Source of truth |
|---|---|---|
| **Company template** (off-chain) | The starter kit a user launches: root agent, seed agents, roles, events, ideas, quests, views. | `aeqi/presets/templates/*.json`, deserialized as `aeqi_orchestrator::ipc::templates::CompanyTemplate`. |
| **On-chain archetype** (the `template` field) | The protocol module set a Company registers under. One of `entity \| venture \| foundation \| fund`. | The Solana factory program (`projects/aeqi-solana/programs/aeqi-factory`). |

Each company template declares an on-chain archetype via its `template` field.
The two layers are decoupled: the off-chain catalog can change (new seed
agents, new copy) without any contract change, because the archetype is just a
string the factory hashes.

## The live company-template catalog

The product ships **exactly two** company templates (founder decision
2026-06-10):

| Slug | On-chain archetype | What |
|---|---|---|
| `new-company` | `entity` | A new company with a full team behind one CEO — Chief of Staff, CTO, CMO, CFO, Advisor, and Associate. The default launch template. |
| `existing-company` | `entity` | Import an existing operation: capture offers, customers, and workflows, map the highest-friction bottleneck, and open the first improvement quest. |

Both map to the `entity` archetype on-chain. Other manifests live as draft
inventory under `presets/templates/drafts/` and are not part of the public
catalog until they pass a fresh product and protocol audit. See
[Blueprint schema](/docs/reference/blueprint-schema) for the full field
reference and the catalog/spawn endpoints.

## The chain layer is Solana

The on-chain protocol is shipped as Anchor programs under
`projects/aeqi-solana/programs/`:

- `aeqi-factory` — registers archetype templates and mints Company accounts.
  Templates are stored at the PDA seeded `[b"template", template_id]`.
- `aeqi-company`, `aeqi-role`, `aeqi-token`, `aeqi-vesting`, `aeqi-budget`,
  `aeqi-funding`, `aeqi-treasury`, `aeqi-governance`, `aeqi-fund`,
  `aeqi-unifutures` — the module programs an archetype composes.

The factory's `templateId` is derived from the archetype slug (`keccak256` of
the `template` string), **not** from the company-template slug. A company
template named `new-company` with `template: "entity"` registers under the
`entity` archetype; the chain never sees the off-chain slug.

> **Historical note — the EVM era.** Earlier versions of aeqi ran the protocol
> on EVM (Solidity contracts, a Foundry `Deploy.s.sol` / `RegisterTemplates.s.sol`
> deploy flow, and a Beacon-proxy module wiring scheme). That stack — including
> the `BeaconProxy_ImplementationNotFound()` trap where a template referenced a
> module slot with no registered implementation — is retired. The
> Beacon/Factory wiring discipline described in older docs applies only to that
> legacy EVM deployment, not to the current Solana programs.

## Cross-references

- [Canonical templates](/docs/architecture/canonical-templates) — the on-chain archetypes and how company templates map onto them.
- [Blueprint schema](/docs/reference/blueprint-schema) — the company-template JSON manifest.
- [TRUST](/docs/concepts/company) — the on-chain layer behind a Company.
- [The Architect](/docs/methodology/architect) — the chat surface that drives template selection.
- `projects/aeqi-solana/programs/aeqi-factory` — the on-chain factory program.
