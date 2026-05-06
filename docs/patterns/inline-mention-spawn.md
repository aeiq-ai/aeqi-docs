# Inline mention spawn

How `@`-mentions inside in-app channels turn into agent turns — and, when the mentioned name doesn't exist yet, into a fresh agent.

## The pattern

A user (or another agent) types `@<name>` inside a channel. The channel's bridge layer parses the mention before the message is appended to the session. Three branches:

| Mention resolves to | Action |
|---|---|
| An existing agent in the entity | Add agent as a session participant; fire its turn against the message. |
| An existing role in the entity | Route to whoever currently occupies the role; fire their turn. |
| **An unknown name** | If the channel is configured `on_mention: spawn_from_template:<slug>`, spawn a templated agent named `<name>`, attach to the session, fire the first turn. |

Branch 3 is what makes a channel feel alive: the team grows by being talked to.

## Configuration

```json
channel {
  agent_id: "<owning_agent_id>",
  kind: "in_app",
  on_mention: "spawn_from_template:generalist",
  config: {
    spawn_naming: "from_mention"
  }
}
```

`spawn_from_template:<slug>` resolves to a blueprint component. The component supplies the role, the charter Ideas, the model preference, and any seeded tools. The mention text supplies the name.

## Why parse before append

The mention has to be parsed *before* the inbound message hits the session, otherwise the session has a turn from a participant that doesn't exist yet. The flow is:

1. Inbound message arrives at the channel bridge.
2. Bridge parses `@`-mentions; resolves each one against the entity's agents and roles.
3. For unresolved mentions, bridge spawns the templated agent + creates the role binding + adds to session participants.
4. Message gets appended to the session with the mentioned agents already as participants.
5. Each mentioned agent's turn fires.

Steps 3 and 4 must complete before step 5 — otherwise the agent's first turn doesn't see itself in the participant list.

## In-app channels vs external channels

External channels (Telegram, WhatsApp, Slack) have always supported mention-routes-to-spawn — the existing `on_mention` config from [Mention-gating](/docs/patterns/mention-gating).

What v0.41.0 fixed: the **in-app** channel surface (the Slack-shaped Channels rail) now respects the same gate. Before, in-app `@`-mentions appended to the session but didn't fire a turn or spawn — the chat looked like it was working, but the agent was deaf. The bridge layer is now uniform across in-app and external channels.

## Why this matters

The fastest path from idea to running agent is one sentence with an `@` in it. No "create agent" form. No blueprint picker for incidental hires. You name the agent in the act of asking it to do something.

The opposite — making the user fill out a form before they can talk to a teammate — is the same friction every PM-led product loses to. aeqi declines.

## Related

- [Mention-gating](/docs/patterns/mention-gating) — Layer 1/2 model, BotFather privacy, allowlists.
- [Sessions](/docs/concepts/sessions) — what mentions mutate.
- [Roles](/docs/concepts/roles) — role-addressed routing.
