# Mention-gating

How channels (Telegram, WhatsApp, etc.) bridge to agent sessions without spamming. Two layers, kept distinct.

## The problem

A shared agent (e.g., an Executive Assistant) sits in a 5-person Telegram group. Without gating, it would respond to every message — incessantly, expensively, annoyingly.

But the agent should still **read** every message — that's how it builds context to answer when called.

## The two-layer model

| Layer | When it fires | Purpose |
|---|---|---|
| **Layer 1 — ingestion** | Every inbound message | Append to the bridged session's transcript. Always swallowed for context. |
| **Layer 2 — execution** | Only when the message mentions the bot, or comes from a DM | Fire an agent turn — the agent thinks and possibly replies. |

Layer 1 is silent. Layer 2 is the visible action.

## The gate condition

```
fire_turn = is_dm OR text.contains(@<bot_username>)
```

DMs always-act (no @-mention required). Group messages only act on @-mention.

The bot username is fetched at startup via `getMe`. The orchestrator branches on the gate condition before opening an agent turn.

## BotFather privacy mode

For Layer 1 to work — for the bot to **see** non-mention messages — BotFather privacy mode must be set to **Disabled**.

- Open BotFather.
- `/mybots` → select bot → Bot Settings → Group Privacy → **Disable**.
- Re-add the bot to existing groups; privacy is set at join-time per group, so existing memberships still have privacy on.

Without this flip:

- Layer 1 silently skips most messages — context disappears.
- Layer 2 still works for explicit @-mentions, but the bot's replies will sound contextless because Layer 1 didn't capture surrounding history.

## Allowlisting groups

A channel attached to an agent has an allowed-chat list. Only messages from listed `chat_id`s are bridged. Random groups can't piggy-back on your bot.

```
channel {
  agent_id, kind: 'telegram',
  allowed_chats: [-5133857242],   ← allowlist
  bot_token: <encrypted>
}
```

If a chat isn't in `allowed_chats`, both layers skip it — neither ingest nor execute.

## Generalization

The same gate applies to any channel:

| Channel | Always-act condition | Mention condition |
|---|---|---|
| Telegram (group) | `chat.type=='private'` (DM) | `text.contains('@<bot_username>')` |
| WhatsApp | DM | `text.contains('@<bot_phone_or_alias>')` |
| Discord | DM | `text.contains('<@<bot_id>>')` |
| Email | reply on a thread the bot started | `to: <bot_email>` |
| Slack | DM | `text.contains('<@<bot_id>>')` |

Layer 1 is always on for everything. Layer 2 fires per channel-specific gate.

## Mention-routes-to-spawn

A channel can also be configured so a mention spawns a **new agent** rather than firing a turn on the existing one. Use case: a generic "@aeiq help" pattern that creates a fresh agent for the asker.

Configuration:

```
channel {
  ...,
  on_mention: 'spawn_from_template:<template_slug>'
}
```

The orchestrator spawns the templated agent, opens a session bridged to the same channel, and dispatches the inbound message as the first turn.

## Why this isn't just rate-limiting

Rate-limiting reduces volume but doesn't reduce *unwanted volume*. Mention-gating reduces unwanted volume specifically — the bot stays silent unless it's invited.

Rate-limiting still applies on top (bounded LLM cost, debounce within a single thread), but it's a different concern.

## Related

- [Sessions](/docs/concepts/sessions) — channels bridge to sessions.
- [Executive Assistant](/docs/patterns/executive-assistant) — the canonical use case.
- [Agent collaboration](/docs/methodology/agent-collaboration) — how agents talk.
