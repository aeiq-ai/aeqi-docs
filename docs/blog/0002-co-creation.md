# Co-creation

Most onboarding is a form. You type a name. You pick a plan. You stare at an empty dashboard. The product greets you with "let's get you started" and a checklist.

We hate that. So we ship something else.

When you spawn a Company in aeqi, the workspace doesn't appear empty. It appears **running**. Agents are already in motion: a CEO Assistant has opened a session and introduced itself. A CMO has drafted three initial campaigns and asked you to pick a tone. The CFO has scheduled a quarterly review and asked who else should be on it. There are open Quests with your name in the participant list. There are seeded Ideas explaining the company's mission.

Co-creation is the thesis. The blueprint doesn't spawn a static shell. It spawns a living workspace.

## What ships in a fresh Company

Pick a blueprint. Name your Company. Click Spawn. About 90 seconds later you have:

- **Roles seeded** — Director, CEO, CTO, plus per-blueprint operational seats.
- **Agents hired** — one per operational seat. Each comes with a charter Idea: who they are, what they're responsible for, what voice they use, what authorities they don't have.
- **Ideas seeded** — mission, values, default SOPs, regulatory tracker (when relevant). The reference shape: AEQI ships with 45 Ideas out of the gate.
- **Events scheduled** — daily standups, weekly reviews, monthly compliance checks, quarterly board prep. 28 in the AEQI reference. Paused by default; you flip them on as you need them.
- **Kickoff Quests open** — 3 to 5 work items per agent, ready to pick up. "Help me calibrate my voice." "Connect your shared mailbox." "Draft your first 30 days."
- **TRUST registered** — on-chain. Optional; you can defer if you want runtime-only.

The workspace is alive before you write the first message.

## Why this works

Three problems classic onboarding solves badly:

1. **Empty-state shock.** A blank dashboard is intimidating; users disengage.
2. **Configuration paralysis.** A 20-field setup form is friction.
3. **Flat learning curve.** Reading docs to discover features is slow.

Co-creation solves all three:

1. The workspace isn't empty — it's already running.
2. Configuration happens via conversation, not forms.
3. Discovery happens via interaction with agents that explain what they do.

## The interview

Some kickoff Quests aren't work the agent does for you — they're interviews the agent does *to* you. The CEO Assistant asks what tone the company writes in. The CMO asks what audience the brand speaks to. The CTO asks what tech stack the team prefers.

You answer in the session. The agent records your answers as Ideas. Subsequent agent runs read those Ideas as context.

You don't fill out a form to configure your company. The agents interview you.

## The recursion

Same shape, two levels:

- The product captures user thought via Quests and Ideas.
- The founder captures founder thought via the same loop applied to the operating model: backlog every direction, execute on what's actionable, surface the rest.

The thesis works both ways. The product captures user thought; the operating model captures founder thought.

## What stays human

- **Brand voice for marketing-facing surfaces.** Agents draft; founders decide.
- **Legal commitments.** Agreements don't get signed without human approval.
- **On-chain treasury moves above the session-key limits.** Sign-off goes through the role graph or governance.

Co-creation is the loop. Sign-off is the gate. Both stay distinct.

## What's shipping in the v0.41.0 release

- Blueprint-driven kickoff Quests with `@founder` mention as a default participant.
- Agent greeting messages on first session open.
- Charter Ideas seeded with `injection_mode=always` so agent voice is consistent from the first turn.
- A guided "first 24 hours" flow that walks the founder through the highest-leverage Quests first.

## How to use this

If you're spawning a Company today:

- Don't ignore the kickoff Quests. They're calibration, not chores.
- Answer the agents' questions concretely. The more specific the input, the better the expansion.
- Turn on the Events you want fired. Daily standups, weekly reviews — they're paused by default.

If you're building a blueprint:

- Seed identity in `injection_mode=always` Ideas.
- Open kickoff Quests that start interviews, not just tasks.
- Schedule cadences with `paused=true` — let the user opt in.
- Don't over-pre-fill. The point is the conversation that happens after spawn, not the static structure before it.

## Related reading

- [Co-creation methodology](/docs/methodology/co-creation)
- [Blueprint schema](/docs/reference/blueprint-schema)
- [Composition: same shape, repeated](/docs/methodology/composition)

The Company OS for the agent economy is here. Spawn one. Talk to it.
