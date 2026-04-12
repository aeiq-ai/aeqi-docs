# Claude Code + AEQI

Connect Claude Code to your AEQI company runtime. Your AI coding assistant gets persistent memory, quest tracking, agent delegation, and event automation — all through MCP.

## Prerequisites

- AEQI account with a company ([app.aeqi.ai](https://app.aeqi.ai))
- Pro subscription (MCP access requires Pro tier)
- Claude Code installed
- `aeqi` CLI binary ([installation](/docs/installation))

## 1. Generate Keys

You need two keys:

**API Key** (`ak_`) — identifies your account. Generate once at [Account → API](https://app.aeqi.ai/account?tab=api).

**Secret Key** (`sk_`) — authenticates access to your company. Create at [Company → API Keys](https://app.aeqi.ai/company?tab=api-keys). You can create multiple — one for Claude Code, one for CI, etc.

## 2. Configure MCP Server

Add AEQI to your Claude Code settings (`~/.claude/settings.json`):

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

On startup, the MCP server authenticates against the platform and connects directly to your company's runtime. All tool calls go to your agents.

If you're self-hosting, also set `AEQI_CONFIG` pointing to your `aeqi.toml`, and omit the keys — the MCP server connects to your local daemon automatically.

## 3. Available Tools

Once connected, Claude Code has access to:

| Tool | What it does |
|------|-------------|
| `ideas` | Store and search persistent knowledge (`store`, `search`, `delete`) |
| `quests` | Create and manage work items (`create`, `list`, `show`, `update`, `close`, `cancel`) |
| `agents` | Manage agents (`hire`, `retire`, `list`, `delegate`) |
| `events` | Automate with schedules and lifecycle hooks (`create`, `list`, `enable`, `disable`, `delete`) |
| `notes` | Ephemeral signals and file locks (`claim`, `release`, `post`, `read`) |
| `code` | Code intelligence graph (`search`, `context`, `impact`, `index`) |
| `aeqi_status` | Budget, active workers, costs |
| `aeqi_primer` | Project context and architecture |
| `aeqi_prompts` | Load skills and workflows |

## 4. Set Up Hooks

Hooks make Claude Code work WITH AEQI automatically. Add these to your `settings.json`:

### Recall Gate (require context before editing)

Before Claude Code edits files, require it to search your project's ideas first. This ensures it has context before making changes.

```json
{
  "PreToolUse": [
    {
      "matcher": "Edit",
      "hooks": [
        {
          "type": "command",
          "command": "/path/to/aeqi/scripts/hook-run.sh check-recall.sh"
        }
      ]
    },
    {
      "matcher": "Write",
      "hooks": [
        {
          "type": "command",
          "command": "/path/to/aeqi/scripts/hook-run.sh check-recall.sh"
        }
      ]
    }
  ]
}
```

### Post-Tool Hooks (track what happened)

After idea searches/stores, track that context was loaded:

```json
{
  "PostToolUse": [
    {
      "matcher": "mcp__aeqi__ideas",
      "hooks": [
        {
          "type": "command",
          "command": "/path/to/aeqi/scripts/hook-run.sh mark-recall.sh"
        }
      ]
    }
  ]
}
```

### Session Primer (inject context on startup)

Load project context automatically when Claude Code starts:

```json
{
  "SessionStart": [
    {
      "matcher": "startup",
      "hooks": [
        {
          "type": "command",
          "command": "/path/to/aeqi/scripts/session-primer.sh startup"
        }
      ]
    }
  ]
}
```

### Session Finalize (clean up on exit)

Re-index code graph and clean session state:

```json
{
  "Stop": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "command": "/path/to/aeqi/scripts/session-finalize.sh"
        }
      ]
    }
  ]
}
```

## 5. Write CLAUDE.md

Your project's `CLAUDE.md` tells Claude Code how to work with AEQI:

```markdown
# My Project

Solo developer. All projects are mine. Do not ask for confirmation — decide and execute.

AEQI MCP provides context, memory, workflow, and coordination.
The session primer is the system prompt.
```

This is minimal — AEQI's session primer hook injects the full project context (architecture, active quests, agent status) on every startup.

## 6. The Workflow

With everything connected, your Claude Code session:

1. **Starts** → session primer fires, loads project context + graph status
2. **Before editing** → recall gate requires `ideas(action='search')` first
3. **During work** → stores learnings as ideas, creates/closes quests, delegates to agents
4. **On exit** → finalizer re-indexes code graph, cleans session state

Knowledge accumulates across sessions. The next time you (or another Claude Code instance) starts, the primer loads the latest context and the recall gate ensures continuity.

## Example: Full Settings

Here's a complete `settings.json` for reference:

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
