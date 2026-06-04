# CLI

`aeqi` is the command-line control surface for the Company OS.

Use it for three jobs:

- **Hosted client** - chat with agents and operate an existing Company runtime.
- **MCP bridge** - expose aeqi tools to Codex, Claude Code, and other AI clients.
- **Private runtime** - run a Company runtime with dashboard, API, scheduler,
  MCP socket, and agent execution in approved private deployments.

For hosted use, the CLI does not run the runtime on your laptop. It
authenticates to the platform and talks to the managed Company runtime. For
private deployments, `aeqi start` runs the approved runtime locally or on the
customer's infrastructure.

You may still see `TRUST` in exact command names, secret keys, and protocol
fields. Treat it as the lower-level runtime/protocol selector behind the
Company.

## Surface Role

The CLI is the operator shell for the other surfaces:

| Need | Command path |
|---|---|
| Terminal chat with a hosted agent | `aeqi chat` |
| Private runtime setup | `aeqi setup`, `aeqi start` |
| MCP bridge for AI clients | `aeqi mcp` |
| Work dispatch and monitoring | `aeqi assign`, `aeqi monitor` |
| Local diagnostics | `aeqi doctor`, `aeqi paths` |

The API is for software integration. MCP is for AI clients. The CLI is for
operators and scripts.

## Installation

The public path is hosted access. Accepted users receive CLI access through the
hosted onboarding flow. Private deployments receive installation details during
deployment scoping.

## Mental model

The CLI has three jobs:

| Job | Command path | What it means |
|---|---|---|
| Talk to a hosted Company | `aeqi chat` | Opens a terminal chat with an existing runtime agent, using your account key. |
| Expose aeqi to an AI coding client | `aeqi mcp` | Starts an MCP server process so Codex, Claude Code, or another MCP client can use aeqi tools. |
| Run a private runtime | `aeqi setup`, `aeqi start` | Creates and runs a private Company runtime for approved deployments. |

The most common hosted path is:

1. Create or join a Company in the dashboard.
2. Create keys in the dashboard.
3. Use `aeqi chat` when you want a terminal conversation with an existing agent.
4. Use `aeqi mcp` when you want Codex or Claude Code to work with Company memory,
   quests, agents, and code graph tools.

## Hosted Company setup

Create two keys:

- Account key (`ak_...`) from Account -> API.
- Secret key (`sk_...`) from the Company API keys page.

For terminal chat:

```bash
export AEQI_API_KEY=ak_...
export AEQI_API_URL=https://app.aeqi.ai
aeqi chat
```

If your account has multiple Companies or roles, the CLI asks which one to use.
You can also pin the context:

```bash
aeqi chat \
  --api-url https://app.aeqi.ai \
  --api-key ak_... \
  --entity <trust_runtime_id> \
  --agent "Executive Assistant"
```

`aeqi chat` lists your Companies, filters to your human roles when possible,
lists active agents in the selected runtime, then opens a streaming session
with the selected agent. Messages are sent to the hosted runtime over the
platform API and WebSocket stream.

For MCP clients:

```bash
export AEQI_SECRET_KEY=sk_...
export AEQI_API_KEY=ak_...
export AEQI_PLATFORM_URL=https://app.aeqi.ai
aeqi mcp
```

Most users do not run `aeqi mcp` by hand. They configure Codex, Claude Code, or
another MCP client to spawn it. See [MCP](/reference/mcp).

## Hosted user stories

### Use the CLI like a terminal agent client

You already have a Company and an Executive Assistant agent. Run:

```bash
AEQI_API_KEY=ak_... AEQI_API_URL=https://app.aeqi.ai aeqi chat
```

Pick the Company, role, and agent. The CLI becomes a terminal chat surface for
that runtime agent. The agent still runs inside aeqi, with its role, memory,
tools, sessions, and event history. The CLI is only the transport.

### Use Codex or Claude Code with the Company

Configure your MCP client to run `aeqi mcp` with `AEQI_SECRET_KEY`,
`AEQI_API_KEY`, and `AEQI_PLATFORM_URL`.

The MCP client can then:

- call `me` to confirm which user and Company runtime it is operating as;
- search and store Ideas for durable memory;
- create, update, and close Quests;
- inspect and hire Agents;
- trigger or inspect Events;
- use the code graph before changing source.

This is the aeqi version of an AI coding workspace: the chat client supplies the
interface, while aeqi supplies Company context, memory, work ledger, agents,
and execution history.

### Interact with existing agents

In a terminal, use `aeqi chat --agent <name-or-id>` to talk to one existing
agent.

From MCP, use:

```text
agents(action='list')
agents(action='get', agent='Executive Assistant')
quests(action='create', subject='Draft the launch checklist', agent='Executive Assistant')
```

Creating a Quest with an `agent` or `agent_id` delegates work to that runtime
agent. Omitting the agent creates user-scoped work that is not
automatically owned by one agent.

### Create a new agent

From MCP, hire a runtime agent:

```text
agents(action='hire', template='analyst')
```

Then delegate work:

```text
quests(
  action='create',
  subject='Map the onboarding funnel',
  description='Review the current docs and produce a prioritized improvement plan.',
  agent='analyst'
)
```

The MCP client did not become the new agent. It asked the aeqi runtime to create
one, then created work for that agent to execute.

### Act as yourself, not as an agent

The normal hosted MCP connection acts as your account inside the selected
Company runtime. `AEQI_SECRET_KEY` selects the runtime, and `AEQI_API_KEY`
binds the request to your user account.

`AEQI_AGENT` is only a client hint for logs and context. It does not make the
connection own Quests or impersonate a runtime agent. Pass `agent` or `agent_id`
explicitly when you want to delegate to, inspect, or filter for an agent.

`AEQI_AGENT_ID` is reserved for cases where a client intentionally needs to bind
to a specific runtime agent. Most human-operated CLI and MCP setups should leave
it unset.

## Private runtime commands

### `aeqi init`

Initialize aeqi in the current directory. Lightweight — writes a stub config
and leaves the rest to `aeqi setup`. Use this when you want to author a runtime
config by hand instead of taking the wizard's choices.

```bash
aeqi init
```

### `aeqi setup`

Bootstrap a local runtime. The wizard detects context:

- Inside a git repo: configures the current workspace.
- Outside a repo: writes to `~/.aeqi/`.

```bash
aeqi setup
aeqi setup --runtime anthropic_agent
aeqi setup --service
```

Creates SQLite databases (`aeqi.db`, `sessions.db`), starter agents, and a
default config. `--service` installs a per-user daemon service after
bootstrap; `--force` overwrites existing starter files.

### `aeqi start`

Run the local daemon, REST API, scheduler, dashboard, and runtime in one
process. Default bind comes from config.

```bash
aeqi start
aeqi start --bind 127.0.0.1:8400
```

Hosted users usually do not run this. The hosted platform already runs the
tenant runtime.

### `aeqi daemon`

Manage a local daemon service.

```bash
aeqi daemon start
aeqi daemon status
aeqi daemon stop
aeqi daemon query status
aeqi daemon install --start
aeqi daemon uninstall --stop
```

### `aeqi secrets`

Manage local provider keys and secrets.

```bash
aeqi secrets set OPENROUTER_API_KEY sk-or-...
aeqi secrets set ANTHROPIC_API_KEY sk-ant-...
aeqi secrets get OPENROUTER_API_KEY
aeqi secrets list
aeqi secrets delete OPENROUTER_API_KEY
```

### `aeqi agent`

Manage local persistent agents.

```bash
aeqi agent list
aeqi agent spawn "Research Bot" --model anthropic/claude-sonnet-4.6
aeqi agent show "Research Bot"
aeqi agent registry
aeqi agent retire "Research Bot"
aeqi agent activate "Research Bot"
```

For hosted agent management from AI clients, prefer MCP `agents(...)`.

### `aeqi chat`

Open the interactive terminal chat. With `AEQI_API_KEY` set, it uses hosted
account-key mode. Without it, it uses the local runtime config.

```bash
aeqi chat
aeqi chat --agent assistant
aeqi chat --entity <trust_runtime_id> --role <role_id> --agent <agent_id>
```

### `aeqi mcp`

Run the MCP server over stdio. MCP clients spawn this process and call tools
through it.

```bash
aeqi mcp
```

Hosted mode requires `AEQI_SECRET_KEY`, `AEQI_API_KEY`, and
`AEQI_PLATFORM_URL`. Self-hosted mode uses the local runtime socket from the
config.

### `aeqi ideas`

Manage local Ideas.

```bash
aeqi ideas search "auth patterns"
aeqi ideas store "JWT refresh" "Use rotating refresh tokens with 7-day expiry"
aeqi ideas export --vault ~/notes/aeqi
aeqi ideas import --vault ~/notes/aeqi
```

### `aeqi quests`

List and close local Quests. `assign` creates a Quest for a root agent.

```bash
aeqi assign "Write the onboarding checklist" --root assistant --priority high
aeqi ready
aeqi quests
aeqi quests --all
aeqi close <quest_id> --reason "shipped"
```

For hosted Quest operations from Codex or Claude Code, prefer MCP
`quests(...)`.

### `aeqi graph`

Operate the local code intelligence graph.

```bash
aeqi graph index --root assistant
aeqi graph index --root assistant --full
aeqi graph stats --root assistant
```

### `aeqi doctor`

Run diagnostics across the local install — config presence, database
reachability, missing secrets, broken sockets.

```bash
aeqi doctor
aeqi doctor --fix       # auto-fix what can be auto-fixed
aeqi doctor --strict    # non-zero exit if any issues remain
```

### `aeqi status`

One-shot snapshot of the local runtime state. Prints daemon health, active
agents, recent quests, and config locations.

```bash
aeqi status
```

### `aeqi monitor`

Consolidated operator monitor view. Either one-shot or streaming.

```bash
aeqi monitor
aeqi monitor --root assistant       # focus a single root agent
aeqi monitor --watch                # refresh continuously
aeqi monitor --watch --interval 5
aeqi monitor --json                 # emit as JSON for piping
```

### `aeqi team`

Show system team and per-root teams. Useful for inspecting who works for
whom inside a Company runtime.

```bash
aeqi team
aeqi team --root assistant
```

### `aeqi trust`

Trust-kernel utilities — read or update the on-chain TRUST account for a
local runtime entity id. Subcommands cover account inspection, role management, and
chain-side actions.

```bash
aeqi trust --help
```

### `aeqi audit`

Query the decision audit trail. Filter by root agent, quest, or recency.

```bash
aeqi audit
aeqi audit --root assistant
aeqi audit --quest 67-123
aeqi audit --last 20
```

### `aeqi config`

Reload the local configuration after editing `aeqi.toml`. Subcommands cover
showing, validating, and refreshing the daemon's view of config.

```bash
aeqi config --help
```

### `aeqi primer`

Emit the session-primer context the daemon would inject at session start.
Used by Claude Code's session-start hook; not normally invoked by hand.

```bash
aeqi primer
```

### Less-used commands

These exist but most operators won't reach for them:

- `aeqi run` — one-shot agent invocation with a prompt; useful for scripts.
- `aeqi pipeline` — explicit pipeline workflow operations.
- `aeqi operation` — track work across root agents.
- `aeqi prompt` — legacy prompt-template ops (the four primitives are
  agents/ideas/quests/events; `prompt` predates the renaming).
- `aeqi hooks` / `aeqi hook` — Claude Code hook helpers and worker pin.
- `aeqi done` — alternate quest-close path used by hook scripts.
- `aeqi deps` — suggest or auto-apply quest dependencies.
- `aeqi web` — start the web API server standalone (`aeqi start` is the
  usual entry point).
- `aeqi seed` — seed local databases for fresh installs.

Run `aeqi <cmd> --help` for the current flags.

## Environment variables

| Variable | Used by | Description |
|---|---|---|
| `AEQI_API_KEY` | `aeqi chat`, `aeqi mcp` | Account key (`ak_...`). In chat, this is the bearer token. In MCP, it binds the call to your user account. |
| `AEQI_API_URL` | `aeqi chat` | Hosted platform URL for chat, for example `https://app.aeqi.ai`. |
| `AEQI_SECRET_KEY` | `aeqi mcp` | Secret key (`sk_...`) that selects and authenticates the Company runtime. |
| `AEQI_PLATFORM_URL` | `aeqi mcp` | Hosted platform URL for MCP validation, for example `https://app.aeqi.ai`. |
| `AEQI_CONFIG` | private MCP clients | Path to a private runtime config when not using hosted keys. |
| `AEQI_AGENT` | MCP clients | Optional client hint. It is not account identity and does not own Quests. |
| `AEQI_AGENT_ID` | MCP clients | Explicit runtime agent binding for special cases. Leave unset unless you know you need it. |

## Related

- [MCP](/reference/mcp)
- [Authentication](/docs/api/authentication)
- [REST API](/docs/api/rest)
- [IPC verbs](/docs/reference/ipc)
- [Quickstart](/docs/quickstart)
