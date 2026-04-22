# Memory (Ideas)

Ideas are aeqi's knowledge primitive — HOW in the four-primitive model. Facts, procedures, preferences, and instructions that persist across sessions. Stored in `aeqi.db` with FTS5 full-text search plus optional vector embeddings for hybrid retrieval.

## Store and Recall

Through the `ideas` MCP tool (inside Claude Code or any MCP client):

```
ideas(action='search', project='myproject', query='authentication patterns')
```

```
ideas(action='store', project='myproject', key='jwt-refresh',
      content='Use rotating refresh tokens with 7-day expiry',
      category='procedure')
```

## Categories

| Category | Use case |
|----------|----------|
| `fact` | Objective information (default) |
| `procedure` | How to do something |
| `preference` | User or system preferences |
| `context` | Situational context |
| `evergreen` | Permanent knowledge that does not decay |

## Scope

| Scope | Visibility |
|-------|-----------|
| `domain` | Project-level (default) — all agents in the project |
| `system` | Cross-project — all agents, every project |
| `entity` | Agent-specific — one agent only |

## Ranking

Search combines three signals:

- **Keyword relevance** — FTS5 BM25
- **Semantic similarity** — vector cosine distance (when embeddings enabled)
- **Temporal decay** — newer ideas rank higher; configurable half-life

Recent learnings surface first. Old knowledge fades unless marked `evergreen`.

## Activation Modes

| Mode | Behavior | Use case |
|------|----------|----------|
| `always` | Loaded into every session | Identity, standing instructions |
| `event` | Loaded when an event fires | Automated behaviors |
| `recall` | Loaded via search | Accumulated knowledge |

Identity lives in `always`-mode ideas — an agent's "personality" is just a set of always-injected ideas, not a separate prompt system.

## Next Steps

- [Agents](/docs/concepts/agents) — identity as always-injected ideas
- [Quests](/docs/concepts/quests) — ideas referenced per quest via `idea_ids`
- [REST API — Ideas](/docs/api/rest) — HTTP endpoints
