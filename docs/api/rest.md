# REST API

The aeqi platform exposes a REST API for entity management, authentication, billing, integrations, and the catch-all proxy that forwards `/api/*` into a Company's runtime.

## Base URL

| Environment    | URL                              | Notes                                                  |
|----------------|----------------------------------|--------------------------------------------------------|
| Hosted         | `https://app.aeqi.ai/api`        | Platform control plane.                                |
| Self-hosted    | `http://127.0.0.1:8443/api`      | Default platform port.                                 |
| Tenant runtime | `http://127.0.0.1:8400+/api`     | Per-Company runtime; reached through the platform proxy, not directly. |

`/api/*` routes are served by the platform binary (`aeqi-platform.service`). Anything not registered explicitly is forwarded through `routes::proxy::catch_all_proxy_handler` to the tenant runtime selected by the `X-Entity` header.

## Authentication

Most endpoints require a JWT bearer token. The token is obtained from one of several login flows (email + code, password, wallet/SIWE, passkey). The header is:

```
Authorization: Bearer <jwt>
```

The `X-Entity` header selects which Company's runtime a proxied call routes to. It defaults to the user's primary entity, derived from JWT claims, but can be set explicitly to operate against any entity the caller has access to.

A small number of endpoints use other auth modes:

- **API-key auth** — `/api/mcp` and `/api/mcp/validate` accept an `Authorization: Bearer ak_…` API key instead of a JWT.
- **No auth** — `/api/companies/create` is currently programmatic genesis with no auth gate (see notes).
- **Signed OAuth state** — `/api/integrations/{provider}/callback` is reached by the user's browser after an OAuth provider redirect; the signed `state` token authenticates the call.
- **Admin secret** — `/api/admin/*` requires the platform admin token, not a user JWT.

Full request/response details for the login flows live in [Authentication](/docs/api/authentication).

## Public Endpoints

No auth required.

### Health

```
GET /api/health
```

Liveness check. Returns `{ "status": "ok" }`.

### Authentication entry points

```
GET  /api/auth/mode
POST /api/auth/login
POST /api/auth/login/email
POST /api/auth/signup
POST /api/auth/verify
POST /api/auth/resend-code
```

Wallet auth (SIWE):

```
POST /api/auth/wallet/nonce
POST /api/auth/wallet/login
POST /api/auth/wallet/signup
```

Passkey auth:

```
POST /api/auth/passkey/register-begin
POST /api/auth/passkey/register-finish
POST /api/auth/passkey/login-begin
POST /api/auth/passkey/login-finish
```

Passwordless email sign-in (single login-codes row, three consume paths):

```
POST /api/auth/login/code/request
POST /api/auth/login/code/consume
POST /api/auth/login/magic/consume
```

TOTP login step:

```
POST /api/auth/totp/login
```

Password recovery:

```
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Invites and waitlist:

```
POST /api/auth/invite/check
POST /api/auth/waitlist
GET  /api/auth/waitlist/confirm
```

### Solana welcome flow

Mounted only when `AEQI_SOLANA_RPC` is configured. Used by the `/welcome` onboarding shell, which provisions a Solana custodial signer alongside the platform identity.

```
POST /api/auth/welcome/email-start
GET  /api/auth/welcome/email-verify
POST /api/auth/welcome/email-verify-code
POST /api/auth/welcome/wallet-start
POST /api/auth/welcome/wallet-verify
POST /api/auth/welcome/passkey-register-start
POST /api/auth/welcome/passkey-register-finish
POST /api/auth/welcome/passkey-assert-start
POST /api/auth/welcome/passkey-assert-finish
GET  /api/auth/welcome/google/start
GET  /api/auth/welcome/google/callback
GET  /api/auth/welcome/github/start
GET  /api/auth/welcome/github/callback
```

### OAuth provider callbacks

```
GET /api/integrations/google/callback
GET /api/integrations/github/callback
```

Reached by the user's browser after the OAuth provider redirects back. The signed `state` token resolves the owning agent + entity. The matching authenticated start/status endpoints are under [Authenticated Endpoints → Integrations](#integrations).

### Webhooks

Inbound webhook handlers for external services:

```
POST /api/webhooks/stripe
POST /api/webhooks/deploy
POST /api/webhooks/telegram/{token}
POST /api/webhooks/whatsapp
```

### Blueprint catalog

```
GET /api/blueprints
GET /api/blueprints/{slug}
```

Public, no `X-Entity` required. The catalog is platform-shared static content.

### Spawn (proxied)

```
POST /api/blueprints/spawn
POST /api/blueprints/spawn-into
```

Registered in the public router so they shadow `/api/blueprints/{slug}`; the catch-all proxy forwards them to the per-Company orchestrator selected by `X-Entity`.

### Economy + public profiles

```
GET /api/economy/list
GET /api/public/entities/{slug}
GET /api/public/trust/{address}
```

`/api/economy/list` returns every TRUST whose placement has `public=true`, with on-chain TRUST address — drives `/economy`. `/api/public/entities/{slug}` returns the public profile JSON for a TRUST that has `public=true`; returns 404 for private workspaces (indistinguishable from non-existent). `/api/public/trust/{address}` returns the public composite viewer payload for an on-chain TRUST address when the linked workspace is public.

### Role invitations

```
GET /api/invitations/{token}
```

Resolves a role-invitation token to its details. Public so an unauth recipient can see what they're being invited to before accepting.

### MCP

```
POST /api/mcp
GET  /api/mcp
DELETE /api/mcp
POST /api/mcp/validate
```

The first three accept an MCP JSON-RPC request and return its response. `/api/mcp/validate` echoes back which actor + entity an API key resolves to. Auth is an `Authorization: Bearer ak_…` API key; no user JWT.

See [MCP](/reference/mcp) for the tool surface.

### Company genesis

```
POST /api/companies/create
POST /api/solana/companies/create
```

Provisions a TRUST on Solana for a given `company_id`. Idempotent on the deterministic trust PDA — repeating the call against an existing `company_id` returns the same trust without re-spawning. Currently has **no auth gate**: the planned x402-USDC payment header is not yet enforced on this path.

**Request:**

```json
{
  "company_id": "stable-id-string",
  "trust_id_hex": "0x...optional 32-byte hex; omit for SHA-256 of company_id"
}
```

**Response (200):**

```json
{
  "company_id": "...",
  "trust_id_hex": "0x...",
  "trust_pubkey_b58": "...",
  "authority_pubkey_b58": "...",
  "already_existed": false,
  "create_signature_b58": "...",
  "role_init_signature_b58": "...",
  "token_init_signature_b58": "...",
  "governance_init_signature_b58": "...",
  "role_module_pda_b58": "...",
  "token_module_pda_b58": "...",
  "governance_module_pda_b58": "...",
  "role_module_state_pda_b58": "...",
  "token_module_state_pda_b58": "...",
  "governance_module_state_pda_b58": "..."
}
```

**Errors:**

- `400 Bad Request` — invalid `trust_id_hex`.
- `502 Bad Gateway` — the custodial signer for `company_id` could not be provisioned or funded.
- `500 Internal Server Error` — the Solana wallet service is misconfigured or unreachable.

The endpoint is mounted only when the platform has been started with a working Solana wallet service (`AEQI_SOLANA_RPC` set). Without it, both routes return 404.

### LLM proxy

```
ANY /api/llm/v1/{*path}
```

Forwards OpenAI-compatible chat traffic to the upstream LLM provider configured for the active Company. Use [Inference](/docs/api/inference) (`/v1/*`) for end-user inference; this proxy is for internal runtime traffic.

## Authenticated Endpoints

Require a valid JWT bearer. Specific endpoints additionally require a Company context via `X-Entity`.

### Account

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
GET  /api/admin/overview
```

`/api/admin/overview` is the *user-facing* admin view (returns 200 only if the caller is a platform admin); it is not part of the admin secret-guarded surface below.

### Email change

```
POST /api/me/email/change/begin
POST /api/me/email/change/finish
```

### Wallets

```
POST   /api/me/wallets/link
PUT    /api/me/wallets/{id}/primary
DELETE /api/me/wallets/{id}
```

### Passkeys

```
POST /api/me/passkeys/add/begin
POST /api/me/passkeys/add/finish
POST /api/account/enroll-passkey
POST /api/wallet/upgrade-to-passkey
```

The last two return `501 Not Implemented` until WS-4e ships.

### Billing

```
POST /api/billing/checkout
GET  /api/billing/subscription
POST /api/billing/portal
GET  /api/billing/overview
POST /api/billing/switch-to-usdc
```

Subscription and payment management via Stripe (USD or USDC).

### Companies (entities)

```
GET    /api/entities
POST   /api/entities
DELETE /api/entities/{name}
PUT    /api/entities/{name}
```

```
GET    /api/roots
POST   /api/roots
DELETE /api/roots/{name}
```

`/api/roots/*` is a legacy alias for `/api/entities/*` — both call the same handlers. New code should use `/api/entities`.

### /start launch

```
POST /api/start/launch
POST /api/start/check-name
```

`launch` provisions a personal Company via the `/start` experience. Gated by subscription status (`subscription_required` HTTP 402 if missing) and a workspace cap of 10 companies per user (`workspace_cap_exceeded` HTTP 402; admins exempt).

**Request:**

```json
{
  "template": "default",
  "display_name": "My Company",
  "mission": "optional one-line mission statement",
  "plan": "growth"
}
```

`name` is accepted as a fallback alias for `display_name`. If `template` is omitted, the configured default blueprint is used.

**Response (200):**

```json
{
  "ok": true,
  "entity_id": "uuid",
  "display_name": "My Company"
}
```

Placement provisioning (sandbox / host / VPS) proceeds async; poll the placement until its `status` flips from `pending` to `ready`. `check-name` returns whether a display name is available for the caller.

### Architect deploy

```
POST /api/architect/deploy
```

Same provisioning path as `/start/launch`, but the Blueprint is the architect-generated inline JSON rather than a static catalog slug. Earlier verbs (`architect.draft`, `architect.refine`) live on the runtime and are reached via the proxy.

### Integrations

Per-agent OAuth, one start/status pair per provider:

```
GET /api/agents/{agent_id}/integrations/google/start
GET /api/agents/{agent_id}/integrations/google/status
GET /api/agents/{agent_id}/integrations/github/start
GET /api/agents/{agent_id}/integrations/github/status
```

`start` returns a signed redirect to the provider. The matching callbacks `/api/integrations/google/callback` and `/api/integrations/github/callback` are listed above as public routes — Google/GitHub redirect there without our auth header.

### API keys

```
POST /api/keys
GET  /api/keys
DELETE /api/keys/{id}
POST /api/account/api-key
```

`/api/account/api-key` mints a single personal API key (older surface). `/api/keys` is the labelled, multi-key collection.

### Hosting

```
GET    /api/hosting/domains
POST   /api/hosting/domains
DELETE /api/hosting/domains/{domain}
```

Manage custom domains for Company runtimes.

### Role invitations

```
POST /api/entities/{entity_id}/roles/{role_id}/invitations
GET  /api/entities/{entity_id}/invitations
POST /api/invitations/{token}/accept
POST /api/invitations/{token}/decline
GET  /api/me/directed-entities
```

Invite users to roles within an entity; accept or decline. `/api/me/directed-entities` lists every entity the caller has been granted directed access to.

## Proxied Runtime Endpoints

Everything under `/api/*` that is not explicitly listed above is forwarded by `catch_all_proxy_handler` to the runtime selected by `X-Entity`. Examples handled this way:

```
GET    /api/agents
POST   /api/agents/spawn
GET    /api/quests
POST   /api/quests
GET    /api/ideas
POST   /api/ideas
GET    /api/sessions
POST   /api/chat
```

A few proxied paths have platform-side specialisation registered explicitly so the response can be patched before being returned:

- `GET /api/ws` — WebSocket proxy.
- `GET /api/chat/stream` — server-sent events / WebSocket stream proxy.
- `GET /api/ideas/{id}/comments` — proxies the runtime reply but injects user display names from the platform user table.
- `GET /api/roles`, `GET /api/roles/{id}` — proxies and patches `occupant_name` for human occupants.
- `ANY /api/inbox/__probe__/dismiss` — short-circuits to 204; reachability probe, never forwarded.

### Runtime ideas surface

The runtime registers the following routes under `/api/ideas/*`. Use them through the platform proxy with `X-Entity` set, not directly against the per-tenant runtime port.

```
GET    /api/ideas                       List visible ideas (query: agent_id?)
POST   /api/ideas                       Create or supersede an idea
GET    /api/ideas/search                Hybrid BM25 + vector search
GET    /api/ideas/prefix                Prefix-match for autocomplete
POST   /api/ideas/by-ids                Batch fetch by id list
GET    /api/ideas/profile               Profile-scoped catalog read
GET    /api/ideas/graph                 Adjacency view for the graph renderer
POST   /api/ideas/seed                  Bulk insert seed ideas (blueprint apply)
PUT    /api/ideas/{id}                  Update name / content / tags
DELETE /api/ideas/{id}                  Delete (fails 409 if a quest still references it)
GET    /api/ideas/{id}/edges            Edges incident to one idea
POST   /api/ideas/{id}/edges            Add a typed edge
DELETE /api/ideas/{id}/edges            Remove a typed edge
GET    /api/ideas/{id}/activity         Activity feed (system events on this idea)
GET    /api/ideas/{id}/comments         Comment thread (specialised at the platform)
POST   /api/ideas/{id}/subscribe        Subscribe the caller to comment notifications
GET    /api/ideas/{id}/children         List children (Tables Phase 2)
PUT    /api/ideas/{id}/properties       Update typed properties bag
```

`link`, `feedback`, and `walk` are MCP-only verbs — there are no REST routes for them. The MCP dispatcher rewrites them into IPC commands (`link_idea`, `feedback_idea`, `walk_ideas`).

## Admin Endpoints

Require the platform admin secret (header), not a user JWT.

```
GET  /api/admin/containers
POST /api/admin/containers/{id}/restart
GET  /api/admin/roots
POST /api/admin/roots/{name}/promote-host
POST /api/admin/roots/{name}/seed
POST /api/admin/update
GET  /api/admin/stats
GET  /api/admin/template-packs
POST /api/admin/template-packs
GET  /api/admin/template-packs/{slug}
POST /api/admin/template-packs/{slug}/templates
POST /api/admin/vps/spawn-test
```

## Response Format

Responses are not wrapped in a uniform envelope — different handlers return different shapes. Common patterns:

```json
{ "ok": true, "entity_id": "..." }
```

```json
{ "items": [ ... ], "next_cursor": null }
```

Errors return a 4xx or 5xx status with a body of one of:

```json
{ "ok": false, "error": "code", "message": "human-readable description" }
```

```json
{ "error": "code", "message": "..." }
```

Inference and MCP have their own error shapes — see those references.

## Rate Limiting

Platform-side: no per-endpoint quotas are published. The tenant runtime applies `tower_governor` with `SmartIpKeyExtractor` — abuse can trigger 429 responses. The runtime-bound proxy always injects `X-Forwarded-For: 127.0.0.1` from inside the platform binary so internal calls survive the key extractor.

## Next Steps

- [Authentication](/docs/api/authentication) — JWT lifecycle, signup, login flows.
- [Inference](/docs/api/inference) — `/v1/*` OpenAI-compatible chat.
- [MCP](/reference/mcp) — operate the same surface programmatically.
- [Concepts](/docs/concepts/agents) — the four primitives.
