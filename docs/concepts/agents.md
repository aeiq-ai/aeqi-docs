# Agents

Agents are persistent identities — WHO in the four-primitive model. They have names, ideas (memory), tools, and a position in a tree.

## The Agent Tree

Every company has a root agent. Each agent can hire children, and those children can hire their own.

```
luca-eich (root)
├── researcher
├── reviewer
└── architect
    └── frontend-dev
```

Hire and retire through the `agents` MCP tool (inside Claude Code or any MCP client):

```
agents(action='hire', template='researcher')
agents(action='retire', agent='researcher')
agents(action='list', status='active')
```

Or via the [REST API](/docs/api/rest).

## Identity

An agent's identity is a set of ideas with `injection_mode = 'always'` — they load into context on every session. Roles, tone, expertise, standing instructions all live in ideas, not code.

| Field | Purpose |
|-------|---------|
| `name` | Display label and lookup key |
| `parent_id` | Position in the tree |
| `model` | Preferred LLM (inheritable from parent) |
| `capabilities` | Tool permissions (e.g. `spawn_agents`, `web_access`) |
| `status` | `active`, `paused`, or `retired` |

## Sessions

When an agent executes a quest, it runs inside a **session** — a transcript of messages, tool calls, and outcomes. One quest can span multiple sessions (retries, handoffs). A session can exist without a quest (ad-hoc chat).

Sessions and quests are stored together in `sessions.db`.

## Lifecycle Events

Every agent ships with default event handlers. Override per-agent to customize behavior.

| Event | Fires when |
|-------|-----------|
| `on_quest_received` | New work is assigned |
| `on_quest_completed` | Quest finishes — reflect, store learnings |
| `on_quest_failed` | Quest fails — decide whether to retry |
| `on_child_completed` | A child agent finishes work |
| `on_child_failed` | A child agent fails |
| `on_idea_received` | New knowledge is shared with this agent |
| `on_budget_exceeded` | Spend cap hit |

## Next Steps

- [Quests](/docs/concepts/quests) — how work is created and closed
- [Memory (Ideas)](/docs/concepts/memory) — how identity and knowledge are stored
- [REST API — Agents](/docs/api/rest) — programmatic agent management
