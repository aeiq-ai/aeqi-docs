# MCP Integration

aeqi exposes your TRUST as a Model Context Protocol server. Once a TRUST exists,
Codex, Claude Code, and other MCP clients can use the same company context the
dashboard uses: Ideas, Quests, Agents, Events, code intelligence, and runtime
state.

The important distinction: aeqi is not just another tool server. The MCP is the
working surface for the company. Codex can search memory before editing, file
Quests for non-trivial work, inspect the code graph before changing APIs, and
store durable lessons back into the TRUST when the work is done.

## Requirements

- A hosted aeqi account at [app.aeqi.ai](https://app.aeqi.ai).
- At least one TRUST already created.
- An account key (`ak_...`) from [Account -> API](https://app.aeqi.ai/account?tab=api).
- A secret key (`sk_...`) from [Company -> API Keys](https://app.aeqi.ai/company?tab=api-keys).
- The `aeqi` CLI on your `PATH`, or an absolute path to the `aeqi` binary.
- Codex or another MCP-compatible client.

The `sk_...` key selects and authenticates the company runtime. The `ak_...` key
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

## Verify The Connection

Start a fresh Codex session and ask it to check the aeqi MCP profile. A healthy
connection can call:

```text
me(action='profile')
```

Expected result:

- `ok: true`
- a `mode` such as `platform`
- an `entity_id` for the TRUST runtime
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

## Examples

Search company memory before changing behavior:

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
| `AEQI_SECRET_KEY` | Yes | - | Company secret key (`sk_...`) for the TRUST runtime. |
| `AEQI_API_KEY` | Hosted | - | Account key (`ak_...`) that binds calls to your user account. |
| `AEQI_PLATFORM_URL` | No | `https://app.aeqi.ai` | Hosted platform URL. |
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
