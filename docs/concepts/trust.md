# Authority, treasury & ownership (protocol layer)

The user-facing object in aeqi is the [Company](/docs/concepts/company): roles,
agents, quests, ideas, events, sessions, and memory in one operating context.
This page is about the layer *underneath* a Company — the on-chain protocol
substrate that can bind a Company's authority, treasury, governance, and
ownership into enforceable state.

You don't create this layer directly. You create a Company. When a deployment
needs high-consequence actions to be programmable and enforceable — not just
recorded — the Company is backed by an on-chain trust/protocol vehicle that
carries that authority.

## What the protocol layer carries

| Layer | Purpose |
|---|---|
| Identity | Stable company identity for runtime and protocol state |
| Treasury | Assets, budgets, and spend policies |
| Roles | Authority graph for directors, operators, contributors, advisors |
| Governance | Proposals, approvals, timelocks, execution |
| Ownership | Tokens, vesting, contribution records, future cap-table logic |
| Agent authority | Scoped ability for agents to act under human-defined permissions |

This is not a separate object beside the Company. It is the vehicle that lets
the same Company express execution, authority, and ownership in one system.

## Why it exists

Agents can execute work, but execution alone does not solve institutional
coordination. A Company also needs answers to:

- who can authorize an action
- who controls the treasury
- how decisions are approved
- how roles change
- how contribution is recorded
- how ownership can reflect work

The protocol layer turns those questions into programmable company state.

## Runtime first, ownership in context

aeqi starts with the runtime because the runtime creates operating truth.

Ownership is a company primitive, not a mechanical reward emitted by work logs.
Without operating truth, ownership drifts back into a spreadsheet. With
operating truth, the company can reason about who acted, what changed, which
role approved it, and what outcome was accepted.

That is the bridge from agent execution to accountable governance and authority.

## Product vocabulary vs protocol vocabulary

Lead with the Company. A Company is first a hosted or private runtime: roles,
agents, quests, ideas, events, sessions, and memory in one operating context.
The on-chain trust/protocol layer is the lower-level term used where the system
needs a stable vehicle for authority, treasury, governance, ownership, signer
controls, and on-chain registration. New users should never have to meet it to
get value from the product.

When a page discusses custody, treasury, ownership, or on-chain authority, read
it as deployment-dependent unless it explicitly says the hosted product exposes
that module.

## What this layer is not

- **Not a chatbot feature.** It is programmable company state.
- **Not a DAO-first product.** Governance exists, but token voting is not the category.
- **Not a legal wrapper as the category.** Legal structure matters, but execution is the entry point.
- **Not the beginner product vocabulary.** New users think Company first; the
  protocol layer is for protocol, API, authority, and deployment-specific surfaces.
- **Not blanket custody.** Some deployments may provide runtime-assisted
  signing, but protocol authority is designed around scoped roles, explicit
  approvals, and signer controls rather than agents owning user keys.

## Solana direction

The current protocol direction is Solana-based: smart-account infrastructure,
role authority, treasury controls, and ownership primitives designed to make the
on-chain layer a programmable company rather than just an off-chain workspace.

Docs should treat legacy EVM/Base language as historical unless a page is
explicitly describing old code.

## Relationship to roles

Runtime roles are the operating org chart. The protocol layer carries the
authority tier that needs enforceability: directors, treasury control,
governance rights, ownership actions, and other high-consequence permissions.

Operational seats can stay runtime-only. Not every marketer, researcher, or
assistant needs on-chain authority.

## Relationship to agents

Agents act through roles. A role defines scope; an agent executes within that
scope. The protocol layer is what makes high-consequence actions explicit and
enforceable.

The long-term pattern:

```text
human direction
  -> role-scoped agent execution
  -> recorded work
  -> accountability
  -> governance, treasury, and ownership action
```

## Related

- [Company](/docs/concepts/company)
- [Roles](/docs/concepts/roles)
- [Agent runtime overview](/docs/concepts/agent-runtime-overview)
- [Transaction & governance](/docs/guides/transaction-governance)
