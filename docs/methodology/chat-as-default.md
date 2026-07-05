# Chat as default

Every conversation-primary surface in aeqi opens on the chat. The other things — settings, configuration, tools, integrations — live one click deeper, or inline on the same page beneath the conversation. The chat leads; the chrome follows.

## The rule

A surface whose primary verb is "talk" defaults to its transcript.

| Surface | Default URL | Configuration |
|---|---|---|
| Agent (drilled) | `/company/<address-or-id>/agents/<id>` | Inline on the same agent detail page — persona, tools, model, all one scroll from the chat |
| Entity sessions | `/company/<address-or-id>/sessions` | Company settings at `/company/<address-or-id>/settings` |
| Idea detail | `/ideas/<id>` | (no separate settings — the body is the thread) |
| Gateways (Telegram, WhatsApp, …) | bridged sessions render in `/company/<address-or-id>/sessions` | The Apps register, filtered to gateways (`/company/<address-or-id>/apps?category=gateway`) |

The default surface leads with the chat. Configuration never interposes itself between the user and the composer; you don't wade through a tab tray to say something.

## Why

Chat is what people **do** on these surfaces. Configuration is what people did **once**, weeks ago, when they hired the agent or wired the channel. Surface the doing; bury the meta.

The cost of one click for settings is zero — anyone editing tool permissions can wait a tap. The cost of one click for chat is enormous — every message you send pays it.

This matches the [inbox-is-the-chat](/docs/methodology/inbox-is-the-chat) lock from the other direction. That page says every conversational surface in aeqi is a session view. This page says every session view defaults to its session, not to its chrome.

## The pattern

A drilled-agent surface is the canonical reference.

**Agent detail** (`/company/<address-or-id>/agents/<id>`):
- The chat leads. The agent's conversation is the first thing on the page.
- Configuration — persona, tools, model — lives on the same page, one scroll below. No tab tray, no separate settings rail. There used to be one; it collapsed into the detail page because a drilled agent doesn't need the whole app recreated under it.

The same shape extends:

- **Idea detail** already shipped this way. The body **is** the thread; "settings" is degenerate because an Idea's properties are inline-editable in the header. Reference shape.
- **Gateway-bridged sessions** (Telegram, WhatsApp, email per-thread views) inherit the rule by default — the bridged session renders like any other session; gateway configuration lives in the Apps register.

## Backward compatibility

Old `/<scope>/agents/<id>/<tab>` URLs — the retired per-agent tab tray (overview, quests, events, ideas, integrations) and the old settings sub-URLs — replace-navigate to the bare agent URL, the chat, via a `RELOCATED_AGENT_TABS` map in the router. The SPA equivalent of a 308 — the bookmark survives, the URL upgrades silently, the user lands on the new shape.

When a future surface relocates a rail this way, mirror the pattern: a constant map, a router-level redirect, no broken links.

## What this is not

This is not "hide the configuration." Settings is one click away, linked from the surface header, discoverable. The point is the **default** — what a returning user sees when they type the URL or click the agent in the sidebar.

This is also not "every page is a chat." Surfaces whose primary verb is configuration (`/company/<address-or-id>/settings`, `/account`, billing) default to their config. The rule is asymmetric: chat-primary defaults to chat; config-primary defaults to config. Neither steals the other's default.

## Related

- [The inbox is the chat](/docs/methodology/inbox-is-the-chat) — sister methodology page; every conversation surface in aeqi is a session view, every session view defaults to its session.
- [Sessions](/docs/concepts/sessions) — the data primitive every chat-as-default surface renders.
- [Composition](/docs/methodology/composition) — the same minimalism applied to the substrate: one Composer, one rail, one detail view, composed five ways.
