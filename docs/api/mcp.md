# MCP Integration

aeqi exposes a [Model Context Protocol](https://modelcontextprotocol.io/) server. AI coding assistants — Claude Code, Cursor, and anything else MCP-compatible — get direct access to your company's runtime.

## Setup

```bash
export AEQI_API_KEY=ak_...
export AEQI_SECRET_KEY=sk_...
```

Get keys from [Account → API](https://app.aeqi.ai/account?tab=api) and [Company → API Keys](https://app.aeqi.ai/company?tab=api-keys). See [Authentication](/docs/api/authentication).

Add to your Claude Code config:

```json
{
  "mcpServers": {
    "aeqi": {
      "command": "aeqi",
      "args": ["mcp"],
      "env": {
        "AEQI_API_KEY": "ak_...",
        "AEQI_SECRET_KEY": "sk_..."
      }
    }
  }
}
```

On startup, `aeqi mcp` authenticates with the platform and connects to your company's runtime. Tool calls route directly to your agents.

## Tools

All core tools use an action-based pattern: `tool(action='...', ...)`.

### Primitives

| Tool | Actions | Purpose |
|------|---------|---------|
| `agents` | `hire`, `retire`, `list`, `delegate` | Agent lifecycle (WHO) |
| `events` | `create`, `list`, `enable`, `disable`, `delete` | Triggers and schedules (WHEN) |
| `quests` | `create`, `list`, `show`, `update`, `close`, `cancel` | Work items (WHAT) |
| `ideas` | `store`, `search`, `update`, `delete` | Knowledge (HOW) |

### Adjuncts

| Tool | Actions | Purpose |
|------|---------|---------|
| `notes` | `read`, `post`, `get`, `query`, `claim`, `release`, `delete` | Ephemeral signals and resource locks |
| `code` | `search`, `context`, `impact`, `file`, `stats`, `index` | Code intelligence graph |

### Discovery

| Tool | Returns |
|------|---------|
| `aeqi_projects` | Projects with repo paths and prefixes |
| `aeqi_primer` | A project's primer (architecture, rules, build/deploy) |
| `aeqi_prompts` | Registered skills and workflows |
| `aeqi_status` | Live runtime — active workers, budget, costs, pending work |

### Examples

```
quests(action='create', project='myproject', subject='Fix login bug')
ideas(action='search', project='myproject', query='authentication patterns')
agents(action='list', status='active')
events(action='create', agent='myagent', schedule='0 9 * * *',
       content='Post daily standup summary')
```

## Environment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AEQI_SECRET_KEY` | Yes | — | Company secret key (`sk_...`) |
| `AEQI_API_KEY` | No | — | Account key (`ak_...`), for analytics |
| `AEQI_PLATFORM_URL` | No | `https://app.aeqi.ai` | Platform URL for key validation |

## Self-Hosted

Without the platform, the MCP server connects to the local daemon over a unix socket at `~/.aeqi/rm.sock`. No keys required — just have `aeqi start` running.

## Next Steps

- [Authentication](/docs/api/authentication) — key creation and rotation
- [Claude Code + aeqi](/docs/guides/claude-code) — hooks, primer, full settings
- [REST API](/docs/api/rest) — HTTP endpoints for the same operations
