# Personality as an Idea

How an agent's voice, charter, and standing instructions live in the universal data noun rather than as a special field on the agent row.

## The shape

Each agent has a single Idea tagged `personality:<agent_id>` with `injection_mode=always`. That Idea's `content` is the agent's system-level identity — who it is, what voice it uses, what it cares about, what it doesn't.

The Personality tab on the agent rail is the block editor pointed at this Idea. Edit the document; the agent's identity changes from the next turn forward.

```
ideas {
  id, entity_id, kind: 'personality',
  name: 'Personality — <agent name>',
  content: '<markdown body>',
  tags: ['personality:<agent_id>'],
  injection_mode: 'always',
  scope: 'entity'   -- one agent, this agent
}
```

The agent row no longer carries `system_prompt`. Sunset in v0.41.0.

## Why move it out of the agent row

Three reasons.

**Substrate parity.** Agent identity is content. Treating it as a special column meant it was outside Ideas search, outside the block editor, outside the comment surface. Moving it to an Idea makes identity searchable, editable, and discussable like every other piece of knowledge.

**Composition.** An agent can have multiple identity Ideas — a base persona, a project-specific charter, a temporary instruction set. All live as `injection_mode=always` Ideas tagged for the agent. The runtime concatenates them at session-open. Adding a new layer is just adding a new Idea.

**No "prompts."** aeqi has four primitives, not prompts. Calling identity a "system prompt" stuck it in a vocabulary the rest of the product had moved past. As an Idea, it speaks the language of every other surface.

## Activation

The runtime resolves identity at session-open by querying:

```sql
SELECT content FROM ideas
WHERE entity_id = ?
  AND injection_mode = 'always'
  AND (
    scope = 'system'
    OR (scope = 'entity' AND tags LIKE '%personality:<agent_id>%')
    OR (scope = 'entity' AND author_id = <agent_id>)
  )
ORDER BY created_at;
```

Concatenate the contents into the agent's identity context. Standard `injection_mode=always` semantics — same path used for any other always-loaded knowledge.

## Editing

The Personality tab is BlockNote pointed at the Idea. Save is debounced; the next agent turn picks up the new content. No restart, no spawn, no migration.

If you delete the Idea, the agent's identity falls back to its blueprint default at next turn — the agent doesn't break, it just speaks generically.

## What about charter Ideas?

A charter Idea (organizational scope: "Director of Marketing reports to the CEO and owns brand voice and the campaign calendar") is a separate Idea, often role-scoped rather than agent-scoped. Personality is the persona; charter is the responsibilities. Both load via `injection_mode=always`; both live in the same substrate.

The pattern generalizes: anything that should always be in the agent's head is just an Idea with `injection_mode=always`. The Personality tab is one well-known surface for one well-known kind.

## Related

- [Ideas](/docs/concepts/ideas) — activation modes, scope, kind.
- [Memory (Ideas)](/docs/concepts/memory) — search and ranking surface.
- [Agents](/docs/concepts/agents) — runtime workers; their identity lives here.
