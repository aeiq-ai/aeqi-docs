# Quests

Quests are units of work. They're trackable, assignable, have dependencies, and produce outcomes.

## Lifecycle

```
pending → in_progress → done
                      → cancelled
                      → blocked
```

## Creating Quests

```
quests(action='create', project='myproject', subject='Fix login bug', priority='high')
```

Quests can also be created by:
- Events firing on a schedule
- Lifecycle handlers (e.g., a failed quest triggers a retry quest)
- Other agents delegating work

## Properties

| Field | Description |
|-------|-------------|
| `subject` | Short description of the work |
| `description` | Detailed context |
| `priority` | `low`, `normal`, `high`, `critical` |
| `status` | `pending`, `in_progress`, `done`, `blocked`, `cancelled` |
| `agent` | Which agent is assigned |
| `depends_on` | Quest IDs that must complete first |
| `parent` | Parent quest ID for sub-tasks |
| `idea_ids` | Referenced ideas/knowledge |

## Dependencies

Quests can depend on other quests. A quest won't start until its dependencies are `done`:

```
quests(action='create', project='p', subject='Deploy', depends_on='sg-001')
```

## Outcomes

When a quest completes, the closing agent records a result:

```
quests(action='close', quest_id='sg-001', result='Deployed v2.1 to production')
```

Failed quests get a cancellation reason:

```
quests(action='cancel', quest_id='sg-001', reason='Blocked by upstream dependency')
```
