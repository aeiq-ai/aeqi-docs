# Authentication

AEQI uses a two-key authentication model for API and MCP access.

## Key Types

| Key | Prefix | Scope | Purpose |
|-----|--------|-------|---------|
| **API Key** | `ak_` | Per user | Identifies your account. Used for analytics and rate limiting. Stable across key rotations. |
| **Secret Key** | `sk_` | Per company | Authenticates access to a specific company's runtime. Revocable. Create multiple per company. |

Both keys are required for MCP connections. API calls accept either JWT (from the dashboard) or the `sk_` key.

## Creating Keys

### API Key (account-level)

Generate your API key from [Account → API](https://app.aeqi.ai/account?tab=api). Each account has exactly one API key. It persists across all your companies.

### Secret Key (company-level)

Create secret keys from [Company → API Keys](https://app.aeqi.ai/company?tab=api-keys). You can create multiple secret keys per company — one for Claude Code, one for CI, etc.

## Using Keys

### MCP (Claude Code)

Set environment variables before starting Claude Code:

```bash
export AEQI_API_KEY=ak_...
export AEQI_SECRET_KEY=sk_...
```

The MCP server validates against the platform on startup, then connects directly to your company's runtime.

### REST API

Pass the secret key as a Bearer token:

```bash
curl https://app.aeqi.ai/api/status \
  -H "Authorization: Bearer sk_..." \
  -H "X-Company: your-company-name"
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer sk_...` | Yes |
| `X-Api-Key` | `ak_...` | Recommended (analytics) |
| `X-Company` | Company name | Yes for REST API |

## Key Rotation

1. Create a new secret key on the company page
2. Update your environment/config
3. Revoke the old key

Your API key (`ak_`) never needs rotation — it's an identifier, not a secret.

## Tier Requirements

API and MCP access requires a **Pro** subscription or above. Trial and Starter plans can use the web dashboard but not programmatic access.
