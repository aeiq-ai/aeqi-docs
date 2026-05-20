# Authentication

aeqi has two distinct authentication surfaces:

| Surface | Token | Used by |
|---------|-------|---------|
| User session | JWT bearer | Dashboard, in-browser REST, normal `/api/*` calls |
| Programmatic | API keys (`ak_…` + `sk_…`) | MCP clients (Claude Code, Codex), automation scripts |

JWTs come from a login flow; API keys come from the dashboard.

## User Session (JWT)

The dashboard and most `/api/*` endpoints expect a JWT bearer token:

```
Authorization: Bearer <jwt>
```

The token is signed with the platform's `auth_secret`. Claims include `user_id`,
`email`, and standard `exp`/`iat`.

### Sign up

```
POST /api/auth/signup
```

```json
{
  "email": "you@example.com",
  "password": "...",
  "invite_code": "DOGFOOD-2026-XYZ"
}
```

Returns `{ ok: true, token: "<jwt>", pending_verification: true }`. The session is unverified until the 6-digit email code is consumed.

```
POST /api/auth/verify
```

```json
{ "email": "you@example.com", "code": "123456" }
```

Returns a fresh, verified JWT.

```
POST /api/auth/resend-code
```

Requests a new 6-digit code if the original was lost. Same rate-limited bucket as signup.

### Log in

Password:

```
POST /api/auth/login
POST /api/auth/login/email
```

```json
{ "email": "you@example.com", "password": "..." }
```

Returns `{ ok: true, token: "<jwt>" }`. The two routes share a handler; `/login/email` is the historical alias.

If the account has TOTP enabled, the initial response is `{ ok: true, totp_required: true, partial_token: "..." }`; finish with:

```
POST /api/auth/totp/login
```

```json
{ "partial_token": "...", "code": "123456" }
```

### Wallet (SIWE)

```
POST /api/auth/wallet/nonce
POST /api/auth/wallet/login
POST /api/auth/wallet/signup
```

`nonce` issues a per-address nonce; `login`/`signup` consume a SIWE message signed against that nonce and return a JWT.

### Passkey

```
POST /api/auth/passkey/login-begin
POST /api/auth/passkey/login-finish
POST /api/auth/passkey/register-begin
POST /api/auth/passkey/register-finish
```

WebAuthn ceremony; `finish` returns a JWT on success.

### Passwordless email

```
POST /api/auth/login/code/request
POST /api/auth/login/code/consume
POST /api/auth/login/magic/consume
```

A single login-codes row backs all three. Either the typed 6-digit code or the clicked magic link consumes it; consuming any path invalidates the row.

### Recovery and identity changes

```
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/me/email/change/begin
POST /api/me/email/change/finish
```

### Selecting a TRUST

After login, the JWT authenticates the user. When a request needs to target a
specific TRUST runtime — anything proxied through `/api/{*rest}` — the platform
reads `X-Trust`:

```
X-Trust: <trust_id>
```

The proxy also accepts `trust` or `trust_id` query parameters for browser flows
that cannot set headers easily. If no TRUST is supplied, proxied runtime calls
return `400`. Calls to non-tenant routes (`/api/keys`, `/api/billing/*`,
`/api/trusts`, etc.) do not need `X-Trust`.

### Token lifecycle

JWTs are bearer tokens. The active sessions list and revocation are:

```
GET  /api/auth/sessions
POST /api/auth/sessions/revoke
POST /api/auth/sessions/revoke-others
```

There is no refresh endpoint — log in again to mint a new token.

## Programmatic Access (API keys)

For MCP and automation. Two keys, each with a distinct role:

| Key | Prefix | Scope | Header |
|-----|--------|-------|--------|
| Secret key | `sk_…` | One Company | `Authorization: Bearer sk_…` |
| Account key | `ak_…` | Per user account | `X-Api-Key: ak_…` |

The secret key authenticates the call against a specific TRUST (`user_id` and
`trust_id` resolved from the key). The account key is optional but recommended
for MCP — when present, the platform asserts that the secret key belongs to the
same user, which guards against accidentally using a `sk_...` from a different
account.

**API keys require a `company` or `owner` placement tier.** Trial and free accounts cannot mint or use them; calls return `402 Payment Required` with `"MCP access requires a Company subscription"`.

### Create an account key

```
POST /api/account/api-key
```

Authenticated with JWT. Mints (or rotates) the user's `ak_…`. Response:

```json
{ "ok": true, "id": "...", "api_key": "ak_...", "rotated": false }
```

A user has at most one account key at a time; calling again returns the existing key with `rotated: true` and revokes the old value.

### Create a secret key

```
POST /api/keys
```

Authenticated with JWT. Body:

```json
{ "root": "<entity_name_or_id>", "name": "claude-code" }
```

Response:

```json
{ "ok": true, "id": "...", "secret_key": "sk_...", "note": "Save the secret_key — it won't be shown again." }
```

The plaintext is returned **only once**. Store it immediately.

### List and revoke

```
GET    /api/keys
DELETE /api/keys/{id}
```

`list` returns metadata only — name, id, masked prefix, created/last-used timestamps. `delete` revokes a key immediately.

### Use the keys

MCP client (Codex, Claude Code, etc.):

```bash
export AEQI_API_KEY=ak_...
export AEQI_SECRET_KEY=sk_...
export AEQI_PLATFORM_URL=https://app.aeqi.ai
```

`aeqi mcp` reads both and sets `Authorization: Bearer sk_…` plus
`X-Api-Key: ak_…` on every JSON-RPC call.

Direct MCP call:

```bash
curl https://app.aeqi.ai/api/mcp \
  -H "Authorization: Bearer sk_..." \
  -H "X-Api-Key: ak_..." \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Validate a key

```
POST /api/mcp/validate
```

Echoes back which user/entity a key resolves to. Use this from a CI smoke test to verify a deployed secret without firing a tool call.

### Rotation

1. `POST /api/keys` to mint a new secret with the same `root`.
2. Update your env or config.
3. `DELETE /api/keys/{old_id}`.

Account keys (`ak_…`) are identifiers — call `POST /api/account/api-key` to rotate; the old value stops working immediately.

## Headers Summary

| Header | Used by | When |
|--------|---------|------|
| `Authorization: Bearer <jwt>` | Dashboard, in-browser REST | After a login flow |
| `Authorization: Bearer sk_…` | MCP, automation | When calling on a Company's behalf |
| `X-Api-Key: ak_…` | MCP, automation | Optional — pairs sk_ with the account |
| `X-Trust: <trust_id>` | REST | Selects target TRUST for proxied calls |

`X-Company` is not used.

## Tiers

| Tier | Dashboard | MCP / API keys |
|------|-----------|----------------|
| Trial | Yes | No |
| Starter | Yes | No |
| Company | Yes | Yes |
| Owner | Yes | Yes |

See [Billing](/docs/platform/billing) for current pricing.

## Next Steps

- [REST API](/docs/api/rest) — endpoint reference
- [MCP](/reference/mcp) — tool catalog and JSON-RPC shape
- [Claude Code + aeqi](/docs/guides/claude-code) — IDE setup walkthrough
