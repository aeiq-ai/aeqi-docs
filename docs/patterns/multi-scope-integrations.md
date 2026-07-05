# Multi-scope integrations

Credentials, tools, and integrations are bound at one of several scopes: **Global**, **Company**, **Agent**, **User**, **Channel**, or **Installation**. When an agent looks up a credential and multiple scopes match, the narrowest wins.

## The precedence chain

Each credential need carries a scope hint, and the resolver walks a fallback ladder from narrowest to broadest. For the common case — a tool running as an agent — the walk is:

```
Agent > Company > Global
narrowest        broadest
```

1. Agent (`scope_kind=agent`, `scope_id=<this_agent_id>`)
2. Company (`scope_kind=company`, `scope_id=<company_id>`)
3. Global (`scope_kind=global`, workspace-wide)

The first match wins. Other hints walk their own ladders: user-scoped needs check User then Global; channel-scoped needs check only the Channel row; installation-scoped needs (e.g. a GitHub App) check Installation, then Agent, then Company.

One extra gate: a row whose granted-scopes metadata doesn't cover the need is *skipped*, not returned — the walk continues down the ladder, so a narrow token (say, a presentations-only OAuth grant) can't shadow a broader one.

## When to use which scope

| Scope | Use for |
|---|---|
| **Agent** | Per-agent OAuth (Path B). The CEO Assistant's Gmail. The CTO's GitHub PAT. Default for tools. |
| **Company** | Company-wide. The shared Stripe API key. Roles and agents in the Company share the connected account. |
| **Global** | Workspace-wide. Deployment-level defaults shared across every Company in the runtime. |
| **User** | Bound to a human user (multi-tenant deployments). |
| **Channel** | Bound to a transport channel — e.g. a WhatsApp session's pairing state. |
| **Installation** | Bound to a third-party installation — e.g. a GitHub App `installation_id`. |

Role-scoped credentials — a token tied to the seat, inherited by whoever occupies it — are a planned direction, not a shipped scope.

## Examples

### Per-agent Gmail (most common)

```
credential {
  scope_kind: agent,
  scope_id: <agent_id>,
  provider: google,
  name: oauth_token,
  data: <encrypted-token-bundle>
}
```

The agent's `gmail.send` tool resolves against this row directly. Other agents in the same company stay disconnected.

### Company-shared Stripe

```
credential {
  scope_kind: company,
  scope_id: <company_id>,
  provider: stripe,
  name: api_key,
  data: <encrypted-sk_live_...>
}
```

Any agent in the company can use the Stripe key. Useful for shared infrastructure (payments, infra).

## Lookup precedence in practice

Suppose the CEO Assistant agent in company `c1` calls `gmail.send`. Lookup walks:

1. `(scope=agent, scope_id=<EA agent>, provider=google)` → hit? Use this.
2. Else `(scope=company, scope_id=c1, provider=google)` → hit? Use this.
3. Else `(scope=global, provider=google)` → hit? Use this.
4. Else: a typed "not connected" error, so the surface can render a connect prompt instead of a failure.

The narrowest match wins. An agent-scoped credential overrides a company-scoped one; a company-scoped one overrides a global one.

## Override semantics

If you want the CEO Assistant to use a *different* Gmail account than the company default:

1. Connect Google on the agent (Path B).
2. The agent-scoped row supersedes the company-scoped row, transparently.

To revert:

3. Delete the agent-scoped row.
4. Lookup falls back to the company-scoped row.

No code change. Just a precedence-driven swap.

## What this protects against

- **Cross-agent leakage.** Agent A's tokens never leak to Agent B unless the credential is intentionally company-scoped.
- **Scope shadowing.** A narrow token can't silently answer a broader need — rows that don't cover the requested scopes are skipped and the walk continues.
- **Secret sprawl.** Company-scoped credentials don't multiply per-agent — they're one row, used by many.

## Storage

Credentials live in the per-tenant runtime DB, encrypted at rest with a per-tenant KEK. The KEK itself is wrapped by a master KEK (HSM, KMS, or local Argon2id depending on deployment mode — see [Wallets & identity](/docs/concepts/wallets-and-identity)).

A credential row plaintext is never returned by the API; only the runtime can decrypt it inside the tool that uses it.

## Related

- [Per-agent OAuth (Path B)](/docs/patterns/oauth-path-b) — the agent-scope flow.
- [Roles](/docs/concepts/roles) — the org-chart primitive.
- [Wallets & identity](/docs/concepts/wallets-and-identity) — credentials substrate encryption.
