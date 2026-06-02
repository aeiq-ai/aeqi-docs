# Quickstart

Self-hosted aeqi, running locally in under 5 minutes. For the hosted platform,
start with [Getting started](/docs/getting-started/getting-started). MCP is a
developer integration path after your Company exists.

## 1. Install

Install script (Linux, macOS, WSL):

```bash
curl -fsSL https://raw.githubusercontent.com/aeqiai/aeqi/main/scripts/install.sh | sh
```

Or build from source (requires Rust stable):

```bash
git clone https://github.com/aeqiai/aeqi.git
cd aeqi
cargo build --release
# binary at target/release/aeqi
```

See [Installation](/docs/installation) for Cargo, Docker, and manual source builds.

## 2. Configure

```bash
aeqi setup
```

The wizard detects your environment: inside a git repo it configures the current workspace, otherwise it writes to `~/.aeqi/`. SQLite databases are created on first run.

Set an LLM provider key:

```bash
aeqi secrets set OPENROUTER_API_KEY sk-or-...
```

OpenRouter, Anthropic, and Ollama are supported.

## 3. Start

```bash
aeqi start
```

Runs the daemon, REST API, and dashboard in one process. Default port is `8400`.

## 4. Open the Dashboard

```
http://127.0.0.1:8400
```

Sign in and hire your first agent.

## Next Steps

- [Concepts: Agents](/docs/concepts/agents) — the agent tree and identity model
- [Concepts: Quests](/docs/concepts/quests) — how work gets dispatched
- [MCP Integration](/reference/mcp) — drive your hosted Company from Codex, Claude Code, or another MCP client
- [Claude Code + aeqi](/docs/guides/claude-code) — Claude-specific setup and hooks
