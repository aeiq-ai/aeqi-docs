# Per-agent OAuth (Path B)

Agents OAuth into third-party providers (Gmail, Calendar, Slack, GitHub, Notion) with **per-agent credentials**. The agent is the principal; the user consents on the agent's behalf.

This is the canonical aeqi pattern. Founder pick, 2026-05-06: "we should just use the app to connect the hello@aeiq.ai email per oauth to the agent — that's the right path logically."

## Why per-agent (not per-user)

Three viable patterns:

| Pattern | Description | Verdict |
|---|---|---|
| **A. OAuth user-flow** | Tokens land on a user, then bound to an agent at runtime. | Hack. The agent isn't the principal; revocation gets weird. |
| **B. Per-agent OAuth** *(canonical)* | Each agent has its own OAuth identity. "Connect Google" on agent settings → user consents on behalf of the agent → tokens scoped `(scope_kind=Agent, scope_id=<agent_id>, provider="google")`. | Clean. Same flow customer orgs use. |
| **C. Service Account + DWD** | One service account impersonates any `*@aeiq.ai` mailbox. | Admin-only setup; not viable for customer orgs. Can coexist for internal automation. |

Path B is what ships in product.

## The flow

1. User opens an agent's **Integrations** tab.
2. User clicks **Connect Google** (or Slack, Notion, GitHub — provider-agnostic).
3. Frontend calls `GET /api/agents/{agent_id}/integrations/google/start`. Platform mints an HMAC-signed state token (binds `agent_id`, nonce, expiry); returns `{authorize_url}`.
4. Browser redirects to provider's OAuth screen with `agent_id`-bound state.
5. User consents.
6. Provider redirects to `GET /api/integrations/google/callback?code=...&state=...`. Public route, no auth — provider can't carry a JWT.
7. Platform decodes state, verifies HMAC + expiry, extracts `agent_id`. Exchanges code for tokens. POSTs to runtime's `credentials_ingest` IPC verb.
8. Runtime writes encrypted tokens scoped `(scope_kind=Agent, scope_id=<agent_id>, provider=<x>, name="oauth_token")`.
9. Browser redirects to agent settings with `?connected=google`. UI refetches status; renders the success state.

From this point on, tools that consume credentials by that scope key "just work" without further wiring.

## Component layout

| Surface | What |
|---|---|
| **aeqi (runtime)** | `credentials_ingest` IPC verb. HTTP surface `POST /api/integrations/credentials/ingest`. Writes to per-tenant credentials substrate. |
| **aeqi-platform** | `start` + `callback` + `status` routes per provider. State token mint/verify. Code-for-tokens exchange. |
| **aeqi/apps/ui** | "Connect Google" button on agent's Integrations tab. Redirects via `window.location.href = authorize_url`. |

The credentials substrate is provider-agnostic — one ingest verb covers them all.

## State token

HMAC-SHA256 over `agent_id || "|" || nonce || "|" || expires_at`, base64url-encoded. Default expiry 600s. The signing key is `AEQI_OAUTH_STATE_SECRET`. The callback verifies HMAC + expiration before persisting tokens.

This prevents:

- **CSRF** — callback can't be forged without the secret.
- **Replay** — nonce + expiration.
- **Cross-agent confusion** — state binds `agent_id`; callback can only persist tokens for that agent.

## Required env vars

`/etc/aeqi/secrets.env` on the platform host:

```
GOOGLE_CLIENT_ID=...        # GCP OAuth client (Web application type)
GOOGLE_CLIENT_SECRET=...
AEQI_OAUTH_STATE_SECRET=... # openssl rand -hex 32
```

When unset, routes return 503 `{error: "google_oauth_not_configured", setup_required: true}` — graceful degradation. Restart `aeqi-platform.service` after editing.

GCP redirect URI must match exactly: `https://app.aeqi.ai/api/integrations/google/callback` (no trailing slash).

## Existing tools that consume credentials

`crates/aeqi-pack-google-workspace/` consumes Google credentials by the scope key:

- `gmail.send`, `gmail.search`, `gmail.read`
- `calendar.find_busy`, `calendar.propose_slots`, `calendar.create_event`
- `meet.create`

Each tool calls `GoogleApiClient::for_agent(agent_id)`. The client looks up `(scope=Agent, agent_id, provider=google, name=oauth_token)`, refreshes on 401, and proxies the API call.

## Generalizing to other providers

The pattern (per-agent OAuth → HMAC state → callback exchange → IPC ingest → credentials substrate) generalizes. To add Slack, Notion, GitHub for an agent:

1. Add provider-specific scopes to the `start` route.
2. Add provider name to the callback exchange (`provider="slack"`).
3. The `credentials_ingest` IPC verb is provider-agnostic — same path.
4. Add a "Connect Slack" button on the same Integrations tab.

Don't fork the credentials substrate per-provider. The discriminator is the `provider` field.

## What about Service Accounts?

Service accounts work for **internal automation** — e.g., a single `aeqi-noreply@*.iam.gserviceaccount.com` that sends transactional email. They don't work for **customer orgs** because customers can't grant your service account domain-wide delegation in their Google Workspace.

Use Path B for anything customer-facing. Service accounts can coexist for internal-only paths.

## Related

- [Multi-scope integrations](/docs/patterns/multi-scope-integrations) — Entity > Role > Agent precedence when scopes overlap.
- [Agents](/docs/concepts/agents) — agents own credentials.
