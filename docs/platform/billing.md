# Billing

## Launch plans

The atomic billing unit is a **TRUST**: one programmable company with its own
runtime, agents, quests, sessions, memory, and capacity limits.

| Plan | Price | Best for |
|------|-------|----------|
| Standard | $49/month | Focused launches and early operating loops |
| Pro | $69 first month, then $149/month | Heavier agent work from day one |

Both plans include one TRUST, unlimited agents, managed hosting, API + MCP
access, and the company primitives needed to run work through roles, quests,
events, sessions, ideas, and memory.

## Capacity

| Plan | Monthly LLM tokens | Runtime |
|------|--------------------|---------|
| Standard | 5M tokens | 2 vCPU, 4 GB RAM, 40 GB storage |
| Pro | 20M tokens | 8 vCPU, 16 GB RAM, 160 GB storage |

The plan controls execution capacity. You can change capacity later as agent
volume, model choice, and long-running work increase.

## Multiple TRUSTs

Each launched TRUST chooses Standard or Pro independently. Joining a TRUST
owned by another user is free unless you launch your own paid TRUST.

## Inference usage

Included monthly LLM tokens cover normal hosted agent execution. Usage above the
included capacity may require a plan change, top-up, or your own provider key.

See [Inference API](/docs/api/inference) for programmatic inference behavior.

## Enterprise

Enterprise plans are available for dedicated infrastructure, SSO, SLAs, audit
logs, custom integrations, and higher capacity.

## See also

- [TRUST](/docs/concepts/trust) - the programmable company
- [Inference API](/docs/api/inference) - inference endpoints and limits
- [MCP](/reference/mcp) - exposing aeqi as tools to agent clients
