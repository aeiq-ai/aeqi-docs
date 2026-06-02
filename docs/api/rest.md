# REST API

The aeqi platform exposes a REST API for Company management, authentication,
billing, integrations, and the catch-all proxy that forwards `/api/*` into a
Company runtime. Lower-level headers and routes still use `trust` / `X-Trust`
as the runtime selection term.

Use the REST API when software needs to operate aeqi over HTTP: account flows,
Company launch, runtime provisioning, integrations, billing, public profiles,
inference, and proxied runtime operations. Use [MCP](/reference/mcp) when an AI
client should operate Company memory, quests, agents, events, and code
intelligence as tools.

## Base URL

| Environment    | URL                              | Notes                                                  |
|----------------|----------------------------------|--------------------------------------------------------|
| Hosted         | `https://app.aeqi.ai/api`        | Platform control plane.                                |
| Self-hosted    | `http://127.0.0.1:8443/api`      | Default platform port.                                 |
| Tenant runtime | `http://127.0.0.1:8400+/api`     | Per-Company runtime; reached through the platform proxy, not directly. |

`/api/*` routes are served by the platform binary (`aeqi-platform.service`). Anything not registered explicitly is forwarded through `routes::proxy::catch_all_proxy_handler` to the tenant runtime selected by `X-Trust` or a `trust` / `trust_id` query parameter.

## Authentication

Most endpoints require a JWT bearer token. The token is obtained from one of several login flows (email + code, password, wallet/SIWE, passkey). The header is:

```
Authorization: Bearer <jwt>
```

The `X-Trust` header selects which Company runtime a proxied call routes to.
Proxied runtime calls return `400` if no runtime is supplied. Non-tenant platform
routes such as login, billing, API keys, and `/api/trusts` do not need it.

A small number of endpoints use other auth modes:

- **MCP key auth** — `/api/mcp` and `/api/mcp/validate` require
  `Authorization: Bearer sk_…`; `X-Api-Key: ak_…` is optional but recommended
  so the platform can bind the call to the same user account.
- **Signed OAuth state** — `/api/integrations/{provider}/callback` is reached by the user's browser after an OAuth provider redirect; the signed `state` token authenticates the call.
- **Admin secret** — `/api/admin/*` requires the platform admin token, not a user JWT.

Full request/response details for the login flows live in [Authentication](/docs/api/authentication).

## Public Endpoints

No auth required.

### Health

```
GET /api/health
GET /api/diagnostics/runtime-health
```

`/api/health` is the liveness check and returns `{ "status": "ok" }`.
`/api/diagnostics/runtime-health` exposes the runtime health summary used by
operator and status surfaces.

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

Email unsubscribe:

```
GET  /unsubscribe
POST /unsubscribe
```

The signed token in the unsubscribe URL is the credential for that endpoint.

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
GET /api/integrations/etsy/callback
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
GET /api/blueprints/default
GET /api/blueprints/{slug}
```

Public, no `X-Trust` required. The catalog is platform-shared static content.
`/api/blueprints/default` returns the configured default launch blueprint.

### Spawn (proxied)

```
POST /api/blueprints/spawn
POST /api/blueprints/spawn-into
```

Registered in the public router so they shadow `/api/blueprints/{slug}`; the catch-all proxy forwards them to the per-TRUST orchestrator selected by `X-Trust`.

### Economy + public profiles

```
GET /api/economy/list
GET /api/public/entities/{slug}
GET /api/public/trust/{address}
GET /api/public/trust/{address}/assets
GET /api/public/trust/{address}/incorporation
GET /api/public/status/walks
```

`/api/economy/list` returns every TRUST whose placement has `public=true`, with on-chain TRUST address — drives `/economy`. `/api/public/entities/{slug}` returns the public profile JSON for a TRUST that has `public=true`; returns 404 for private workspaces (indistinguishable from non-existent). `/api/public/trust/{address}` returns the public composite viewer payload for an on-chain TRUST address when the linked workspace is public.
The `/assets` and `/incorporation` subresources expose public document bundles
for a public TRUST address when those modules are present.
`/api/public/status/walks` returns recent public walk status rows for the
landing status surface.

### Role invitations

```
GET /api/invitations/{token}
```

Resolves a role-invitation token to its details. Public so an unauth recipient can see what they're being invited to before accepting.

### MCP

```
POST /api/mcp
POST /api/mcp/validate
```

`POST /api/mcp` accepts an MCP JSON-RPC request and returns its response.
`/api/mcp/validate` echoes back which actor and TRUST a key resolves to. Auth is
`Authorization: Bearer sk_…`; pass `X-Api-Key: ak_…` as well when binding the
call to a user account. `GET` and `DELETE` are not callable MCP transports on
the hosted platform today.

See [MCP](/reference/mcp) for the tool surface.

### LLM proxy

```
ANY /api/llm/v1/{*path}
```

Forwards OpenAI-compatible chat traffic to the upstream LLM provider configured for the active Company. Use [Inference](/docs/api/inference) (`/v1/*`) for end-user inference; this proxy is for internal runtime traffic.

## Authenticated Endpoints

Require a valid JWT bearer. Proxied runtime endpoints additionally require a
Company runtime context via `X-Trust` or `trust` / `trust_id`.

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
GET  /api/admin/llm-provider
POST /api/admin/llm-provider
GET  /api/account/notifications
POST /api/account/notifications/stop
POST /api/account/notifications/resume
```

`/api/admin/overview` is the *user-facing* admin view (returns 200 only if the caller is a platform admin); it is not part of the admin secret-guarded surface below.
`/api/admin/llm-provider` reads or updates the active hosted inference provider
configuration for platform admins.
The notification routes expose and update the user's channel suppression state.

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

### TRUSTs and legacy entity aliases

```
GET    /api/trusts
POST   /api/trusts
DELETE /api/trusts/{trust_id}
PUT    /api/trusts/{trust_id}
GET    /api/trusts/{trust_id}/assets
GET    /api/trusts/{trust_id}/incorporation
GET    /api/trusts/{trust_id}/email/messages
POST   /api/trusts/{trust_id}/email/test
GET    /api/trusts/{trust_id}/website/analytics
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

`/api/trusts` is the canonical user-owned TRUST collection. `/api/entities/*`
and `/api/roots/*` are legacy aliases for older clients.
The `assets`, `incorporation`, `email`, and `website/analytics` subroutes back
Company website, document, inbox, and analytics panels for a selected runtime.

### /start launch

```
POST /api/start/launch
POST /api/start/check-name
GET  /api/start/launch/status/{trust_id}
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

### Runtime provisioning

```
POST /api/runtime/provision
POST /api/runtime/provision-treasury
GET  /api/runtime/status
```

Provision attaches managed runtime capacity to a TRUST. The Stripe and treasury
paths converge on the same placement lifecycle; `status` reads the live
placement and service state.

### Solana and protocol routes

Mounted only when the relevant Solana services are configured.

```
POST /api/companies/create
POST /api/solana/companies/create
POST /api/solana/first-buy
POST /api/solana/curve-sell
POST /api/solana/token-mint
POST /api/solana/token-burn
POST /api/solana/token-transfer
POST /api/solana/vesting-create
POST /api/solana/budget-module-init
POST /api/solana/budget-create
POST /api/solana/funding-module-init
POST /api/solana/funding-request-create
GET  /api/curves/{trust_id}/state
```

These authenticated routes back staged protocol modules: genesis, first-buy,
curves, token operations, vesting, budgets, and funding requests. Treat them as
deployment-dependent protocol surfaces, not baseline hosted-app requirements.
Normal hosted users create TRUSTs through `/api/trusts` or `/api/start/launch`;
protocol genesis is for Solana-enabled deployments.

### Architect deploy

```
POST /api/architect/deploy
```

Same provisioning path as `/start/launch`, but the Blueprint is the architect-generated inline JSON rather than a static catalog slug. Earlier verbs (`architect.draft`, `architect.refine`) live on the runtime and are reached via the proxy.

### Integrations

Company app OAuth and per-agent OAuth.

Company-scoped app connections:

```
GET /api/trust/{trust_ref}/apps/google/start
GET /api/trust/{trust_ref}/apps/google/status
GET /api/trust/{trust_ref}/apps/etsy/start
GET /api/trust/{trust_ref}/apps/etsy/status
```

Per-agent OAuth, one start/status pair per provider:

```
GET /api/agents/{agent_id}/integrations/google/start
GET /api/agents/{agent_id}/integrations/google/status
GET /api/agents/{agent_id}/integrations/github/start
GET /api/agents/{agent_id}/integrations/github/status
```

`start` returns a signed redirect to the provider. The matching callbacks
`/api/integrations/google/callback`, `/api/integrations/github/callback`, and
`/api/integrations/etsy/callback` are listed above as public routes; providers
redirect there without our auth header.

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
POST /api/trusts/{trust_id}/roles/{role_id}/invitations
GET  /api/trusts/{trust_id}/invitations
POST /api/entities/{trust_id}/roles/{role_id}/invitations
GET  /api/entities/{trust_id}/invitations
POST /api/invitations/{token}/accept
POST /api/invitations/{token}/decline
GET  /api/me/directed-entities
```

Invite users to roles within a TRUST; accept or decline. `/api/trusts/*` is the
canonical surface. `/api/entities/*` is the legacy alias. `/api/me/directed-entities`
lists every entity the caller has been granted directed access to.

### Identity resolver

```
GET /api/identity/resolve
```

Authenticated batch lookup for public keys into known identity records. The
batch size is capped by the platform resolver.

## Proxied Runtime Endpoints

Everything under `/api/*` that is not explicitly listed above is forwarded by
`catch_all_proxy_handler` to the runtime selected by `X-Trust` or `trust` /
`trust_id`. Examples handled this way:

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

### Runtime ideas surface

The runtime registers the following routes under `/api/ideas/*`. Use them
through the platform proxy with `X-Trust` set, not directly against the
per-tenant runtime port.

```
GET    /api/ideas                       List visible ideas (query: agent_id?)
POST   /api/ideas                       Create or supersede an idea
POST   /api/ideas/files                 Upload a root file-backed Idea
GET    /api/ideas/search                Hybrid BM25 + vector search
GET    /api/ideas/prefix                Prefix-match for autocomplete
POST   /api/ideas/by-ids                Batch fetch by id list
GET    /api/ideas/profile               Profile-scoped catalog read
GET    /api/ideas/graph                 Adjacency view for the graph renderer
POST   /api/ideas/seed                  Bulk insert seed ideas (blueprint apply)
PUT    /api/ideas/{id}                  Update name / content / tags
DELETE /api/ideas/{id}                  Delete (fails 409 if a quest still references it)
POST   /api/ideas/{id}/files            Upload a file-backed child Idea
GET    /api/ideas/{id}/edges            Edges incident to one idea
POST   /api/ideas/{id}/edges            Add a typed edge
DELETE /api/ideas/{id}/edges            Remove a typed edge
GET    /api/ideas/{id}/activity         Activity feed (system events on this idea)
GET    /api/ideas/{id}/comments         Comment thread (specialised at the platform)
POST   /api/ideas/{id}/subscribe        Subscribe the caller to comment notifications
GET    /api/ideas/{id}/children         List children (Tables Phase 2)
PUT    /api/ideas/{id}/properties       Update typed properties bag
```

File uploads use `multipart/form-data`. The required fields are `agent_id` and
`file`; optional fields are `scope` and, for root uploads, the parentless route
`/api/ideas/files`. The child route sets `parent_idea_id` from the path and
forwards both forms to the runtime `files_upload` IPC verb, which creates an
Idea wrapper for the artifact.

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
