# Chat as default

Every conversation-primary surface in aeqi opens on the chat. The other things — settings, configuration, tools, integrations — live one click deeper, in a `/settings/` sub-surface. The rail is in settings, not next to the chat.

Locked v0.57.0 in the drilled-agent redesign (commit `e8305fc6`).

## The rule

A surface whose primary verb is "talk" defaults to its transcript.

| Surface | Default URL | Settings URL |
|---|---|---|
| Agent (drilled) | `/<scope>/agents/<id>/` | `/<scope>/agents/<id>/settings/` |
| Personal inbox | `/me/inbox` | `/me/settings` |
| Idea detail | `/ideas/<id>` | (no separate settings — the body is the thread) |
| Trust channels | `/trust/<address>/channels/<sid>` | `/trust/<address>/settings` |

The default surface ships header + chat. Settings ships header + rail + body. The two never overlap; you don't see the rail while you're typing, and you don't see the composer while you're flipping tools on and off.

## Why

Chat is what people **do** on these surfaces. Configuration is what people did **once**, weeks ago, when they hired the agent or wired the channel. Surface the doing; bury the meta.

The cost of one click for settings is zero — anyone editing tool permissions can wait a tap. The cost of one click for chat is enormous — every message you send pays it.

This matches the [inbox-is-the-chat](/docs/methodology/inbox-is-the-chat) lock from the other direction. That page says every conversational surface in aeqi is a session view. This page says every session view defaults to its session, not to its chrome.

## The pattern

A drilled-agent surface is the canonical reference.

**Default** (`/c/<entity>/agents/<id>/` or `.../inbox/<session>`):
- Header: back · agent name · `+ New session` · Settings link
- Body: full-width chat — `SessionsRail` on the left if the agent has multiple sessions, `SessionDetail` + `Composer` on the right
- No nav rail

**Settings** (`/c/<entity>/agents/<id>/settings/<tab>`):
- Header: back · agent name · breadcrumb (one level deeper)
- Left rail: Overview · Personality · Quests · Events · Ideas · Channels · Treasury · Tools · Integrations
- Body: the selected tab

The rail is the agent's full configuration surface. It is not removed; it is moved. The default URL stops being a tab tray and starts being a chat.

The same shape extends:

- **Idea detail** already shipped this way. The body **is** the thread; "settings" is degenerate because an Idea's properties are inline-editable in the header. Reference shape.
- **Personal inbox** and **Trust channels** follow when their settings sub-surfaces ship.
- **Future channel detail surfaces** (Telegram, Slack, email per-thread views) inherit the rule by default.

## Backward compatibility

Old `/<scope>/agents/<id>/<tab>` URLs replace-navigate to `/<scope>/agents/<id>/settings/<tab>` via a `RELOCATED_AGENT_TABS` map in the router. The SPA equivalent of a 308 — the bookmark survives, the URL upgrades silently, the user lands on the new shape.

When a future surface relocates its rail this way, mirror the pattern: a constant map, a router-level redirect, no broken links.

## What this is not

This is not "hide the configuration." Settings is one click away, linked from the surface header, discoverable. The point is the **default** — what a returning user sees when they type the URL or click the agent in the sidebar.

This is also not "every page is a chat." Surfaces whose primary verb is configuration (`/settings/*`, `/c/<entity>/governance`, billing) default to their config. The rule is asymmetric: chat-primary defaults to chat; config-primary defaults to config. Neither steals the other's default.

## Related

- [The inbox is the chat](/docs/methodology/inbox-is-the-chat) — sister methodology page; every conversation surface in aeqi is a session view, every session view defaults to its session.
- [Sessions](/docs/concepts/sessions) — the data primitive every chat-as-default surface renders.
- [Composition](/docs/methodology/composition) — the same minimalism applied to the substrate: one Composer, one rail, one detail view, composed five ways.
