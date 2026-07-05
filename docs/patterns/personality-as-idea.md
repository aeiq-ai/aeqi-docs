# Personality as an Idea

How an agent's voice, charter, and standing instructions live in the universal data noun rather than as a special field on the agent row.

## The shape

Each agent has a persona Idea tagged `personality:<agent_id>`. That Idea's `content` is the agent's system-level identity — who it is, what voice it uses, what it cares about, what it doesn't.

The persona editor on the agent detail page is the block editor pointed at this Idea. Edit the document; the agent's identity changes from the next session onward.

```
idea {
  name: 'Persona — <agent name>',
  content: '<markdown body>',
  tags: ['personality:<agent_id>', ...],
  agent_id: <agent_id>
}
```

The agent row does not carry a `system_prompt`. Identity is content, and content lives in Ideas.

## Why move it out of the agent row

Three reasons.

**Substrate parity.** Agent identity is content. Treating it as a special column meant it was outside Ideas search, outside the block editor, outside the comment surface. Moving it to an Idea makes identity searchable, editable, and discussable like every other piece of knowledge.

**Composition.** An agent can have multiple identity Ideas — a base persona, a project-specific charter, a temporary instruction set. All are Ideas the agent's session-start assembly loads. The runtime concatenates them when a session opens. Adding a new layer is just adding a new Idea.

**No "prompts."** aeqi has company primitives, not prompts. Calling identity a "system prompt" stuck it in a vocabulary the rest of the product had moved past. As an Idea, it speaks the language of every other surface.

## Activation

Ideas are inert until an event assembles them — there is no per-idea injection flag. When a persona Idea is written, the runtime pairs it with a `session:start` event subscribed by the agent. At session open, the assembly layer finds the agent's subscribed events matching `session:start`, runs each event's assembly tool calls (e.g. `ideas.assemble` over the `personality:<agent_id>` tag), and appends the produced content to the agent's context.

Same machinery as any other always-loaded knowledge: the event says *when*, the tags say *what*, the assembly produces the context. Tool restrictions declared on the assembled Ideas merge across the set — intersection of allows, union of denies.

## Editing

The persona editor on the agent detail page is the block editor pointed at the Idea. Save; the next session picks up the new content. No restart, no re-spawn, no migration.

If you delete the Idea, the agent's identity falls back to its blueprint default at the next session — the agent doesn't break, it just speaks generically.

## What about charter Ideas?

A charter Idea (organizational scope: "Director of Marketing reports to the CEO and owns brand voice and the campaign calendar") is a separate Idea, often role-scoped rather than agent-scoped. Personality is the persona; charter is the responsibilities. Both load through the same session-start assembly; both live in the same substrate.

The pattern generalizes: anything that should always be in the agent's head is just an Idea wired to a session-start event. The persona editor is one well-known surface for one well-known kind.

## Related

- [Ideas](/docs/concepts/ideas) — activation, scope, kind.
- [Memory (Ideas)](/docs/concepts/memory) — search and ranking surface.
- [Agents](/docs/concepts/agents) — runtime workers; their identity lives here.
- [Events](/docs/concepts/events) — the activation trigger.
