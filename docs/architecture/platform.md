# Platform

aeqi-platform is the control plane for hosted aeqi. It owns auth, the public API surface, the proxy that routes per-tenant traffic, and the integration glue (OAuth callbacks, webhook receivers, billing).

## What aeqi-platform owns

| Surface | What |
|---|---|
| **Public auth** | `/api/auth/*` — sign-up, login, magic links, OAuth, SIWE, session JWT. |
| **Proxy** | `/api/*` other than auth — routes to the per-tenant runtime selected by `X-Company` (fallback `X-Entity`). |
| **OAuth callbacks** | `/api/integrations/<provider>/callback` — public routes for OAuth handshake completion. |
| **Programmatic lanes** | `POST /api/companies/create` (on-chain Company genesis) and the `/v1/*` inference payment surfaces. |
| **Provisioning** | `POST /api/start/launch` spawns a tenant runtime from a chosen template; `POST /api/architect/deploy` spawns from architect-generated JSON. |
| **Billing** | Stripe webhooks, subscription state, and plan capacity. |
| **Indexer** | Watches on-chain Company events; updates `runtime_placements` rows. |

aeqi-platform does NOT own dashboard rendering — the dashboard SPA is bundled into each tenant runtime and served by the runtime, not the platform. The platform only proxies API and serves the public landing/auth pages.

## Auth model

Two-key model:

- **Session JWT** — for browser dashboards and authenticated API calls. Contains `user_id` and standard `exp`/`iat`; the target Company is selected per-request via `X-Company`, not baked into the token. Issued by `/api/auth/login`. There is no refresh endpoint — log in again to mint a new token.
- **API key** — for programmatic clients. A secret key (`sk_…`) authenticates against one Company; an account key (`ak_…`) binds the call to the user account. See [Authentication](/docs/api/authentication).

Future paid API lanes may support unauthenticated payment as authorization. The
hosted launch path uses normal account auth and subscription billing.

## Sign-up doors

Five paths, all canonical (see [Wallets & identity](/docs/concepts/wallets-and-identity) for the full table):

| Door | Auth credential stored |
|---|---|
| Email magic link | `email` |
| Google OAuth | `oauth_google.sub` |
| GitHub OAuth | `oauth_github.sub` |
| Passkey (WebAuthn) | `passkey.credential_id` |
| External wallet (SIWS) | `wallet.address` |

(SIWS = Sign-In With Solana.) Every sign-up auto-provisions one custodial wallet — the only auto-created primitive in the system. Everything else (Companies, agents, ideas) the user creates explicitly.

## Proxy + tenancy

Inbound API requests carry an `X-Company` header (fallback `X-Entity`, or a `company_id` / `trust_id` query param) identifying the target Company. The platform looks up `runtime_placements`:

```
runtime_placements {
  entity_id, agent_id, port, state_dir,
  trust_address?, status, ...
}
```

The proxy resolves the selector to a placement, then forwards the request to the runtime at its recorded `state_dir` socket. Per-tenant runtimes are systemd units (`aeqi-host-<entity_id>.service`), bound to localhost.

## Provisioning flow

`POST /api/start/launch`:

1. Authenticate caller and check subscription + workspace-cap gates.
2. Mint a fresh Company id.
3. (Optional) Register the Company on-chain via the Solana factory; pin the operating agreement to IPFS.
4. Spawn `aeqi-host-<entity_id>.service` (host placement) or `aeqi-sandbox-<entity_id>.service` (sandbox placement) on a free port; the runtime initializes its DBs.
5. Apply the chosen template: seed Roles, hire agents, store charter Ideas, schedule Events, open kickoff Quests.
6. Insert the `runtime_placements` row. Return `{ ok, trust_id, display_name, website_domain, ... }`.

`POST /api/architect/deploy` runs the same provisioning path but deploys an architect-generated inline template instead of a static catalog slug.

## OAuth handshake

When a user clicks "Connect Google" on an agent's Integrations tab:

1. Frontend → `GET /api/agents/{agent_id}/integrations/google/start` → mint HMAC state token, return `{authorize_url}`.
2. Browser → Google → user consents → Google redirects to `GET /api/integrations/google/callback?code=...&state=...`.
3. Callback verifies state HMAC, exchanges code for tokens, calls runtime's `credentials_ingest` IPC over HTTP.
4. Runtime persists encrypted tokens scoped `(scope_kind=Agent, scope_id=<agent_id>, provider=google)`.
5. Browser redirects back to agent settings with `?connected=google`.

Callback routes are public (no JWT) because Google can't carry one. State HMAC binds `agent_id` against CSRF.

See [Per-agent OAuth (Path B)](/docs/patterns/oauth-path-b).

## Programmatic lanes

```
POST /api/companies/create     ← on-chain Company genesis (live route)
GET/POST /v1/*                 ← OpenAI-compatible inference lane
```

`POST /api/companies/create` is a live route backed by `routes::solana::create_company_handler`; the broader pay-per-call and agent-native payment rails (treasury / x402) are still staged behind the inference billing layer. The hosted launch path uses account auth and subscription billing.

## Indexer

A separate worker watches Solana for Company events:

- Company account created → set `runtime_placements.trust_address`.
- Role assigned → mirror Director-tier role assignments.
- Governance proposal created / voted / executed → populate the Governance tab data.

The indexer subscribes via Solana `programSubscribe` against the canonical Anchor program IDs and projects finalised state into Postgres; signature backfill catches any missed events.

## Order of route registration

axum's router shadows: a parameterized GET (e.g. `/api/{entity_id}/foo`) intercepts POSTs to the same path and 405s instead of falling through to a catch-all. Register specific POSTs **before** parameterized GETs to keep fallthrough working.

This bites cleanly enough that the platform's route builders register the specific spawn POSTs (e.g. `/api/blueprints/spawn`) before the parameterized `/api/blueprints/{slug}` GET. See `aeqi-platform/src/routes/router.rs` if you encounter unexpected 405s.

## Deployment

| Service | Port | Owner |
|---|---|---|
| `aeqi-platform.service` | 8443 | Platform: auth, proxy, OAuth callbacks, programmatic lanes, billing |
| `aeqi-host-<entity_id>.service` | 8400+ | Per-tenant runtime |
| `aeqi-ipfs.service` | 5001 | IPFS daemon (kubo) for content addressing |
| `aeqi-indexer.service` | 8501 | Solana indexer (programSubscribe + signature backfill) |

The retired `aeqi-runtime.service` is no longer used — its responsibilities split into per-tenant `aeqi-host-*` units (2026-04-29). The retired `aeqi-paymaster.service` and `aeqi-bundler.service` units are gone with the EVM stack — Solana uses native fee payment, no bundler or paymaster service required.

## Related

- [Runtime](/docs/architecture/runtime)
- [TRUST](/docs/concepts/trust) — the on-chain layer behind a Company
- [REST API](/docs/api/rest)
- [Authentication](/docs/api/authentication)
