# Agents

Agents are persistent AI identities. They have names, memory, capabilities, and a position in a hierarchy.

## Agent Tree

Agents form a parent-child tree. A company's root agent can hire child agents from templates, and those children can hire their own.

```
luca-eich (root)
├── researcher
├── reviewer
└── architect
    └── frontend-dev
```

Hiring and retiring agents is done through the `agents` tool or the dashboard:

```
agents(action='hire', template='researcher')
agents(action='retire', agent='researcher')
agents(action='list', status='active')
```

## Identity

An agent's identity comes from its **ideas** — instructions, personality, expertise, and accumulated knowledge stored in the semantic memory system.

| Field | What it does |
|-------|-------------|
| `name` | Display label and lookup key |
| `parent_id` | Position in the agent tree |
| `model` | Preferred LLM model (inheritable from parent) |
| `capabilities` | Permissions (e.g., `spawn_agents`, `web_access`) |
| `status` | `active`, `paused`, or `retired` |

## Sessions

When an agent works on a quest, it runs inside a **session** — an execution transcript with tool calls, messages, and outcomes. A quest can have multiple sessions (retries, handoffs). A session can exist without a quest (ad-hoc chat).

## Lifecycle Events

Every agent gets default lifecycle event handlers:

- `on_quest_received` — new work arrives
- `on_quest_completed` — work finished, reflect and store learnings
- `on_quest_failed` — work failed, decide whether to retry
- `on_child_completed` / `on_child_failed` — child agent outcomes
- `on_idea_received` — new knowledge shared
- `on_budget_exceeded` — cost limit hit

These are customizable per agent.
