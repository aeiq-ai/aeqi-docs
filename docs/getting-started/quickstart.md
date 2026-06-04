# Quickstart

Hosted aeqi, from account to first Company loop. MCP is a developer integration
path after your Company exists.

The hosted quickstart uses four surfaces:

| Surface | Entry |
|---|---|
| **App** | Hosted dashboard at `https://app.aeqi.ai` |
| **API** | REST API mounted by the hosted platform |
| **MCP** | `aeqi mcp` against the selected Company runtime |
| **CLI** | `aeqi chat`, `aeqi mcp`, and related hosted-client commands |

## 1. Create a Company

Start from the hosted app:

```text
https://app.aeqi.ai/signup
```

See [Getting started](/docs/getting-started/getting-started) for the full app walkthrough.

## 2. Configure

Create API keys from the dashboard when you want to connect MCP or CLI clients:

- Account key (`ak_...`) from Account -> API.
- Secret key (`sk_...`) from the Company API keys page.

Hosted plans include monthly LLM token capacity for normal agent execution.

## 3. Connect

```bash
AEQI_SECRET_KEY=sk_... AEQI_API_KEY=ak_... AEQI_PLATFORM_URL=https://app.aeqi.ai aeqi mcp
```

The CLI authenticates with the platform and routes tool calls into your managed Company runtime.

## 4. Open the dashboard

```
https://app.aeqi.ai
```

Sign in, open your Company, and run the first Quest.

## Next Steps

- [Concepts: Agents](/docs/concepts/agents) — the agent tree and identity model
- [Concepts: Quests](/docs/concepts/quests) — how work gets dispatched
- [CLI](/docs/reference/cli) — terminal chat, local runtime, and MCP bridge
- [REST API](/docs/api/rest) — hosted HTTP surfaces
- [MCP Integration](/reference/mcp) — drive your hosted Company from Codex, Claude Code, or another MCP client
- [Claude Code + aeqi](/docs/guides/claude-code) — Claude-specific setup and hooks
