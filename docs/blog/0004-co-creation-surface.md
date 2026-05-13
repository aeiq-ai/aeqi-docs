# The co-creation surface lands

aeqi v0.41.0 ships the surface the rest of the product was waiting on.

For a year the thesis has been: *the goal is to capture the pure stream of thought from the user and execute upon it*. That sentence sat in a doc. The release that just shipped is the first one where the product feels like the sentence — where you can drop a thought into the workspace and the workspace turns it into work.

Five threads landed at once. Together they form what we've been calling the **co-creation surface**.

## BlockNote ideas

Ideas were a markdown textarea. That was honest, but it was thin — every Idea looked like a commit message instead of a document.

The Ideas tab now ships a real block editor (BlockNote). Headings, lists, code, tables, embeds, slash commands. The substrate stays the same — Ideas are still rows in `aeqi.db`, still tagged by `kind`, still composable with Quests — but the surface finally matches what an Idea is. A document. A spec. A draft. A page.

This was the last hold-out keeping the "everything is an Idea" thesis from feeling true to a new user. A CRM contact, a SOP, a meeting note, a roadmap entry — they all live in the same noun, but until v0.41.0 they all looked like commit messages.

## Slack-shaped channels

Channels (Telegram, WhatsApp, Slack, email) had a list view. They didn't have a conversation view. You could attach a Telegram bot to an agent, but you couldn't open the channel and *see* the back-and-forth from inside aeqi.

Now you can. The Channels rail tab gets a Slack-shaped surface: channel list on the left, message thread on the right, composer at the bottom, send/receive over the Session primitive. The bridge that always lived under the hood is now a first-class room.

This was a UX prerequisite for the next thing — agents you actually talk to, in surfaces you actually live in.

## Linear-shaped quests

Quests had a card. Now they have a page.

The Quest detail surface picks up the Linear shape: title at top, description in the body, status / priority / assignee on the right, S/P/A keyboard shortcuts to mutate them, comments and activity below. Same Session primitive driving the bottom half — agent state changes, tool calls, user comments, all in one stream — but rendered as a real working surface.

Quest is **WHAT**. The page now feels like work, not metadata.

## Personality as an Idea

The biggest shape change. An agent's personality used to live in a `system_prompt` field on the agent row. It worked, but it sat outside the substrate — you couldn't search it with Ideas search, you couldn't edit it in the block editor, you couldn't comment on it.

In v0.41.0 the system_prompt sunsets. Each agent's personality is an Idea tagged `personality:<agent_id>`, with `injection_mode=always`. The Personality tab on the agent rail is just the block editor pointed at that Idea.

This is the thesis applied to itself. Identity is content; content is an Idea; Ideas are the universal noun. The agent's voice now lives in the same surface as the agent's knowledge, and you edit both with the same tool.

## Inference accounting on every agent

You can now see what each agent costs. Per-agent token + cost accounting wired at the `agent-completed` emission point; rendered as a Lifetime Spend stat and a recent-calls table on each agent's Treasury tab. The agents list got a Spend column.

This is small in code and big in feel. An agent stops being a black box the moment you can see what it spent on what.

## The UX P0 sweep

Alongside the four named threads, a sweep of micro-fixes that the surface needed before the demo flow felt good: post-login lands on `/me/inbox` (not a 404), event and idea row clicks now navigate to the detail page (not a no-op), in-app `@`-mentions trigger agent spawn through the in-app channel (not just the Telegram-bridged one), the `/api/api/...` double-prefix bug is gone. None of these is a feature. Every one of them is friction the new surfaces couldn't carry.

## Why this release matters

The product had primitives. It had architecture. It had a thesis. What it didn't have, until now, was a **surface where the thesis is what you do**.

Drop a thought into Ideas — it's a real document. Open a channel — it's a real room. Open a Quest — it's a real working page. Talk to an agent — its voice lives in the same noun as its memory. Watch what it costs — every call shows up.

The point of programmable companies for the agent economy is not that agents exist. The point is that the founder's stream of thought becomes the company's execution loop, with no translation layer in between. v0.41.0 is the first release where the loop closes inside one product.

## What's next

The Architect agent. Wave 34 Phase 1 just landed: an `aeqi-architect` crate, a brief→blueprint IPC, a `/studio` page. Today the LLM is stubbed; the wire is real.

The shape: type a paragraph at `/studio` describing the company you want — the team, the voice, the cadences — and the architect drafts a stack blueprint, components, edges, and seed Ideas. You review, you spawn, you're running.

The co-creation surface is the workspace responding to your stream of thought. The Architect is the workspace responding to your stream of thought *before* the workspace exists. Same loop. Earlier turn.

That ships next.

## Related

- [Co-creation methodology](/docs/methodology/co-creation)
- [Everything is an Idea](/docs/blog/0003-everything-is-an-idea)
- [Sessions — the universal conversation primitive](/docs/concepts/sessions)
- [Inline mention spawn](/docs/patterns/inline-mention-spawn)
- [Personality as an Idea](/docs/patterns/personality-as-idea)
