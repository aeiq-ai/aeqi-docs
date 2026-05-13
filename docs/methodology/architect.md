# The Architect

The Architect is aeqi's design surface. Describe a TRUST in English; get a programmable company draft. The room that designs companies lives at `/studio`.

This page is the methodology view — what the Architect does and why the conversation is shaped the way it is. For the implementation arc (Wave 34 + 35), see the canonical memory note.

## What it is

`/studio` is a chat surface, not a wizard. You type a brief — a paragraph of intent — and the Architect drafts a TRUST. Roles, agents, charters, kickoff Quests, mission and values copy. You refine the draft in conversation. When the shape is right, you deploy. The programmable company spins up and you land in the new workspace.

Four turns:

1. **Brief.** A paragraph of intent. What is this TRUST, what does it do, what kind of org chart fits.
2. **Draft.** The Architect emits a Blueprint — a single-TRUST schema, or a StackBlueprint for a multi-TRUST graph.
3. **Refine.** Multi-turn edits in chat. "Add a Head of Partnerships." "Make it global." "Drop the marketing seat for now." Each turn returns a new draft; the parts you didn't ask about stay put.
4. **Deploy.** One click. The platform writes the placement, prepares protocol state when enabled, and opens the TRUST workspace.

The brief is the input. The blueprint is the artifact. The deploy is the cutover.

## Why a chat shape

The thing being designed — a programmable company — is conversational by nature. A founder in their head doesn't have a complete blueprint; they have a thesis and a set of constraints. A wizard with 30 fields demands the founder pre-decide every field. A chat lets the Architect ask only what matters next, and lets the founder change their mind without rewinding a stepper.

This is the same loop as [Co-creation](/docs/methodology/co-creation), one turn earlier. Co-creation says the workspace interviews the founder *after* the TRUST exists. The Architect says the room that designs the TRUST interviews the founder *before* it exists. The chat surface ships before the workspace does.

## What gets generated

The Architect composes from existing primitives only — it does not invent new shapes. A draft is always a valid Blueprint, conformant to the same schema the wizard and stack templates use:

- `Roles` — the org chart (director, executive, officer, lead, contributor, advisor) with edges declaring authority.
- `Agents` — the runtime workers, each bound to a role.
- `Charters` — an always-on Idea per agent describing voice and boundaries (see [Personality as an Idea](/docs/patterns/personality-as-idea)).
- `Ideas` — mission, values, default SOPs, regulatory tracker when applicable.
- `Events` — daily / weekly / monthly cadences, paused by default.
- `Quests` — one or two open kickoff Quests per agent.
- `Template` — one of the four canonical on-chain templates (see [Canonical Templates](/docs/architecture/canonical-templates)).
- `IPFS metadata` — name, slug, description, operating agreement.

For multi-TRUST architectures (a fund with portfolio companies, a platform with subsidiaries, an artist with multiple ventures), the Architect emits a StackBlueprint — `components[]` plus `edges[]`. Each component is a single-TRUST Blueprint; edges declare orchestration relationships between TRUSTs.

## Refinement is surgery, not regeneration

A refinement turn reads as an edit. "Add a Head of Partnerships" returns a draft with one new role and one new agent, plus copy that mentions partnerships. The existing roles, agents, charters, and slug stay untouched. The Architect surgically extends the structure; it does not rewrite the parts you didn't ask about.

This matters because a wizard-shape "regenerate the whole thing on every edit" loses every prior decision. A surgical refine keeps the founder's accumulating context intact.

## Schema gating — soft, not hard

LLMs emit natural-language enum values that don't match the canonical set. A draft might come back with `role_type: "contractor"` or `"consultant"`. Validating-and-failing breaks the chat shape — the founder sees an error instead of a draft.

The Architect snaps unknown enum values to the nearest canonical at the spawn boundary, before runtime IPC. Known synonyms map (`contractor` → `operational`); unknowns fall to a safe default. The draft renders. The founder iterates.

## Deploy is one cutover

Deploy is not a separate flow — it's a button on the conversation. When pressed, the platform mirrors the same provisioning shape as `/api/start/launch`:

1. Write `runtime_placements` (so the indexer and proxy know where the TRUST lives).
2. Register protocol state when enabled (Factory contract, IPFS pinning, `registerTRUST` UserOp).
3. Spawn the runtime sandbox with the Blueprint inlined.
4. Bounce the founder to `/c/<entity_id>` → 308 → `/trust/<address>`.

There is no separate "deploy" runtime IPC. Deploy lives at the platform tier where placements live. Architect refinement runs against the runtime via IPC; provisioning runs at the platform.

## What this replaces

The Architect replaces the Blueprint picker for users who want to *describe* a TRUST rather than *select* one. Both surfaces stay live:

- **`+ New TRUST` modal** (Blueprint picker) — pick a pre-built shape (Personal, Venture, Fund, etc.). Fast for known archetypes.
- **`/studio`** (Architect) — describe an arbitrary org chart in English. Fast for unknown shapes.

A founder building a venture studio that owns three operating companies, a treasury, and a research arm is not picking from a menu. The Architect is the menu's escape hatch.

## What's next

Today's `/studio` produces single Blueprints and StackBlueprints, deploys them, and lands the founder in the workspace. The next moves:

- **Cost preview before deploy.** Today, deploy is one click; tomorrow, the conversation surfaces gas, IPFS, and 30-day inference cost in-band before the click.
- **On-chain edges.** StackBlueprint emits the structural graph; current implementation deploys components in series and stubs the edge calls. The wedge ships when component-A registers component-B as a subsidiary on-chain at TRUST registration time.
- **Architect as agent.** Today the Architect is a meta-agent on the platform tier. The next thread is making it a runtime agent inside each new TRUST workspace — the founder's first hire, who then helps refine the org over time, not just at genesis.

## Related

- [Co-creation](/docs/methodology/co-creation) — the loop the Architect's output feeds into.
- [Composition](/docs/methodology/composition) — Quest-wraps-Idea, Project-wraps-Idea, Blueprint-wraps-everything.
- [Org architecture](/docs/methodology/org-architecture) — what a TRUST is once the Architect has shaped it.
- [Canonical Templates](/docs/architecture/canonical-templates) — the four on-chain archetypes the Architect picks from.
- [Blueprint schema](/docs/reference/blueprint-schema) — the artifact the Architect emits.
- [Stacks, profiles, and the first sketch of the Architect](/docs/blog/0005-stack-edges-and-public-profiles) — release context from the stub-stage.
