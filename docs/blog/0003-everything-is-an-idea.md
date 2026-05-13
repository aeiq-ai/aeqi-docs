# Everything is an Idea

I'll save you the email I get every two weeks.

> "Hey, you should add a Customers tab. CRMs are huge."
>
> "Hey, you should add a Hiring tab. Recruiters need a pipeline."
>
> "Hey, you should add a Documents tab. People want to store SOPs."

Every two weeks, somebody asks for a new primitive. Every two weeks, the answer is the same: **it's already there. It's an Idea.**

This post is the database thesis. Why aeqi has five primitives instead of fifty.

## The trap

Most products grow by adding nouns. They start with `Project`. Then someone asks for a CRM, so `Customer` ships. Then someone asks for hiring, so `Candidate` ships. Then someone asks for vendor management, so `Vendor` ships. Five years in, the schema has 40 primitives. Each one has its own table, its own permission model, its own UI surface, its own search index, its own notification rules.

The product is now a coral reef. New features take six months because every change ripples through 40 tables. Permissions are unprovably correct because they're implemented per-primitive. Search returns five different shapes from five different code paths. Customer support has to memorize 40 nouns to triage a ticket.

This is what happens when you mistake a *view* for a *primitive*.

## The fix: one universal noun

Notion did this right. A page is a page is a page. A wiki entry, a meeting note, a customer record, a roadmap item — all pages with different properties and different views. One substrate; many renderings.

aeqi does the same. **One universal noun: the Idea.**

A CRM contact is an Idea with `kind:customer`.
A hiring candidate is an Idea with `kind:recruit`.
A vendor record is an Idea with `kind:vendor`.
A SOP is an Idea with `kind:sop`.
A blog draft is an Idea with `kind:blog_post`.
A press contact is an Idea with `kind:press`.

Same identity-noun. Different tag. Different view.

When you ask for a Customers tab, the right answer isn't "we'll add a Customer primitive in Q3." The right answer is "filter Ideas by `kind:customer`, save the view, name it Customers." Done in a config update, no schema change.

## What the substrate gives you for free

Once everything is an Idea, every Idea inherits:

- **Full-text search** (one index, not 40).
- **Comments** (lensed over `idea.session_id`; not a separate comments table).
- **Activity log** (system messages in the same session).
- **Mentions** (@-mentioning works the same on a Customer as on a SOP).
- **Permissions** (one model: who can see Ideas in this entity, what kinds, what tags).
- **Cross-references** (a Quest links to its `idea_id`; a Project links to its `idea_id`; a CRM relationship is an Idea property pointing at another Idea).

Adding a new "tab" is a config change. Adding a new "type" is a `kind` value plus a saved view.

## What gets to be a primitive

Five primitives. The rule is strict:

- **Agents** — runtime workers. Not data; they execute.
- **Quests** — structured work with state machine semantics. Not data; work has its own lifecycle.
- **Events** — signals. Not data; they trigger.
- **Roles** — org-chart slots with authority semantics. Not data; they grant.
- **Ideas** — the universal data noun.

Two more substrates that aren't quite primitives but are referenced everywhere:

- **Sessions** — the universal conversation primitive. Anything chat- or activity-shaped collapses to this.
- **TRUST** — the on-chain identity. Anything ownership- or governance-shaped lives here.

That's it. If you find yourself thinking "we need a new primitive for X," stop. The X is probably a kind of Idea or a saved view over Ideas.

## The promotion criterion

A function gets its own Company-rail tab only when its UI diverges enough from existing tab patterns to deserve a distinct surface.

- **Hiring needs a stages-kanban.** Different UI shape. Earns a tab eventually.
- **Marketing needs a campaign-graph.** Different UI shape. Earns a tab eventually.
- **Customers, vendors, contacts** — these are tables with chip filters. They live in the Ideas tab. No promotion needed.

Default: don't promote. Promote only when the UI shape is genuinely different.

## What's coming

Today, Ideas have `name + content + tags`. The next lift is **typed properties** — strings, numbers, dates, selects, multi-selects, relations, person/agent references — plus typed views (table, board, gallery, timeline, list).

Same lift Notion did to unify pages and databases. Once it ships, "saved view over Ideas" becomes a Notion-style database query. The page surface stays the same; the property substrate enables ad-hoc structured records.

Until then: properties is a JSON blob. Don't promise typed-DB UX in user-facing copy beyond "Ideas with tags."

## The bigger thesis

Software gets simpler when you find the right axis to slice on. Every product has a moment where a team is choosing between adding a primitive or finding a substrate. Adding the primitive is easy and feels productive. Finding the substrate is harder and feels like over-engineering. Five years later, the substrate path is alive and the primitive path is a coral reef.

aeqi picked the substrate path. Five primitives, locked. Every department, every workflow, every record-shape goes through the same noun.

The programmable company for the agent economy doesn't ship a new primitive every quarter. It ships better views over the ones that already exist.

## Related reading

- [Ideas](/docs/concepts/ideas) — the universal noun.
- [Memory (Ideas)](/docs/concepts/memory) — the dev/MCP API.
- [Composition](/docs/methodology/composition) — Quest wraps Idea, Project wraps Idea.

If you've been waiting for the Customers tab — it shipped a year ago. It's called Ideas. Filter by `kind:customer`.
