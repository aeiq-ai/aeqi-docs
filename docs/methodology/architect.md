# The Architect

The Architect is aeqi's company-design engine. Describe a Company in English; get a programmable company draft. Today it powers the launch surface at `/launch`; a fully chat-driven design room (previously prototyped at `/studio`) is not currently shipped.

This page is the methodology view — what the Architect does and why the loop is shaped the way it is.

## What it is

The Architect is a draft-and-refine backend, not a wizard. You give it a brief — a paragraph of intent — and it drafts a Company. Roles, agents, charters, kickoff Quests, mission and values copy. You refine the draft in follow-up turns. When the shape is right, you deploy. The programmable company spins up and you land in the new workspace.

The runtime exposes this as two verbs — `architect.draft` and `architect.refine` — and the platform exposes deploy as `POST /api/architect/deploy`. The launch page at `/launch` is the current front end to this loop.

Four turns:

1. **Brief.** A paragraph of intent. What is this Company, what does it do, what kind of org chart fits.
2. **Draft.** The Architect emits a Blueprint — a single-Company schema, or a StackBlueprint for a multi-Company graph.
3. **Refine.** Multi-turn edits in chat. "Add a Head of Partnerships." "Make it global." "Drop the marketing seat for now." Each turn returns a new draft; the parts you didn't ask about stay put.
4. **Deploy.** One click. The platform writes the placement, prepares protocol state when enabled, and opens the Company workspace.

The brief is the input. The blueprint is the artifact. The deploy is the cutover.

## Why a conversational shape

The thing being designed — a programmable company — is conversational by nature. A founder in their head doesn't have a complete blueprint; they have a thesis and a set of constraints. A wizard with 30 fields demands the founder pre-decide every field. A draft-and-refine loop lets the Architect ask only what matters next, and lets the founder change their mind without rewinding a stepper.

This is the same loop as [Co-creation](/docs/methodology/co-creation), one turn earlier. Co-creation says the workspace interviews the founder *after* the Company exists. The Architect says the engine that designs the Company interviews the founder *before* it exists.

## What gets generated

The Architect composes from existing primitives only — it does not invent new shapes. A draft is always a valid Blueprint, conformant to the same schema the wizard and stack templates use:

- `Roles` — the org chart (director, executive, officer, lead, contributor, advisor) with edges declaring authority.
- `Agents` — the runtime workers, each bound to a role.
- `Charters` — an always-on Idea per agent describing voice and boundaries (see [Personality as an Idea](/docs/patterns/personality-as-idea)).
- `Ideas` — mission, values, default SOPs, regulatory tracker when applicable.
- `Events` — daily / weekly / monthly cadences, paused by default.
- `Quests` — one or two open kickoff Quests per agent.
- `Template` — one of the two shipped Company shapes, `company` or `venture`; unknown or not-yet-wired template names are snapped to a safe default rather than failing the draft (see [Canonical Templates](/docs/architecture/canonical-templates)).
- `IPFS metadata` — name, slug, description, operating agreement.

For multi-Company architectures (a fund with portfolio companies, a platform with subsidiaries, an artist with multiple ventures), the Architect emits a StackBlueprint — `components[]` plus `edges[]`. Each component is a single-Company Blueprint; edges declare orchestration relationships between Companies.

## Refinement is surgery, not regeneration

A refinement turn reads as an edit. "Add a Head of Partnerships" returns a draft with one new role and one new agent, plus copy that mentions partnerships. The existing roles, agents, charters, and slug stay untouched. The Architect surgically extends the structure; it does not rewrite the parts you didn't ask about.

This matters because a wizard-shape "regenerate the whole thing on every edit" loses every prior decision. A surgical refine keeps the founder's accumulating context intact.

## Schema gating — soft, not hard

LLMs emit natural-language enum values that don't match the canonical set. A draft might come back with `role_type: "contractor"` or `"consultant"`. Validating-and-failing breaks the chat shape — the founder sees an error instead of a draft.

The Architect snaps unknown enum values to the nearest canonical at the spawn boundary, before runtime IPC. Known synonyms map (`contractor` → `operational`); unknowns fall to a safe default. The draft renders. The founder iterates.

## Deploy is one cutover

Deploy is not a separate flow — it's a button on the conversation. When pressed, the platform mirrors the same provisioning shape as `/api/start/launch`:

1. Write `runtime_placements` (so the indexer and proxy know where the Company lives).
2. Register protocol state when enabled.
3. Spawn the runtime sandbox with the Blueprint inlined.
4. Bounce the founder to the new Company at `/company/<address-or-id>`.

There is no separate "deploy" runtime IPC. Deploy lives at the platform tier where placements live. Architect refinement runs against the runtime via IPC; provisioning runs at the platform.

## What this replaces

The Architect complements the template picker for founders who want to *describe* a Company rather than *select* one:

- **`/launch`** (template picker) — pick a pre-built shape. Fast for known archetypes.
- **Architect draft/refine** — describe an arbitrary org chart in English. Fast for unknown shapes.

A founder building a venture studio that owns three operating companies, a treasury, and a research arm is not picking from a menu. The Architect is the menu's escape hatch.

## What's next

Today the Architect drafts and refines Blueprints and StackBlueprints behind the launch surface, deploys them, and lands the founder in the workspace. The next moves:

- **A dedicated chat surface.** The chat-driven design room (`/studio`) was prototyped and is not currently shipped; when it returns, it will be the same draft/refine loop with the conversation as the primary surface.
- **Cost preview before deploy.** Today, deploy is one click; tomorrow, the flow surfaces projected running cost in-band before the click.
- **Protocol edges.** StackBlueprint emits the structural graph; today the components deploy in series and the cross-company edges are not yet written at the protocol layer.
- **Architect as agent.** Today the Architect is a meta-agent on the platform tier. The next thread is making it a runtime agent inside each new Company workspace — the founder's first hire, who then helps refine the org over time, not just at genesis.

## Related

- [Co-creation](/docs/methodology/co-creation) — the loop the Architect's output feeds into.
- [Composition](/docs/methodology/composition) — Quest-wraps-Idea, Project-wraps-Idea, Blueprint-wraps-everything.
- [Org architecture](/docs/methodology/org-architecture) — what a Company is once the Architect has shaped it.
- [Canonical Templates](/docs/architecture/canonical-templates) — the Company shapes the Architect picks from.
- [Blueprint schema](/docs/reference/blueprint-schema) — the artifact the Architect emits.
- [Stacks, profiles, and the first sketch of the Architect](/docs/blog/0005-stack-edges-and-public-profiles) — release context from the stub-stage.
