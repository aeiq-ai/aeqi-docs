# Quests

Quests are units of work — WHAT in the four-primitive model. Each quest has status, an assignee, dependencies, and an outcome. Quests execute in isolated git worktrees with per-turn commits.

## Lifecycle

```
pending → in_progress → done
                      → cancelled
                      → blocked
```

## Create

Through the `quests` MCP tool (inside Claude Code or any MCP client):

```
quests(action='create', project='myproject', subject='Fix login bug', priority='high')
```

Quests are also created by:

- **Events** firing on a schedule (`cron` events)
- **Lifecycle handlers** — e.g. a failed quest triggers a retry
- **Other agents** delegating work down the tree

## Fields

| Field | Description |
|-------|-------------|
| `subject` | Short title |
| `description` | Detailed context |
| `priority` | `low`, `normal`, `high`, `critical` |
| `status` | `pending`, `in_progress`, `done`, `blocked`, `cancelled` |
| `agent` | Assigned agent name |
| `depends_on` | Quest IDs that must be `done` first |
| `parent` | Parent quest ID (for sub-tasks) |
| `idea_ids` | Ideas referenced as context |

## Dependencies

A quest stays `pending` until every `depends_on` quest is `done`:

```
quests(action='create', project='p', subject='Deploy', depends_on='sg-001')
```

## Close and Cancel

On completion, the closing agent records an outcome:

```
quests(action='close', quest_id='sg-001', result='Deployed v2.1 to production')
```

On cancellation, a reason:

```
quests(action='cancel', quest_id='sg-001', reason='Blocked by upstream dependency')
```

Quests and their session transcripts live in `sessions.db`.

## Next Steps

- [Agents](/docs/concepts/agents) — who executes quests
- [Memory (Ideas)](/docs/concepts/memory) — context passed into quest execution
- [REST API — Quests](/docs/api/rest) — HTTP endpoints
