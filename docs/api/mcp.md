# MCP Integration

aeqi exposes your TRUST as a Model Context Protocol server. Once a TRUST exists,
Codex, Claude Code, and other MCP clients can use the same TRUST context the
dashboard uses: Ideas, Quests, Agents, Events, code intelligence, and runtime
state.

The important distinction: aeqi is not just another tool server. The MCP is the
working surface for the TRUST. Codex can search memory before editing, file
Quests for non-trivial work, inspect the code graph before changing APIs, and
store durable lessons back into the TRUST when the work is done.

## What Runs Where

For hosted aeqi, `aeqi mcp` is a client process. Your MCP client starts it over
stdio, and the process authenticates to the platform, validates the selected
TRUST, then routes tool calls into that TRUST's managed runtime.

It does not start the hosted runtime. The runtime already exists in aeqi. The
CLI is the bridge between your local AI client and the TRUST runtime.

For self-hosted aeqi, you run the runtime yourself with `aeqi start`, then run
`aeqi mcp` against that local config and socket.

## Identity Model

Hosted MCP normally acts as the authenticated user inside the selected TRUST:

- `AEQI_SECRET_KEY` (`sk_...`) selects and authenticates the TRUST runtime.
- `AEQI_API_KEY` (`ak_...`) binds the call to your user account.
- `AEQI_AGENT` is only a client hint for logs and context. It is not your
  account identity and does not make Quests agent-owned.
- `AEQI_AGENT_ID` is only for explicit agent-bound cases. Most Codex and Claude
  Code setups leave it unset.

You do not need to become an aeqi agent to use Ideas, Quests, Events, or the code
graph. Use explicit `agent` or `agent_id` arguments only when you want to inspect
an agent, hire an agent, retire an agent, or delegate work to one.

`quests(action='list')` is scoped to the selected TRUST runtime by default and
silently drops cross-runtime `scope: "global"` quests, even when `project` is
passed. If you have a specific quest ID, resolve it with
`quests(action='show', quest_id='…')` rather than trusting an empty list result.

## Requirements

- A hosted aeqi account at [app.aeqi.ai](https://app.aeqi.ai).
- At least one TRUST already created.
- An account key (`ak_...`) from [Account -> API](https://app.aeqi.ai/account?tab=api).
- A secret key (`sk_...`) from the TRUST API keys page.
- The `aeqi` CLI on your `PATH`, or an absolute path to the `aeqi` binary.
- Codex or another MCP-compatible client.

The `sk_...` key selects and authenticates the TRUST runtime. The `ak_...` key
binds the call to your user account and should be supplied for hosted use. See
[Authentication](/docs/api/authentication) for creation and rotation.

## Codex Setup

Add an `aeqi` MCP server to `~/.codex/config.toml`:

```toml
[mcp_servers.aeqi]
command = "aeqi"
args = ["mcp"]

[mcp_servers.aeqi.env]
AEQI_SECRET_KEY = "sk_..."
AEQI_API_KEY = "ak_..."
AEQI_PLATFORM_URL = "https://app.aeqi.ai"
```

If `aeqi` is not on your `PATH`, use an absolute command path:

```toml
[mcp_servers.aeqi]
command = "/usr/local/bin/aeqi"
args = ["mcp"]
```

Restart Codex after changing the config. Codex will expose the tools with an MCP
prefix such as `mcp__aeqi__ideas`, `mcp__aeqi__quests`, and
`mcp__aeqi__code`.

Codex also has its own local workspace trust setting, for example:

```toml
[projects."/path/to/your/repo"]
trust_level = "trusted"
```

That setting only tells Codex it may work in the local repository. It does not
authenticate to aeqi and it is not the same thing as an aeqi TRUST. The aeqi
connection comes from the MCP server and the `ak_...` / `sk_...` keys.

## Claude Code Setup

Claude Code reads MCP servers from `~/.claude/settings.json` (or a project
`.claude/settings.json`). Add an `aeqi` server under `mcpServers`:

```json
{
  "mcpServers": {
    "aeqi": {
      "command": "aeqi",
      "args": ["mcp"],
      "env": {
        "AEQI_SECRET_KEY": "sk_...",
        "AEQI_API_KEY": "ak_...",
        "AEQI_PLATFORM_URL": "https://app.aeqi.ai"
      }
    }
  }
}
```

Use an absolute path for `command` if `aeqi` is not on Claude Code's `PATH`.

Once the server is registered, tools appear as `mcp__aeqi__me`,
`mcp__aeqi__ideas`, `mcp__aeqi__quests`, `mcp__aeqi__code`,
`mcp__aeqi__agents`, and `mcp__aeqi__events`. Restart Claude Code (or
`/clear`) after editing settings so the new server is loaded.

## Verify The Connection

Start a fresh Codex session and ask it to check the aeqi MCP profile. A healthy
connection can call:

```text
me(action='profile')
```

Expected result:

- `ok: true`
- a `mode` such as `platform`
- an `entity_id` for the TRUST runtime, where the API still exposes that wire name
- runtime connection details

Then ask Codex to search memory:

```text
ideas(action='search', query='project operating rules', limit=5)
```

If that returns results or an empty successful response, Codex is connected to
the TRUST and can use the MCP during work.

## Operating Loop For Codex

For serious engineering work, teach Codex to use aeqi as the working memory and
ledger:

1. Confirm the connection when the session starts with `me(action='profile')`.
2. Search prior knowledge with `ideas(action='search', query='...')`.
3. Use `code(action='search', ...)`, `code(action='context', ...)`, or
   `code(action='impact', ...)` before refactors, API changes, or unfamiliar
   source edits.
4. Create a Quest for multi-step or user-visible work with
   `quests(action='create', subject='...')`.
5. Keep the Quest current with `quests(action='update', ...)`.
6. Store durable findings with `ideas(action='store', ...)`.
7. Close the Quest with `quests(action='close', result='...')`.

This makes the next Codex session start with the operating history instead of a
blank chat.

## Common User Stories

### Work as yourself with TRUST memory

Use this when Codex or Claude Code is doing work in a repository and should
remember decisions across sessions:

```text
me(action='profile')
ideas(action='search', query='deployment rules for this project', limit=5)
quests(action='create', subject='Fix staging deploy health check')
```

The client is acting as your authenticated account in the TRUST. The Quest is
TRUST/user-scoped unless you pass an agent.

### Delegate to an existing agent

Use this when a runtime agent should own the work:

```text
agents(action='list')
agents(action='get', agent='Executive Assistant')
quests(
  action='create',
  subject='Prepare the weekly operating review',
  description='Summarize open quests, blockers, and recent decisions.',
  agent='Executive Assistant'
)
```

The MCP client creates the Quest; the selected aeqi agent runs inside the
runtime with its role, memory, tools, and event handlers.

### Hire a new agent, then give it work

Use this when the TRUST needs a new persistent worker:

```text
agents(action='hire', template='analyst')
quests(
  action='create',
  subject='Map pricing-page objections',
  description='Review customer notes and draft the top objections with proposed copy changes.',
  agent='analyst'
)
```

The CLI did not become that agent. It asked the runtime to hire an agent, then
created work for the runtime to dispatch.

### Use aeqi like the memory and work ledger for an AI IDE

Use this loop when an AI coding client is editing source:

```text
ideas(action='search', query='auth redirect invariant', limit=5)
code(action='search', project='my-project', query='login callback handler', limit=5)
quests(action='create', subject='Fix auth redirect regression')
code(action='impact', project='my-project', node_id='...')
ideas(action='store', name='auth/redirect-invariant', tags=['auth', 'procedure'], content='...')
quests(action='close', quest_id='67-123', result='Fixed redirect regression and verified tests.')
```

The client remains Codex or Claude Code. aeqi supplies the durable TRUST
context, execution ledger, agents, and code graph.

## Tool Catalog

Most tools use one action-based call shape:

```text
tool(action='...', ...)
```

Codex may display those tools with the MCP server prefix. For example, raw
`ideas(action='search', ...)` may appear in Codex as `mcp__aeqi__ideas`.

| Tool | Actions | Use it for |
|---|---|---|
| `me` | `profile`, `permissions` | Confirm the authenticated user, TRUST runtime, and grants. |
| `ideas` | `store`, `search`, `update`, `delete`, `link`, `feedback`, `walk` | Durable memory, decisions, procedures, strategy, and graph-linked knowledge. |
| `quests` | `create`, `list`, `show`, `update`, `close`, `cancel` | Work tracking, handoff, audit trail, and completion records. |
| `agents` | `get`, `hire`, `retire`, `list`, `projects` | Runtime workers, delegation targets, and project registry. |
| `events` | `create`, `list`, `enable`, `disable`, `delete`, `trigger`, `trace` | Schedules, session lifecycle context, and event automation. |
| `code` | `search`, `context`, `impact`, `diff_impact`, `file`, `file_summary`, `stats`, `index`, `incremental`, `synthesize` | Code intelligence graph, call context, blast radius, and indexing. |

### Ideas tool — response envelopes and error shapes

The `ideas` tool returns a different envelope per action. Plan for it; there is no uniform `{ ok, data }` wrapper across the actions.

| Action | Success envelope | Notes |
|---|---|---|
| `store` | `{ ok: true, idea: { id, name, content, tags, scope, agent_id, status, ... } }` | When dedup decides the candidate matches an existing idea, response carries `superseded_id` and the returned `idea` is the merged result. |
| `search` | `{ ok: true, ideas: [ ... ] }` | `explain=true` adds per-hit `score_components { bm25, vector, hotness, graph, confidence, decay, final_score }`. |
| `update` | `{ ok: true, idea: { ... } }` | Partial — pass only the fields you want to change. |
| `delete` | `{ ok: true, id }` on success | See errors below for the in-use case. |
| `link` | `{ ok: true, from, to, relation, strength }` | Accepts `from`/`to` (canonical) or `source_id`/`target_id` (alias). |
| `feedback` | `{ ok: true }` | Side-effect only; no row returned. The runtime also reads `session_id` and `query_text` from the request when present. |
| `walk` | `{ ok: true, from, count, steps: [{ idea_id, name, depth, strength, relation }] }` | `max_hops` capped at 10, `limit` capped at 100. |

Error responses always carry `ok: false` plus a stable `error` string. Some carry structured context fields:

| Action | Error code | When | Extra fields |
|---|---|---|---|
| any | `invalid scope` | `scope` not in `self / siblings / children / branch / global` | — |
| `store` | `name_required`, `content_required` | Missing fields | — |
| `update`, `delete` | `not_found` | No idea with that id visible to the caller | — |
| `delete` | `in_use` | Quest still references this idea (cross-DB FK) | `quest_ids: [...]` |
| `link` | `relation_not_writable` | `relation` is not in `mention / embed / link` (the substrate-writable set) | — |
| `link`, `walk` | `not_visible` | `from` or `to` is outside the caller's scope | — |
| `walk` | `bad_request` | `from` missing or `max_hops > 10` | — |

The error vocabulary is stable; the human-readable `message` may change. Match on `error`, not `message`.

### `IdeasTool` (in-runtime LLM tool) vs MCP `ideas` (external)

The in-runtime LLM tool registered at `aeqi_orchestrator::tools::ideas::IdeasTool` advertises **only** `store / search / update / delete`. The MCP `ideas` surface adds three more verbs (`link`, `feedback`, `walk`) that the orchestrator's IPC layer handles directly, not through the LLM tool registry.

This is **intentional**: graph-mutation and feedback verbs are operator/MCP-driven, not LLM-driven. An agent inside the runtime cannot fire `ideas.link` or `ideas.feedback` via its tool registry — only an external MCP caller (or an event-driven dispatch) can. If you need an agent to mutate the graph, route it through an event handler or expose a wrapping tool with the correct `CallerKind` ACL.

## Examples

Search TRUST memory before changing behavior:

```text
ideas(action='search', query='authentication patterns token rotation', limit=5)
```

Create a Quest for work Codex is about to do:

```text
quests(
  action='create',
  subject='Fix login redirect after passkey sign-in',
  description='Investigate the redirect path, add regression coverage, and close with verification.',
  priority='normal'
)
```

Inspect code context before editing a route or function:

```text
code(action='search', project='my-project', query='login callback handler', limit=5)
```

Store a lesson that future sessions should recover:

```text
ideas(
  action='store',
  name='auth/passkey-redirect-invariant',
  tags=['auth', 'procedure'],
  content='Passkey login must preserve the original redirect target through the challenge and finish calls.'
)
```

Close the Quest with the actual result:

```text
quests(
  action='close',
  quest_id='67-123',
  result='Fixed redirect preservation and verified with the focused auth test.'
)
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---:|---|---|
| `AEQI_SECRET_KEY` | Hosted | - | TRUST secret key (`sk_...`) for the TRUST runtime. |
| `AEQI_API_KEY` | Hosted | - | Account key (`ak_...`) that binds calls to your user account. |
| `AEQI_PLATFORM_URL` | Hosted | - | Hosted platform URL, for example `https://app.aeqi.ai`. Set this explicitly for hosted use. |
| `AEQI_CONFIG` | Self-hosted | - | Path to a local `aeqi.toml` when not using hosted keys. |
| `AEQI_AGENT` | No | Client name | Optional client hint for logs and runtime context. It is not your account identity. |
| `AEQI_AGENT_ID` | No | - | Explicit runtime agent ID when intentionally acting as a specific agent. |

Do not commit `ak_...` or `sk_...` keys to a repository. Prefer local client
config, a password manager, or environment injection.

## Self-Hosted

For self-hosted aeqi, run the local runtime first:

```bash
aeqi start
```

Then point Codex at the local binary:

```toml
[mcp_servers.aeqi]
command = "aeqi"
args = ["mcp"]

[mcp_servers.aeqi.env]
AEQI_CONFIG = "/path/to/aeqi.toml"
```

No hosted keys are required when the MCP server connects to your own local
runtime.

You can also pass the config explicitly:

```toml
[mcp_servers.aeqi]
command = "aeqi"
args = ["--config", "/path/to/aeqi.toml", "mcp"]
```

## Troubleshooting

| Symptom | Check |
|---|---|
| Codex does not show any aeqi tools | Restart Codex after editing `~/.codex/config.toml`; confirm the table name is `[mcp_servers.aeqi]`. |
| Authentication fails | Confirm `AEQI_SECRET_KEY` starts with `sk_...`, belongs to the selected TRUST, and has not been revoked. |
| Calls authenticate but show the wrong context | Confirm `AEQI_API_KEY` is the account key for the same user and that the secret key was created under the intended TRUST. |
| `aeqi` is not found | Use an absolute `command` path in the Codex config. |
| Self-hosted calls cannot connect | Confirm `aeqi start` is running and `AEQI_CONFIG` points at the same runtime config. |

## Related

- [Authentication](/docs/api/authentication) - key creation and rotation.
- [REST API](/docs/api/rest) - HTTP endpoints for platform operations.
- [Inference API](/docs/api/inference) - OpenAI-compatible model access.
- [CLI](/docs/reference/cli) - local `aeqi` commands.
