# REST API

The aeqi platform exposes a REST API for entity management, authentication, and integration.

## Base URL

| Environment | URL |
|-------------|-----|
| Hosted | `https://app.aeqi.ai/api` |
| Self-hosted | `http://127.0.0.1:8400/api` |

## Authentication

Most endpoints require SIWE (Sign-In-With-Ethereum) authentication via JWT token. See [Authentication](/docs/api/authentication) for details.

Some endpoints are authenticated by payment (`/api/companies/create`) or by API key (`/api/mcp/validate`).

## Public Endpoints

### Health

```
GET /api/health
```

Server liveness check.

**Response:**
```json
{ "status": "ok" }
```

### Authentication

```
GET  /api/auth/mode
POST /api/auth/login
POST /api/auth/login/email
POST /api/auth/signup
POST /api/auth/verify
POST /api/auth/resend-code
```

OAuth entry points:
```
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/github
GET /api/auth/github/callback
```

Wallet authentication:
```
POST /api/auth/wallet/nonce
POST /api/auth/wallet/login
POST /api/auth/wallet/signup
```

Passkey authentication:
```
POST /api/auth/passkey/register-begin
POST /api/auth/passkey/register-finish
POST /api/auth/passkey/login-begin
POST /api/auth/passkey/login-finish
```

Passwordless email sign-in:
```
POST /api/auth/login/code/request
POST /api/auth/login/code/consume
POST /api/auth/login/magic/consume
```

Password recovery:
```
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Other auth endpoints:
```
POST /api/auth/totp/login
POST /api/auth/invite/check
POST /api/auth/waitlist
GET  /api/auth/waitlist/confirm
```

See [Authentication](/docs/api/authentication) for request/response details and JWT token handling.

### Webhooks

Inbound webhook handlers for external services:
```
POST /api/webhooks/stripe
POST /api/webhooks/deploy
POST /api/webhooks/telegram/{token}
POST /api/webhooks/whatsapp
```

### Blueprint Catalog

```
GET /api/blueprints
GET /api/blueprints/{slug}
```

Lists available agent blueprints (public, no auth required).

### Indexer (On-Chain Data)

```
POST /indexer/graphql
```

GraphQL endpoint for querying on-chain state: registered trusts, role configurations, treasury data. The endpoint is a reverse-proxy to the active chain's indexer.

**Note:** Indexing is active only when `AEQI_CHAIN_ACTIVE` is set (anvil, base-sepolia, or base-mainnet).

Example query:
```graphql
query {
  trustsCount
}
```

### Company Genesis (x402)

```
POST /api/companies/create
```

Create a new Company via HTTP 402 payment in USDC on Solana.

**Auth:** HTTP 402 payment header + signature verification. No user JWT required.

**Request:**
```json
{
  "blueprint": "default",
  "name": "My Company",
  "owner_address": "0x...",
  "roles": [
    {
      "name": "CEO",
      "owner": "0x...",
      "vesting_months": 36
    }
  ]
}
```

**Response (200):**
```json
{
  "entity_id": "...",
  "trust_address": "0x... | pending",
  "runtime_url": "https://... | pending",
  "owner": "0x..."
}
```

**Errors:**
- `402 Payment Required` — missing or invalid x402 payment
- `400 Bad Request` — invalid blueprint, missing name, or malformed owner address
- `500 Internal Server Error` — bridge not configured

### Role Invitations

Public token resolver (no auth required):
```
GET /api/invitations/{token}
```

Get invitation details by token.

## Authenticated Endpoints

Require a valid JWT token (from SIWE login). See [Authentication](/docs/api/authentication).

### Entity Management

```
GET  /api/entities
POST /api/entities
DELETE /api/entities/{name}
```

List, create, and delete Companies (root entities).

```
POST /api/roots
GET  /api/roots
DELETE /api/roots/{name}
```

Legacy alias for entity endpoints.

### Entity Settings

Account and profile:
```
GET  /api/auth/me
POST /api/auth/phishing-code
POST /api/auth/totp/setup
POST /api/auth/totp/verify
POST /api/auth/totp/disable
GET  /api/auth/activity
GET  /api/auth/sessions
POST /api/auth/sessions/revoke
POST /api/auth/sessions/revoke-others
GET  /api/auth/invite-codes
POST /api/auth/invite-codes
```

Wallet management:
```
POST /api/me/wallets/link
PUT  /api/me/wallets/{id}/primary
DELETE /api/me/wallets/{id}
```

Email management:
```
POST /api/me/email/change/begin
POST /api/me/email/change/finish
```

Passkeys:
```
POST /api/me/passkeys/add/begin
POST /api/me/passkeys/add/finish
```

### Billing

```
POST /api/billing/checkout
GET  /api/billing/subscription
POST /api/billing/portal
GET  /api/billing/overview
POST /api/billing/switch-to-usdc
```

Subscription and payment management via Stripe (dollar-denominated or USDC).

### API Keys

```
POST /api/keys
GET  /api/keys
DELETE /api/keys/{id}
```

Create and manage API keys for programmatic access.

```
POST /api/account/api-key
```

Generate a personal API key.

### Start Launch

```
POST /api/start/launch
```

Provision a personal Company via the /start experience. Gated by subscription status.

**Request:**
```json
{
  "template": "default",
  "display_name": "My Company"
}
```

**Response:**
```json
{
  "ok": true,
  "entity_id": "...",
  "display_name": "..."
}
```

### Hosting

```
GET  /api/hosting/domains
POST /api/hosting/domains
DELETE /api/hosting/domains/{domain}
```

Manage custom domains for Company instances.

### Role Invitations

```
POST /api/entities/{entity_id}/roles/{role_id}/invitations
GET  /api/entities/{entity_id}/invitations
POST /api/invitations/{token}/accept
POST /api/invitations/{token}/decline
GET  /api/me/directed-entities
```

Invite users to roles within an entity; accept or decline invitations.

### Proxied Runtime Endpoints

All other `/api/*` endpoints (agents, quests, ideas, sessions, chat) are proxied to the entity's runtime. The runtime handles:

```
GET    /api/agents                    List agents
POST   /api/agents/spawn              Create agent
GET    /api/quests                    List quests
POST   /api/quests                    Create quest
GET    /api/ideas                     List ideas
POST   /api/ideas                     Create idea
GET    /api/sessions                  List sessions
POST   /api/chat                      Send message
WebSocket /api/chat/stream            Stream chat tokens
```

Routing is determined by the `X-Entity` header, which is inferred from your JWT claims or explicitly provided.

## Response Format

Success responses carry HTTP 200:
```json
{ "ok": true, "data": { ... } }
```

Error responses carry 4xx or 5xx status:
```json
{ "ok": false, "error": "code", "message": "human-readable description" }
```

## Rate Limiting

No formal rate limits are published; however, tower-governor is installed on the runtime platform. Aggressive abuse may trigger 429 responses.

## Next Steps

- [Authentication](/docs/api/authentication) — signing messages, token management
- [MCP Integration](/docs/api/mcp) — operate the same endpoints via MCP
- [Concepts](/docs/concepts/agents) — mental model and primitives
