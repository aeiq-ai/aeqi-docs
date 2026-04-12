# Memory (Ideas)

Ideas are AEQI's knowledge system. Agents store facts, procedures, preferences, and context that persist across sessions.

## How It Works

Ideas are stored in SQLite with FTS5 full-text search and optional vector embeddings for hybrid retrieval. When an agent needs context, it searches its memory:

```
ideas(action='search', project='myproject', query='authentication patterns')
```

When an agent learns something, it stores it:

```
ideas(action='store', project='myproject', key='jwt-refresh', content='Always use rotating refresh tokens with 7-day expiry', category='procedure')
```

## Categories

| Category | Use case |
|----------|----------|
| `fact` | Objective information (default) |
| `procedure` | How to do something |
| `preference` | User or system preferences |
| `context` | Situational context |
| `evergreen` | Permanent knowledge that doesn't decay |

## Scoping

Ideas are scoped to control visibility:

| Scope | Meaning |
|-------|---------|
| `domain` | Project-level (default) — visible to all agents in the project |
| `system` | Cross-project — visible everywhere |
| `entity` | Agent-specific — only visible to one agent |

## Temporal Decay

Search results are ranked by a combination of:
- **Keyword relevance** (FTS5 BM25)
- **Semantic similarity** (vector cosine distance, if embeddings enabled)
- **Temporal decay** — newer ideas rank higher, configurable half-life

This means an agent's recent learnings surface first, while old knowledge gradually fades unless it's marked `evergreen`.

## Three Activation Modes

| Mode | How it works | Use case |
|------|-------------|----------|
| **Injected** | Always in context | Identity, system prompt, standing instructions |
| **Event-triggered** | Loaded when an event fires | Automated behaviors, scheduled work |
| **Search-recalled** | Found via semantic search | Accumulated knowledge, memories |
