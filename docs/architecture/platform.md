# Platform

aeqi-platform is the control plane for hosted aeqi. It owns auth, the public API surface, the proxy that routes per-tenant traffic, and the integration glue (OAuth callbacks, webhook receivers, billing).

## What aeqi-platform owns

| Surface | What |
|---|---|
| **Public auth** | `/api/auth/*` — sign-up, login, magic links, OAuth, SIWE, session JWT. |
| **Proxy** | `/api/*` other than auth — routes to per-tenant runtime by `entity_id`. |
| **OAuth callbacks** | `/api/integrations/<provider>/callback` — public routes for OAuth handshake completion. |
| **Paid API lanes** | Future programmatic genesis and inference payment surfaces. |
| **Provisioning** | `POST /api/start` (single TRUST) and `POST /api/start/stack` (multi-TRUST). Spawns tenant runtimes. |
| **Billing** | Stripe webhooks, subscription state, and plan capacity. |
| **Indexer** | Watches on-chain TRUST events; updates `runtime_placements` rows. |

aeqi-platform does NOT own dashboard rendering — the dashboard SPA is bundled into each tenant runtime and served by the runtime, not the platform. The platform only proxies API and serves the public landing/auth pages.

## Auth model

Two-key model:

- **Session JWT** — for browser dashboards and authenticated API calls. Contains `user_id`, `entity_ids`, expiry. Issued by `/api/auth/login` and refreshed automatically.
- **API key** — for programmatic clients. Issued in user settings. Carries the same `user_id` + entity claims.

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

Every sign-up auto-provisions one custodial wallet — the only auto-created primitive in the system. Everything else (TRUSTs, agents, ideas) the user creates explicitly.

## Proxy + tenancy

Inbound API requests carry an `X-Entity` header (or query param) identifying the target TRUST. The platform looks up `runtime_placements`:

```
runtime_placements {
  entity_id, agent_id, port,
  trust_address?, status, ...
}
```

The proxy resolves `X-Entity → placement` first by `entity_id`, then by `agent_id` for legacy rows, and forwards the request to `127.0.0.1:<port>`. Per-tenant runtimes are systemd units (`aeqi-host-<entity_id>.service`), bound to localhost.

## Provisioning flow

`POST /api/start` (single TRUST):

1. Authenticate caller and check plan capacity.
2. Mint a fresh `entity_id`.
3. (Optional) Register TRUST on-chain via the factory; pin operating agreement to IPFS.
4. Spawn `aeqi-host-<entity_id>.service` on a free port; runtime initializes its DBs.
5. Apply blueprint: seed Roles, hire agents, store charter Ideas, schedule Events, open kickoff Quests.
6. Insert `runtime_placements` row. Return `{entity_id, port, trust_address?}`.

`POST /api/start/stack` runs the same flow for each Component in topo-sorted order, then applies cross-Component edges (TokenOwnership transfers, RoleAssignments, scheduled TreasuryFlows). Edge application is stubbed in v1; W33B worktree implements them.

## OAuth handshake

When a user clicks "Connect Google" on an agent's Integrations tab:

1. Frontend → `GET /api/agents/{agent_id}/integrations/google/start` → mint HMAC state token, return `{authorize_url}`.
2. Browser → Google → user consents → Google redirects to `GET /api/integrations/google/callback?code=...&state=...`.
3. Callback verifies state HMAC, exchanges code for tokens, calls runtime's `credentials_ingest` IPC over HTTP.
4. Runtime persists encrypted tokens scoped `(scope_kind=Agent, scope_id=<agent_id>, provider=google)`.
5. Browser redirects back to agent settings with `?connected=google`.

Callback routes are public (no JWT) because Google can't carry one. State HMAC binds `agent_id` against CSRF.

See [Per-agent OAuth (Path B)](/docs/patterns/oauth-path-b).

## Paid API lanes

```
POST /api/companies/create     ← future paid genesis lane
GET/POST /v1/*                 ← future pay-per-call inference lane
```

These lanes are reserved for agent-native payment flows. The hosted launch path
uses account auth and subscription billing.

## Indexer

A separate worker watches Solana for TRUST events:

- TRUST account created → set `runtime_placements.trust_address`.
- Role assigned → mirror Director-tier role assignments.
- Governance proposal created / voted / executed → populate the Governance tab data.

The indexer subscribes via Solana `programSubscribe` against the canonical Anchor program IDs and projects finalised state into Postgres; signature backfill catches any missed events.

## Order of route registration

axum's router shadows: a parameterized GET (e.g. `/api/{entity_id}/foo`) intercepts POSTs to the same path and 405s instead of falling through to a catch-all. Register specific POSTs **before** parameterized GETs to keep fallthrough working.

This bites cleanly enough that it's worth its own memo. See `/home/claudedev/.claude/projects/-home-claudedev/memory/feedback_axum_route_method_shadowing.md` if you encounter unexpected 405s.

## Deployment

| Service | Port | Owner |
|---|---|---|
| `aeqi-platform.service` | 8443 | Platform: auth, proxy, OAuth callbacks, paid API lanes, billing |
| `aeqi-host-<entity_id>.service` | 8400+ | Per-tenant runtime |
| `aeqi-ipfs.service` | 5001 | IPFS daemon (kubo) for content addressing |
| `aeqi-indexer.service` | 8501 | Solana indexer (programSubscribe + signature backfill) |

The retired `aeqi-runtime.service` is no longer used — its responsibilities split into per-tenant `aeqi-host-*` units (2026-04-29). The retired `aeqi-paymaster.service` and `aeqi-bundler.service` units are gone with the EVM stack — Solana uses native fee payment, no bundler or paymaster service required.

## Related

- [Runtime](/docs/architecture/runtime)
- [TRUST](/docs/concepts/trust) — programmable company
- [REST API](/docs/api/rest)
- [Authentication](/docs/api/authentication)
