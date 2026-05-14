# CLI

`aeqi` is the command-line interface for the runtime. Self-host runs the binary directly; on the hosted platform, the CLI talks to the platform API.

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/aeqiai/aeqi/main/scripts/install.sh | sh
```

Or build from source:

```bash
git clone https://github.com/aeqiai/aeqi.git
cd aeqi
cargo build --release
# binary at target/release/aeqi
```

## Commands

### `aeqi setup`

Configure the runtime. Wizard detects context:

- Inside a git repo → configures the current workspace.
- Outside a repo → writes to `~/.aeqi/`.

Creates SQLite databases (`aeqi.db`, `sessions.db`) and a default config (`config.toml`).

### `aeqi start`

Run the daemon, REST API, scheduler, and dashboard in one process. Default port `8400`.

```
aeqi start [--port 8400] [--data-dir ~/.aeqi]
```

### `aeqi stop`

Stop a running daemon (matches by data dir).

### `aeqi secrets`

Manage provider keys + secrets.

```bash
aeqi secrets set OPENROUTER_API_KEY sk-or-...
aeqi secrets set ANTHROPIC_API_KEY sk-ant-...
aeqi secrets get OPENROUTER_API_KEY    # prints obscured
aeqi secrets list
aeqi secrets unset OPENROUTER_API_KEY
```

### `aeqi agents`

Manage agents.

```bash
aeqi agents list [--status active]
aeqi agents spawn --template researcher --name "Research Bot"
aeqi agents update <agent_id> --model anthropic/claude-3.5-sonnet
aeqi agents retire <agent_id>
```

### `aeqi quests`

Manage quests.

```bash
aeqi quests list [--status pending] [--agent <name>]
aeqi quests create --subject "..." --agent <name> --priority high
aeqi quests show <quest_id>
aeqi quests close <quest_id> --outcome "shipped X"
```

### `aeqi ideas`

Manage ideas (knowledge / memory).

```bash
aeqi ideas store --name "JWT refresh" --kind procedure \
  --content "Use rotating refresh tokens with 7-day expiry"
aeqi ideas search --query "auth patterns"
aeqi ideas list --kind procedure
```

### `aeqi events`

Manage events.

```bash
aeqi events list [--scope <entity_id>]
aeqi events fire --kind custom.deploy --payload '{"target":"prod"}'
aeqi events subscribe --pattern "kind=quest.completed" --tool message_to --args '{...}'
```

### `aeqi roles`

Manage roles.

```bash
aeqi roles list
aeqi roles create --title "CFO" --role-type operational
aeqi roles assign <role_id> --human <user_id>
aeqi roles assign <role_id> --agent <agent_id>
aeqi roles unassign <role_id>
```

### `aeqi treasury`

Treasury operations (gated by role / session-key policy).

```bash
aeqi treasury balance
aeqi treasury transfer --to 0x... --amount 100 --asset USDC
```

### `aeqi mcp`

Run the MCP server (Model Context Protocol). Used by Codex, Claude Code, and
other MCP-compatible clients.

```bash
aeqi mcp
```

See [MCP](/docs/api/mcp).

### `aeqi version`

Print version + build info.

## Hosted platform

When running against the hosted platform (instead of self-host), set:

```bash
export AEQI_API=https://app.aeqi.ai
export AEQI_TOKEN=<your-api-key-from-settings>
```

All commands proxy through the platform API. Authentication uses the API key from your account settings.

## MCP integration

The CLI ships an MCP server mode (`aeqi mcp`) that exposes the full verb catalog
as MCP tools. Use this with Codex, Claude Code, or any MCP client to:

- Search and store ideas in your runtime from the IDE.
- Create quests for the runtime to execute.
- Spawn agents directly from a chat session.

See [MCP](/docs/api/mcp).

## Configuration

`~/.aeqi/config.toml`:

```toml
[runtime]
data_dir = "~/.aeqi"
port = 8400
log_level = "info"

[providers]
default_model = "anthropic/claude-3.5-sonnet"

[telemetry]
otlp_endpoint = "http://localhost:4317"  # optional
```

## Related

- [Quickstart](/docs/quickstart)
- [REST API](/docs/api/rest)
- [MCP](/docs/api/mcp)
- [IPC verbs](/docs/reference/ipc)
