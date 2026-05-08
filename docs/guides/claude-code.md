# Claude Code + aeqi

Connect Claude Code to your aeqi runtime over MCP. Claude Code gets persistent memory, quest tracking, agent delegation, and event automation — driving the same primitives the dashboard does.

## Prerequisites

- aeqi account with a company at [app.aeqi.ai](https://app.aeqi.ai)
- Active workspace subscription
- Claude Code
- `aeqi` CLI — see [Installation](/docs/installation)

## 1. Keys

Two keys, both from the dashboard:

- **Account key** (`ak_`) — [Account → API](https://app.aeqi.ai/account?tab=api). One per account.
- **Secret key** (`sk_`) — [Company → API Keys](https://app.aeqi.ai/company?tab=api-keys). One per integration.

See [Authentication](/docs/api/authentication) for rotation.

## 2. MCP Server

Add the aeqi CLI to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "aeqi": {
      "command": "aeqi",
      "args": ["mcp"],
      "env": {
        "AEQI_SECRET_KEY": "sk_...",
        "AEQI_API_KEY": "ak_..."
      }
    }
  }
}
```

`aeqi mcp` authenticates with the platform on startup, then routes tool calls directly to your company's runtime.

For self-hosted, omit the keys and set `AEQI_CONFIG` to your `aeqi.toml`. The MCP server connects to the local daemon over `~/.aeqi/rm.sock`.

## 3. Tools

Once connected, Claude Code can call:

| Tool | Actions |
|------|---------|
| `ideas` | `store`, `search`, `update`, `delete` |
| `quests` | `create`, `list`, `show`, `update`, `close`, `cancel` |
| `agents` | `hire`, `retire`, `list`, `delegate` |
| `events` | `create`, `list`, `enable`, `disable`, `delete` |
| `notes` | `claim`, `release`, `post`, `read`, `query`, `delete` |
| `code` | `search`, `context`, `impact`, `index` |
| `aeqi_status` | budget, active workers, costs |
| `aeqi_primer` | project context and architecture |
| `aeqi_prompts` | skills and workflows |

Full catalog: [MCP Integration](/docs/api/mcp).

## 4. Hooks

Hooks make Claude Code work with aeqi automatically. Add each block under `"hooks"` in `settings.json`.

### Recall gate — require context before editing

```json
"PreToolUse": [
  {
    "matcher": "Edit",
    "hooks": [{ "type": "command", "command": "aeqi/scripts/hook-run.sh check-recall.sh" }]
  },
  {
    "matcher": "Write",
    "hooks": [{ "type": "command", "command": "aeqi/scripts/hook-run.sh check-recall.sh" }]
  }
]
```

Blocks `Edit`/`Write` until `ideas(action='search')` has run for the current context.

### Mark recall after ideas tool calls

```json
"PostToolUse": [
  {
    "matcher": "mcp__aeqi__ideas",
    "hooks": [{ "type": "command", "command": "aeqi/scripts/hook-run.sh mark-recall.sh" }]
  }
]
```

### Session primer — inject project context on startup

```json
"SessionStart": [
  {
    "matcher": "startup",
    "hooks": [{ "type": "command", "command": "aeqi/scripts/session-primer.sh startup" }]
  }
]
```

Loads the active project's primer — architecture, rules, open quests, agent status — into the session as Claude Code starts.

### Session finalize — re-index on exit

```json
"Stop": [
  {
    "matcher": "",
    "hooks": [{ "type": "command", "command": "aeqi/scripts/session-finalize.sh" }]
  }
]
```

Re-indexes the code graph and clears session state.

## 5. CLAUDE.md

Keep `CLAUDE.md` minimal — the primer hook injects everything else.

```markdown
# My Project

Solo developer. All projects are mine. Decide and execute.

aeqi MCP provides context, memory, workflow, and coordination.
The session primer is the system prompt.
```

## How It Fits Together

1. **Startup** — `SessionStart` runs the primer, loading project context and graph status
2. **Before editing** — `PreToolUse` requires an `ideas(action='search')` first
3. **During work** — Claude Code stores learnings as ideas, creates and closes quests, delegates to agents
4. **Exit** — `Stop` re-indexes the code graph and clears session state

Knowledge accumulates across sessions. Next time you (or another agent) starts, the primer loads the latest state.

## Full `settings.json`

```json
{
  "mcpServers": {
    "aeqi": {
      "command": "aeqi",
      "args": ["mcp"],
      "env": {
        "AEQI_SECRET_KEY": "sk_...",
        "AEQI_API_KEY": "ak_..."
      }
    }
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [{ "type": "command", "command": "aeqi/scripts/session-primer.sh startup" }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "aeqi/scripts/hook-run.sh check-recall.sh" }]
      },
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "aeqi/scripts/hook-run.sh check-recall.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "mcp__aeqi__ideas",
        "hooks": [{ "type": "command", "command": "aeqi/scripts/hook-run.sh mark-recall.sh" }]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "aeqi/scripts/session-finalize.sh" }]
      }
    ]
  }
}
```

## Next Steps

- [MCP Integration](/docs/api/mcp) — full tool catalog and env vars
- [Authentication](/docs/api/authentication) — key rotation
- [Concepts: Agents](/docs/concepts/agents) — what your MCP tools are driving
