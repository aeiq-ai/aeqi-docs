# Composition

The same shape, repeated at every level. Quest wraps Idea. Project wraps Idea. Round wraps Idea. The wrapper holds the work-state; the Idea holds the artifact.

This pattern is why aeqi keeps the four operating primitives small instead of
turning every business object into a new primitive.

## The wrapper pattern

```
Quest {
  id, status, priority, agent, depends_on, parent,
  idea_id  ← the artifact this work produces or refines
}

Project {           (when shipped)
  id, status,
  idea_id  ← the brief
}

Round {             (when shipped — fundraising)
  id, status, terms,
  idea_id  ← the term sheet
}
```

A Quest produces or refines an Idea. The Quest carries lifecycle
(`backlog` -> `todo` -> `in_progress` -> `in_review` -> `done`); the Idea
carries content.

## Why this is right

Three reasons:

1. **Many work-shapes share the same artifact.** A draft blog post might start as a Quest's output, then become the brief for a marketing Project, then ship as a press Idea. Three wrappers, one Idea.
2. **Activity is a session on the Idea, not the wrapper.** Comments, edits, agent reasoning — all flow into the Idea's session. The Quest is metadata; the conversation lives where the content does.
3. **The Idea outlives the Quest.** A Quest closes; the artifact persists.

## The recursion

The same shape applies at every level of the org:

- A founder writes a brief (Idea) and tags `quest:create`. A Quest is created from it; assigned to an agent.
- The agent breaks the work into sub-Quests, each with its own `idea_id`.
- A sub-Quest's output is a child Idea; the parent Quest's output is a parent Idea that aggregates.
- The whole tree of Quests and Ideas is queryable, traceable, and resumable.

## Sub-Quests via `parent`

A Quest with `parent=<quest_id>` is a sub-task. The parent stays `in_progress` until all required children close. Agents can spawn sub-Quests to delegate or parallelize.

## Dependencies via `depends_on`

A Quest with `depends_on=<quest_id>` stays out of active execution until the
dependency is `done`. Use for sequential work; don't use it for "waiting on a
person" — that's a `message_to(<role>)` and a `decision_request` payload.

## Outcomes

When a Quest closes, the closing agent records an **outcome**: a one-line summary of what was done. Outcomes:

- Surface in the Quest list view as the "what shipped" column.
- Are stored in a system message on the linked Idea's session.
- Carry forward as context to dependent Quests.

## Naming the wrapper

When introducing a new work-shape (a new wrapper around Ideas), don't promote it to a primitive unless it materially differs. The bar:

- A new wrapper has its own state machine.
- A new wrapper has its own UI surface that differs from existing tabs.
- A new wrapper carries its own permissions / authority.

If two of three are no, it's a saved view, not a new primitive.

## Examples

| Work-shape | Wrapper | Idea content | Status |
|---|---|---|---|
| Draft a blog post | Quest | Markdown body | Shipped |
| Recruit a candidate | Quest | Candidate profile | Shipped |
| Run a marketing campaign | Project (deferred) | Campaign brief | Future |
| Close a funding round | Round (deferred) | Term sheet | Future |
| Form a vendor agreement | Quest | Agreement draft | Shipped |
| Process inbound contact | Quest | CRM record (`kind:customer`) | Shipped |

The first four columns vary; the last column reduces to "Idea + Session + status wrapper."

## Composition over inheritance

Don't subclass. Don't ship a `BlogPost` primitive that extends `Idea`. Tag the Idea with `kind:blog_post`, give it the right properties, and put a saved view on top. The substrate doesn't care.

This rule is why aeqi rejects the temptation to ship a `Customer`, `Contact`, `Vendor`, `Document`, `File`, `Project`, `Campaign` primitive every time a new use case shows up. Compose, don't inherit.

## Related

- [Ideas](/docs/concepts/ideas) — the universal noun.
- [Quests](/docs/concepts/quests) — the canonical wrapper.
- [Sessions](/docs/concepts/sessions) — activity belongs to the Idea.
