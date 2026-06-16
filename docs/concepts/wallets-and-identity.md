# Wallets & Identity

aeqi separates human identity from company authority.

Users authenticate to the platform. A Company holds company state and authority.
Agents act through roles inside a Company; they do not become free-floating
owners of authority.

## Identity layers

| Layer | What it means |
|---|---|
| User | The human account that signs in and receives role access. |
| Auth method | Email, OAuth, passkey, wallet sign-in, or another login door enabled by the deployment. |
| Wallet | A signer or address attached to a user, Company, role, or staged protocol module. |
| Role | The authority surface that decides what a human or agent may do. |
| Company | The programmable company context where runtime work, authority, governance, treasury, and ownership attach. The on-chain protocol layer backs the authority/treasury/ownership tier when a deployment exposes it. |

The important rule is that authentication is not authority by itself. Signing in
proves who the user is. Acting inside a Company still depends on role membership,
scope, and the permissions attached to that role.

## Current product surface

Hosted aeqi supports platform accounts, runtime identity, role-scoped access,
and staged wallet/protocol integration. Some deployments can provision wallets
or expose wallet sign-in, but the public product should be understood as:

1. A user signs in.
2. The user chooses or creates a Company.
3. The Company grants the user one or more roles.
4. Agents execute through roles and quests.
5. High-consequence actions are routed through explicit authority and approval
   paths instead of implicit agent autonomy.

Protocol-backed authority, treasury, governance, and ownership are Solana-first
directional modules. They should be treated as staged capabilities unless a
specific deployment exposes them.

## Custody states

Wallet custody is a property of a wallet, not a property of the whole account.
The product model allows three states:

| State | Meaning |
|---|---|
| Custodial | The runtime can help sign within the configured scope. |
| Co-custody | Signing requires both platform-side and user-side participation. |
| Self-custody | The user controls the signer; the runtime cannot sign alone. |

Do not infer legal, financial, or custody guarantees from the state name alone.
Concrete guarantees depend on the deployment, wallet type, signer policy,
recovery policy, and the protocol module in use.

## Agent authority

Agents do not get blanket wallet access. They act through roles and scoped
tools. A role can allow routine execution, ask a human for approval, or require a
governance action before the work can continue.

The desired pattern is:

```text
user identity
  -> role membership
  -> scoped agent execution
  -> explicit approval for high-consequence action
  -> protocol or runtime state change
```

This keeps the agent useful without making it the owner of company authority.

## Public safety notes

- aeqi is not legal, financial, tax, or custody advice.
- Public docs describe the product model, not a formal security audit.
- Wallet and protocol features may differ between hosted, private, and
  private deployments.
- Do not send funds or assign production authority to an on-chain protocol
  module until the deployment's signer, recovery, and governance behavior has
  been reviewed.

## Related

- [Company](/docs/concepts/company)
- [Roles](/docs/concepts/roles)
- [Agents](/docs/concepts/agents)
- [Transaction & governance](/docs/guides/transaction-governance)
