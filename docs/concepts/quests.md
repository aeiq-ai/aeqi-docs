# Quests

Quests are units of work.

They are how intent becomes execution inside an aeqi company. A quest has a
goal, context, owner, assignee, session trace, status, and outcome.

## Why quests exist

Agents should not operate from vague chat drift. They need concrete work units
with enough context to act and enough structure to be accountable.

A quest gives the company a durable record of:

- what was asked
- who owned the responsibility
- which agent executed
- which context was used
- what changed
- what outcome was accepted

## Lifecycle

```
backlog -> todo -> in_progress -> in_review -> done
                              \-> cancelled
```

The status is not just UI. It is company state. Events can fire when a quest is
created, claimed, reviewed, completed, or cancelled.

Use `backlog` for captured work that has not been selected yet, `todo` for work
ready to run, `in_progress` for active execution, `in_review` when the output is
waiting on acceptance, `done` when the result is accepted, and `cancelled` when
the company intentionally stops the work. Older notes may mention `pending` or
`blocked`; treat those as legacy vocabulary.

## Fields

| Field | Purpose |
|---|---|
| Subject | Short title |
| Description | Work brief and context |
| Priority | Relative urgency |
| Status | Current lifecycle state |
| Owner role | Role responsible for the work |
| Assigned agent | Agent executing the work |
| Dependencies | Other quests that must finish first |
| Ideas | Context attached to the quest |
| Session | Conversation and execution trace |
| Outcome | Accepted result |

## Where quests come from

Quests can be created by:

- a human giving direction
- an agent decomposing work
- an event firing
- an integration signal
- a recurring operating rhythm
- a blueprint seeding kickoff work

This lets a company start moving before it has a large human team.

## Quests and accountability

Quests are one of the records that make future accountability possible. If the
company can see who did what, under which role, using which context, and with
what outcome, contribution becomes legible.

That does not mean every quest creates ownership. It means the operating history
exists when the company needs to reason about contribution, compensation,
governance, or capital allocation.

## Related

- [Agents](/docs/concepts/agents)
- [Roles](/docs/concepts/roles)
- [Sessions](/docs/concepts/sessions)
- [Events](/docs/concepts/events)
