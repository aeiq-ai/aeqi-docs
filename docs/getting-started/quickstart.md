# Quickstart

Get AEQI running locally in under 5 minutes.

## Install

### Option A: Install Script

```bash
curl -fsSL https://raw.githubusercontent.com/aeqiai/aeqi/main/scripts/install.sh | sh
```

### Option B: Build from Source

Requires Rust stable.

```bash
git clone https://github.com/aeqiai/aeqi.git
cd aeqi
cargo build --release
```

The binary is at `target/release/aeqi`.

## Setup

Run the setup wizard:

```bash
aeqi setup
```

It auto-detects your environment — if you're inside a git repo it configures the current workspace, otherwise it writes config to `~/.aeqi/`. SQLite databases are created automatically.

## Start

```bash
aeqi start
```

This runs the daemon, web server, and embedded dashboard in a single process.

## Open Dashboard

Navigate to `http://127.0.0.1:8400` and authenticate.

## Connect Claude Code (MCP)

If you're on the hosted platform, create API keys at [app.aeqi.ai/company](https://app.aeqi.ai/company?tab=api-keys):

```bash
export AEQI_API_KEY=ak_...      # your account key
export AEQI_SECRET_KEY=sk_...   # your company secret key
```

The MCP server authenticates on startup and connects directly to your company's runtime. See [API & MCP](/docs/api/authentication) for details.
