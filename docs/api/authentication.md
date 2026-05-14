# Authentication

aeqi uses a two-key model for programmatic access.

## Key Types

| Key | Prefix | Scope | Purpose |
|-----|--------|-------|---------|
| Account key | `ak_` | Per user | Identifies your account. Used for analytics and rate limiting. One per account, stable across rotations. |
| Secret key | `sk_` | Per company | Authenticates access to one company's runtime. Revocable. Create as many as you need per company. |

For hosted MCP, provide both: the secret key authenticates the company runtime,
and the account key binds calls to your user account. REST requires the secret
key (plus an `X-Company` header); the account key is optional but recommended.

## Create Keys

**Account key** — [Account → API](https://app.aeqi.ai/account?tab=api). One per account, persists across all your companies.

**Secret key** — [Company → API Keys](https://app.aeqi.ai/company?tab=api-keys). One per integration (Claude Code, CI, etc.).

## Use

### MCP (Codex, Claude Code, and other clients)

```bash
export AEQI_API_KEY=ak_...
export AEQI_SECRET_KEY=sk_...
export AEQI_PLATFORM_URL=https://app.aeqi.ai
```

The MCP server validates against the platform on startup, then connects directly
to your company's runtime. See [MCP Integration](/docs/api/mcp).

### REST

```bash
curl https://app.aeqi.ai/api/status \
  -H "Authorization: Bearer sk_..." \
  -H "X-Company: your-company-name"
```

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer sk_...` | Yes |
| `X-Company` | Company name | Yes |
| `X-Api-Key` | `ak_...` | Recommended |

## Rotation

1. Create a new secret key
2. Update your env or config
3. Revoke the old key

Account keys (`ak_`) are identifiers, not secrets — no rotation needed.

## Tier

MCP and REST access require **Pro** or above. Trial and Starter can use the dashboard only.

## Next Steps

- [MCP Integration](/docs/api/mcp) — Codex, Claude Code, and MCP tool catalog
- [REST API](/docs/api/rest) — endpoint reference
- [Claude Code + aeqi](/docs/guides/claude-code) — end-to-end IDE setup
