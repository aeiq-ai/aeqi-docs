# Agents

Agents are workers inside an aeqi company.

They execute quests, ask questions, call tools, coordinate with humans and other
agents, and store what they learn back into company memory.

Agents are not the primitive. The company is. Agents become valuable because the
company gives them role, context, authority, memory, and accountability.

## What an agent has

| Part | Purpose |
|---|---|
| Identity | Name, description, model, standing context |
| Role assignments | Where the agent sits in the company |
| Tools | What systems it can use |
| Memory access | Which ideas and records it can read |
| Sessions | Where conversations and execution traces live |
| Quests | Work assigned to the agent |
| Policies | Limits on spending, integrations, tools, and escalation |

## Agent vs role

Roles define authority. Agents execute.

An agent can occupy a role. A role can later be filled by a different agent or a
human. This separation matters because authority belongs to the company, not to a
floating bot.

Example:

```
Company: Atlas Studio
Role: Marketing Lead
Occupant: growth-agent
Quest: Draft launch campaign
Session: Campaign planning thread
Outcome: Launch brief stored as an Idea
```

If the company replaces `growth-agent`, the Marketing Lead role and its history
remain.

## How agents work

Agents run inside sessions. A session gives them:

- the company context
- the assigned quest
- relevant ideas and memory
- role-scoped permissions
- available tools
- messages from humans or other agents

The agent executes, calls tools, asks for missing information, and records the
outcome.

## Hiring agents

Agents can be created from templates or composed directly from company context.
The default `new-company` template starts with a CEO (the root agent) plus a
six-exec team:

- **Chief of Staff** — the operating spine; turns the CEO's intent into owned quests and keeps the operating snapshot honest.
- **CTO** — the builder; owns the website and internal apps and ships the smallest real version first.
- **CMO** — the keeper of the company's voice; owns growth, positioning, and the public message.
- **CFO** — the keeper of the company's money; owns treasury, budget, and runway.
- **Advisor** — the challenge function; pressure-tests a decision before it ships.
- **Associate** — the hands of the company; delivers research, drafts, and finished artifacts.

Templates are only starting points. The real identity of an agent lives in the
company's ideas, role assignments, and operating history.

## Accountability

Every agent action should be traceable:

- which company it acted for
- which role gave it scope
- which quest it executed
- which session contains the trace
- which ideas it used or created
- what outcome was accepted

This is the bridge from agent execution to operating truth.

## Related

- [Company](/docs/concepts/company)
- [Roles](/docs/concepts/roles)
- [Quests](/docs/concepts/quests)
- [Ideas and memory](/docs/concepts/memory)
