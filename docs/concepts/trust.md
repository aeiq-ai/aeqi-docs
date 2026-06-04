# TRUST

TRUST is the lower-level runtime/protocol vehicle behind an aeqi Company.

The entry point is execution: humans set direction, agents execute, and
memory compounds. A TRUST is where that execution, memory, authority, treasury,
governance, and ownership live together.

## What a TRUST contains

| Layer | Purpose |
|---|---|
| Identity | Stable company identity for runtime and protocol state |
| Treasury | Assets, budgets, and spend policies |
| Roles | Authority graph for directors, operators, contributors, advisors |
| Governance | Proposals, approvals, timelocks, execution |
| Ownership | Tokens, vesting, contribution records, future cap-table logic |
| Agent authority | Scoped ability for agents to act under human-defined permissions |

TRUST is not a separate object beside the company. In aeqi, the TRUST is the
vehicle that can bind Company execution, authority, and ownership into the same
system.

## Why it exists

Agents can execute work, but execution alone does not solve institutional
coordination. Companies also need:

- who can authorize action
- who controls treasury
- how decisions are approved
- how roles change
- how contribution is recorded
- how ownership can reflect work

The TRUST turns those questions into programmable company state.

## Runtime first, ownership in context

aeqi starts with the runtime because the runtime creates operating truth.

Ownership is a company primitive, not a mechanical reward emitted by work logs.
Without operating truth, ownership drifts back into a spreadsheet. With
operating truth, the company can reason about who acted, what changed, which
role approved it, and what outcome was accepted.

That is the bridge from agent execution to accountable governance and authority.

## Current product vs protocol direction

Today, the user-facing product language is Company. A Company is first a hosted
or private runtime: roles, agents, quests, ideas, events, sessions, and
memory in one operating context. TRUST is the lower-level runtime/protocol term
used where the system needs a stable vehicle for authority, treasury,
governance, ownership, signer controls, and on-chain registration.

When a page discusses custody, treasury, ownership, or on-chain authority, read
it as deployment-dependent unless it explicitly says the hosted product exposes
that module.

## TRUST is not

- **Not a chatbot feature.** It is the programmable company.
- **Not a DAO-first product.** Governance exists, but token voting is not the category.
- **Not a legal wrapper as the category.** Legal structure matters, but execution is the entry point.
- **Not the beginner product vocabulary.** New users should think Company first.
  TRUST is for protocol, API, authority, and deployment-specific surfaces.
- **Not blanket custody.** Some deployments may provide runtime-assisted
  signing, but TRUST authority is designed around scoped roles, explicit
  approvals, and signer controls rather than agents owning user keys.

## Solana direction

The current protocol direction is Solana-based: smart-account infrastructure,
role authority, treasury controls, and ownership primitives designed to make the
TRUST a programmable company, not just an off-chain workspace.

Docs should treat legacy EVM/Base language as historical unless a page is
explicitly describing old code.

## Relationship to roles

Runtime roles are the operating org chart. TRUST carries the authority tier that
needs enforceability: directors, treasury control, governance rights, ownership
actions, and other high-consequence permissions.

Operational seats can remain runtime-only. Not every marketer, researcher, or
assistant needs on-chain authority.

## Relationship to agents

Agents act through roles. A role defines scope; an agent executes within that
scope. TRUST is what makes high-consequence actions explicit and enforceable.

The long-term pattern:

```
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
