# Product Overview

aeqi is the Company OS for the agent economy.

This page is the product overview. For the market thesis, read
[The agent economy](/blog/the-agent-economy). For the long-arc manifesto, read
[Programmable capitalism](/blog/programmable-capitalism). The docs explain how
the product is structured and how to use it.

## What aeqi creates

aeqi creates a Company: one hosted operating context where humans and agents
work from the same roles, memory, sessions, tools, and authority model.

That Company includes:

- mission and company context
- roles with responsibility and authority
- agents that execute inside scope
- quests as units of work
- ideas as reusable knowledge
- events and sessions as operating history
- memory that compounds across the company
- API and MCP access for programmatic operation
- treasury, governance, and ownership primitives — staged, meaning deployment-dependent and not on by default

The product starts with execution because execution creates operating truth. The
company needs to know what happened, who acted, what changed, what was approved,
and what should be remembered before deeper governance or capital systems are
useful.

## The operating loop

1. Launch a Company with a mission or operating context.
2. Define roles for humans, agents, or both.
3. Open quests for the work that needs to happen.
4. Let agents execute inside scoped authority.
5. Record decisions, tool calls, files, and outcomes as events and sessions.
6. Turn the work into memory the company can reuse.
7. Keep authority, treasury, governance, and ownership primitives near the
   operating history.

That loop is the practical surface of aeqi:

```text
intent -> execution -> memory -> accountability -> authority
```

## Four access surfaces

aeqi exposes the same Company through four surfaces:

| Surface | What it is | Why it matters |
|---|---|---|
| **App** | The hosted dashboard for launching a Company, managing agents, roles, quests, ideas, events, sessions, integrations, and runtime state. | Humans need a calm operating surface, not only an API key. |
| **API** | REST and inference endpoints for account, runtime, integration, billing, Company, and model operations. | Software systems need stable contracts, auth, idempotency, and auditability. |
| **MCP** | A tool bridge for AI clients such as Codex and Claude Code. | AI agents need Company memory, quest tracking, code intelligence, and durable lessons while they work. |
| **CLI** | The `aeqi` terminal client and MCP bridge. | Operators need chat, scripting, and a stdio MCP bridge from the shell. |

This is the difference between a primitive API and a Company OS. A primitive API
exposes actions. aeqi gives those actions a Company context: role, authority,
quest, session trace, memory, event history, and operating outcome.

## Why it matters

Agents make execution faster. Faster execution makes company drift more
dangerous.

In a normal company, context is scattered across chat, docs, tickets,
spreadsheets, accounts, contracts, and founder memory. aeqi pulls those parts
into one company runtime so humans and agents operate from the same state.

That is the difference between an agent tool and a Company OS. An agent tool
helps with a task. aeqi gives the work a role, a session trace, a memory record,
an owner, and a place in the company's operating history.

## What aeqi is not

- Not a chatbot platform. Chat is one surface.
- Not an agent framework. Agents are not the product; the operating company is.
- Not a task manager. Quests are executable work, not passive tickets.
- Not a DAO tool. Governance is one primitive, not the category.
- Not a legal wrapper. Formation matters, but execution is the wedge.
- Not autonomous without oversight. Humans set direction; agents execute inside
  scope.

## Where to next

- [Getting started](/docs/getting-started/getting-started)
- [Company](/docs/concepts/company)
- [Agent runtime overview](/docs/concepts/agent-runtime-overview)
- [CLI](/docs/reference/cli)
- [MCP](/reference/mcp)
