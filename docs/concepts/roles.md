# Roles

Roles are how aeqi represents authority, responsibility, and scope inside a
company.

A role is an org-chart seat. It can be occupied by a human, an agent, or remain
vacant. The role persists even when the occupant changes.

## Why roles matter

Agents need boundaries.

Without roles, every agent is just a bot with tools. With roles, the company can
say:

- what the agent is responsible for
- which work it can accept
- which tools it can use
- which budget it can spend
- who can supervise it
- when it must escalate
- whether it has authority or only execution scope

Roles make agents accountable economic actors inside the company.

## Role vs agent

| Concept | Meaning |
|---|---|
| Role | The seat: CEO, CTO, Finance Lead, Researcher, Director |
| Occupant | The human or agent currently filling that seat |
| Authority | What the role is allowed to do |
| Responsibility | What the role is expected to own |

Example:

```
Role: Finance Lead
Occupant: finance-agent
Authority: read billing data, draft budget, propose payments
Escalation: human Director approves treasury movement
```

If the company replaces `finance-agent`, the Finance Lead role remains. Its
sessions, quests, policies, and history still belong to the company.

## Authority graph

Roles form an authority graph. A Director can supervise a CEO. A CEO can
supervise a Marketing Lead. A Marketing Lead can supervise a Growth Agent.

```
Director
└── CEO
    ├── Product Lead
    ├── Engineering Lead
    └── Marketing Lead
        └── Growth Agent
```

Boards can be flat. Operating teams can be hierarchical. The graph belongs to
the company, not to any single agent.

## Runtime roles and TRUST roles

Not every role needs on-chain authority.

| Tier | Where it lives | Purpose |
|---|---|---|
| Operating role | Runtime | Work routing, tool scope, responsibility |
| Authority role | TRUST + runtime mirror | Treasury, governance, ownership, signer authority |

A content researcher can be runtime-only. A director, treasury controller, or
governance seat should be reflected in TRUST.

## Role-addressed sessions

Sessions can target a role instead of a person or agent.

That means a message can go to "Marketing Lead" even if the current occupant
changes later. The conversation history remains attached to the seat and the
company keeps continuity.

## Role descriptions are first-class ideas

A role's title is a label. Its **description** — the charter, the mandate, the
persona that explains what this seat is responsible for — lives as an Idea.

Each role can carry an optional `description_idea_id` pointer into the ideas
graph. When set, that idea is the canonical description: it can be linked,
mentioned via `[[name]]`, audited, and rotated under a new occupant without
rewriting the persona.

This means:

- A new CFO occupant inherits the Finance charter idea automatically — the
  description doesn't reset when the seat changes hands.
- The role's description gets the same dedup, embedding, and graph-walk
  treatment as any other idea — searchable, linkable, version-aware.
- Roles without a description idea fall back to the legacy plain-text title
  alone. Setting `description_idea_id` is purely additive.

To set or clear the pointer, pass `description_idea_id` on `create_role` /
`update_role` (string id to set, `null` to clear, omit to leave unchanged).

## Related

- [Company](/docs/concepts/company)
- [Agents](/docs/concepts/agents)
- [TRUST](/trust)
- [Org architecture](/docs/methodology/org-architecture)
