# Stacks, profiles, and the first sketch of the Architect

aeqi v0.42.0 takes the surface a Company lives on and turns it inside out: edges between Companies are real, the Company has a public face, and the room where you describe a Company in English exists.

Five things landed.

## On-chain stack edges

Stack blueprints have shipped since v0.31.0 — pick "VC fund + 3 portfolio companies" or "founder + spinout," fill in the names, click create. What didn't ship until v0.42.0 was the part where the *edges between* the Companies are real on-chain transfers and role grants. Until W33B closed, every edge result came back with `status: "skipped"` and the message "on-chain edge application stubbed in v1."

Now they execute. `TokenOwnership { percent_bps: 3000 }` actually transfers a 30% slice of the spinout's token from the spinout to the founder's personal entity. `RoleAssignment { role_type: "founder" }` actually mints a Founder role on the spinout TRUST and binds the personal entity's address to it. `TreasuryFlow` is still scaffolded — the schedule subscription needs a per-TRUST cron that doesn't exist yet — but ownership and role grants are settled the moment the stack provisions.

This is the difference between "a directory of related Companies" and "a holding structure." The org chart of the holding structure is the union of the per-Company role graphs, joined by cross-Company role grants. It renders as one tree because it IS one tree.

## Public Profiles at `/<slug>`

Every Company gained a public-facing column on its placement row: `public: 0|1`. Toggling it to `1` opens `app.aeqi.ai/<entity_id>` to anyone — no auth, no login, no Stripe gate. You see the Company's display name, tagline, public roles, and any idea tagged `public` or `public:*`.

The shape is deliberate. There is no separate slug column — the URL segment IS the entity_id. There is no separate `public_ideas` table — visibility is a tag. There is a reserved-slug deny list (`me`, `admin`, `start`, `studio`, `economy`, `blueprints`, every auth path, every static asset prefix) so the public route can never shadow the app shell. The list lives in `apps/ui/src/App.tsx` as `RESERVED_SLUGS` and is the single source of truth.

The route is read-only and degrades gracefully: if the runtime is asleep, the hero (name + tagline) still returns; roles and ideas just come back empty. A public profile that 503s because the runtime hasn't woken up isn't a public profile.

See [Public profile flag](/docs/patterns/public-profile-flag) for the engineering shape.

## The Architect surface, stubbed

The Architect agent is the wedge that makes aeqi uncopyable: describe an organization in English, get it deployed on-chain in 60 seconds. The full stack ships in waves. v0.42.0 lands the first one.

`/studio` is now a real surface in the dashboard. It accepts a paragraph of intent, calls a stub LLM that returns a hand-written stack blueprint, and renders the components + edges as a tree you can spawn. The LLM is stubbed today; the wire is real. The architect crate exists, the IPC verb is plumbed, the tools are registered. Every layer below the model call is solid — when Wave 35 wires a real model in, nothing else has to change.

The shape we're building toward, in one sentence: type "research lab plus five spinout companies, lab holds 30% of each" and the room replies with a stack. You review, you spawn, you're running. Today you have to pick the blueprint by hand. Tomorrow you describe it.

> The point of the company OS for the agent economy is not that agents exist. The point is that the founder's stream of thought becomes the company's execution loop, with no translation layer in between.

That sentence is the test. The Architect is the loop's earliest turn — the room responds *before* the workspace exists.

## Settings is gone; the hero strip owns Overview

The Company rail used to end with a Settings tab. It held three things: the display name input, the tagline input, and the public toggle. None of them belonged in a tab. They are properties of the Company itself — the things you see immediately when you open the page.

So Settings is dead. Display name, tagline, and the public switch live in an `EntityHeroStrip` at the top of Overview, where they are visible without a click and editable in place. The other Settings concerns — signer rotation, passkey enrollment — live on the agent's rail, where they conceptually belong (an agent's keys, not a Company's).

The Company rail is shorter now: Overview · Roles · Ownership · Treasury · Governance. Five tabs, each a substantive surface, none a settings junk drawer.

## Tables in Ideas

BlockNote tables landed in the Idea editor. Every Idea — every CRM contact, every SOP, every meeting note, every roadmap — can now hold a table block. Headers, rows, alignment, the lot.

This is not a feature. It is a deletion. A user who needs a table in a doc no longer has to think "this should be a spreadsheet, somewhere else, in another tool, with another set of credentials." The substrate carries it. Ideas are Notion-shaped and they shipped table support the same way Notion did — by enabling a default block that already existed in the editor schema.

> Drop a thought into Ideas. It is a real document.

The thesis from v0.41.0 keeps getting truer. Tables aren't the headline; tables are what you'd expect a real document to do.

## What's next

v0.43.0 / Wave 35 wires a real LLM into the Architect. The /studio room becomes a chat surface — multi-turn refinement, cost preview, spawn-on-confirm. The hardest design problem there isn't the model; it's the conversation shape (when does the architect ask, when does it decide, what does the user see between "describe" and "deploy"). The wire is real. The model is the next thread.

After that: the Personal Entity gets its own TRUST surface (Phase 1 already provisions; Wave 33B will surface ownership in `/me/ownership`), the `/c/<id>` URL stops being canonical (308 redirects to `/trust/<address>`), and the æconomy gains the hireable opt-in.

The product had primitives. It had architecture. It had a thesis. v0.42.0 is the first release where Companies start talking to each other on-chain, where they have public faces, and where the room that designs them exists.

## Related

- [Stack edges — on-chain orchestration](/docs/architecture/canonical-templates)
- [Public profile flag](/docs/patterns/public-profile-flag)
- [Public companies](/docs/patterns/public-companies)
- [TRUST — On-Chain Primitive](/docs/concepts/trust)
- [The co-creation surface lands](/docs/blog/0004-co-creation-surface)
