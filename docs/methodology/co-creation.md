# Co-creation

A blueprint doesn't spawn a static folder. It creates a living TRUST — agents already greeting you, kickoff Quests already open, Ideas already seeded. The workspace then *interviews* you to fill in the gaps.

This is the Co-creation thesis (the v0.41.0 release framing). Same shape both ways: the product captures user thought; the founder captures founder thought.

## The capture-and-expand loop

```
human direction → captured (Idea, message, Quest) → expanded (agent execution, draft, schedule) → output
                                                                ↑
                                                        agent asks for more context
                                                                ↓
                                                          human replies
```

The user provides direction; agents execute. The user doesn't have to specify every detail upfront — the agents will ask via Quests when they need to.

## What ships in a fresh workspace

When a blueprint is provisioned (single or stack), the workspace boots with:

| Artifact | Example |
|---|---|
| Roles seeded | Director, CEO, CTO, plus per-blueprint operational seats. |
| Agents hired | One agent per operational seat that requires runtime work. |
| Charters | An "always-on" Idea per agent describing its responsibility, voice, and boundaries. |
| Ideas | Mission, values, default SOPs, regulatory tracker (when applicable). |
| Events | Daily/weekly/monthly cadences, paused by default. |
| Kickoff Quests | One or two open Quests per agent: "Draft your first 30 days," "Connect your shared mailbox," etc. |
| TRUST | On-chain registration (when the user opts to register; can be deferred). |

The aeqi reference company ships with 7 agents, 11 roles, 45 ideas, 28 events, 3 open kickoff Quests. That's the reference shape.

## Agent-driven onboarding

When you land in the new workspace, the agents are already in motion:

1. Each agent has a session open with a greeting message.
2. The greeting introduces the agent: name, role, what they're responsible for, what they need from you to start work.
3. Some agents open a kickoff Quest with `@you` mentioned: "Help me calibrate my voice — what's the company's tone?"
4. As you reply, the agent records your answers as Ideas (with `kind:charter_input` or similar). Future sessions read those Ideas as context.

You don't fill out a form to configure your company. The agents interview you.

## When the founder is the bottleneck

The same loop applies in reverse — when the founder works with a senior agent:

- **Capture every direction.** Maintain a backlog that records every thing the founder mentions, even briefly, so nothing valuable is lost between sessions.
- **Execute on what's actionable now.** Multiple agents in parallel where work is disjoint. Sequence where dependencies exist.
- **Surface the rest cleanly.** Items not actionable now are queued with status (now / next / soon / later / future) and re-evaluated each cycle.
- **Don't ask permission for things in the canonical direction.** Owner-mode: decide and execute. Surface only the calls that genuinely need founder input.

This is the same shape as the product loop: capture stream of thought, expand into execution, ask back only when blocked. The product captures user thought; the operating model captures founder thought.

## Why this matters

Three problems classic onboarding solves badly:

1. **Empty-state shock.** A blank dashboard is intimidating; users disengage.
2. **Configuration paralysis.** A 20-field setup form is friction.
3. **Flat learning curve.** Reading docs to discover features is slow.

Co-creation solves all three:

1. The workspace isn't empty — it's already running.
2. Configuration happens via conversation, not forms.
3. Discovery happens via interaction with agents that explain what they do.

## What's NOT co-created

- **Brand voice** for marketing-facing surfaces (homepage, public posts) is the founder's call. Agents draft; founders decide.
- **Legal commitments.** Agreements don't get signed without human approval.
- **On-chain treasury moves above session-key limits.** Sign-off goes through the role graph or governance.

Co-creation is the loop. Sign-off is the gate. Both stay distinct.

## Related

- [Composition](/docs/methodology/composition) — the wrapper pattern that makes Quests interview tools.
- [Executive Assistant](/docs/patterns/executive-assistant) — the reference shared-EA shape.
- [Mission](/docs/mission) — the canonical thesis.
