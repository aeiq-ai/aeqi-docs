# MCP Integration

AEQI exposes a [Model Context Protocol](https://modelcontextprotocol.io/) server that gives AI coding assistants like Claude Code direct access to your company's agent runtime.

## Setup

### 1. Get Your Keys

- **API Key** (`ak_`): [Account → API](https://app.aeqi.ai/account?tab=api)
- **Secret Key** (`sk_`): [Company → API Keys](https://app.aeqi.ai/company?tab=api-keys)

### 2. Configure Environment

```bash
export AEQI_API_KEY=ak_...
export AEQI_SECRET_KEY=sk_...
```

### 3. Add to Claude Code

Add AEQI as an MCP server in your Claude Code configuration:

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

On startup, `aeqi mcp` authenticates against the platform and connects to your company's runtime. All tool calls go directly to your agents.

## Available Tools

### Discovery

| Tool | Description |
|------|-------------|
| `aeqi_projects` | List all projects with repo paths and prefixes |
| `aeqi_primer` | Get a project's primer context (architecture, rules, build/deploy) |
| `aeqi_prompts` | List or retrieve prompts (identities, skills, workflows) |
| `aeqi_status` | Live status: active workers, budget, costs, pending tasks |

### Core

| Tool | Actions | Description |
|------|---------|-------------|
| `ideas` | `store`, `search`, `delete` | Semantic memory — store and retrieve knowledge |
| `quests` | `create`, `list`, `show`, `update`, `close`, `cancel` | Task management with dependencies and priorities |
| `agents` | `hire`, `retire`, `list`, `delegate` | Agent lifecycle and delegation |
| `events` | `create`, `list`, `enable`, `disable`, `delete` | Scheduled and lifecycle event handlers |
| `notes` | `read`, `post`, `get`, `query`, `claim`, `release`, `delete` | Ephemeral signals and resource locks |
| `code` | `search`, `context`, `impact`, `file`, `stats`, `index` | Code intelligence graph |

### Tool Pattern

Core tools use a unified action-based pattern:

```
tool_name(action='...', param1='...', param2='...')
```

For example:
```
quests(action='create', project='myproject', subject='Fix login bug')
ideas(action='search', project='myproject', query='authentication patterns')
agents(action='list', status='active')
events(action='create', agent='myagent', schedule='0 9 * * *', content='Daily standup summary')
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AEQI_SECRET_KEY` | Yes | — | Company secret key (`sk_...`) |
| `AEQI_API_KEY` | No | — | Account API key (`ak_...`) for analytics |
| `AEQI_PLATFORM_URL` | No | `http://127.0.0.1:8443` | Platform URL for key validation |

## Self-Hosted

For self-hosted deployments without the platform, the MCP server falls back to connecting to the local daemon at `~/.aeqi/rm.sock`. No keys required — just have `aeqi daemon start` running.
