# Multi-scope integrations

Credentials, tools, and integrations can be scoped at three levels: **Entity**, **Role**, or **Agent**. When an agent looks up a credential and multiple scopes match, the narrowest wins.

## The precedence chain

```
Entity > Role > Agent
broadest         narrowest
```

When an agent looks up a credential by `(provider, name)`, the runtime walks scopes in priority order:

1. Agent (`scope_kind=Agent`, `scope_id=<this_agent_id>`)
2. Role (`scope_kind=Role`, `scope_id=<role_id>` for each role this agent occupies)
3. Entity (`scope_kind=Entity`, `scope_id=<entity_id>`)

The first match wins. Narrowest beats broadest.

## When to use which scope

| Scope | Use for |
|---|---|
| **Agent** | Per-agent OAuth (Path B). The CEO Assistant's Gmail. The CTO's GitHub PAT. Default. |
| **Role** | Credentials tied to the seat, not the occupant. The CFO role's QuickBooks token; whoever holds the CFO seat inherits it. |
| **Entity** | Company-wide. The shared Stripe API key. The shared IPFS pin token. The Telegram bot token before it's bound to a single agent. |

## Examples

### Per-agent Gmail (most common)

```
credential {
  scope_kind: Agent,
  scope_id: <agent_id>,
  provider: google,
  name: oauth_token,
  data: <encrypted-token-bundle>
}
```

The agent's `gmail.send` tool calls `for_agent(agent_id)` and reads this row directly. Other agents in the same company stay disconnected.

### Role-scoped QuickBooks

```
credential {
  scope_kind: Role,
  scope_id: <CFO_role_id>,
  provider: quickbooks,
  name: oauth_token,
  data: ...
}
```

When the CFO seat turns over, the new occupant inherits the credential. No re-OAuth required (until token expires). When the seat goes vacant, the credential is still bound to the seat — picked up by the next occupant.

### Entity-shared Stripe

```
credential {
  scope_kind: Entity,
  scope_id: <entity_id>,
  provider: stripe,
  name: api_key,
  data: <encrypted-sk_live_...>
}
```

Any agent in the company can use the Stripe key. Useful for shared infrastructure (payments, infra).

## Lookup precedence in practice

Suppose the CEO Assistant agent occupies a `CEO Assistant` role in entity `e1`. The agent calls `gmail.send`. Lookup walks:

1. `(scope=Agent, agent_id=<EA agent>, provider=google)` → hit? Use this.
2. Else `(scope=Role, role_id=<CEO Assistant role>, provider=google)` → hit? Use this.
3. Else `(scope=Entity, entity_id=e1, provider=google)` → hit? Use this.
4. Else: 503 / "google_not_connected" error.

The narrowest match wins. An agent-scoped credential overrides a role-scoped one. A role-scoped one overrides an entity-scoped one.

## Override semantics

If you want the CEO Assistant to use a *different* Gmail account than its role's default:

1. Connect Google on the agent (Path B).
2. The agent-scoped row supersedes the role-scoped row, transparently.

To revert:

3. Delete the agent-scoped row.
4. Lookup falls back to the role-scoped row.

No code change. Just a precedence-driven swap.

## Auditability

Every lookup writes a system message into the agent's session: "tool gmail.send used credential (scope=Agent, agent_id=<x>, provider=google)". Auditors can see which credential a given action used, even when the source token was rotated.

## What this protects against

- **Cross-agent leakage.** Agent A's tokens never leak to Agent B unless the credential is intentionally entity-scoped.
- **Role turnover orphans.** Role-scoped credentials survive occupant changes.
- **Secret sprawl.** Entity-scoped credentials don't multiply per-agent — they're one row, used by many.

## Storage

Credentials live in the per-tenant runtime DB, encrypted at rest with a per-tenant KEK. The KEK itself is wrapped by a master KEK (HSM, KMS, or local Argon2id depending on deployment mode — see [Wallets & identity](/docs/concepts/wallets-and-identity)).

A credential row plaintext is never returned by the API; only the runtime can decrypt it inside the tool that uses it.

## Related

- [Per-agent OAuth (Path B)](/docs/patterns/oauth-path-b) — the agent-scope flow.
- [Roles](/docs/concepts/roles) — role-scope inheritance.
- [Wallets & identity](/docs/concepts/wallets-and-identity) — credentials substrate encryption.
