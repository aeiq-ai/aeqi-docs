# aeqi-docs

Markdown source for the public docs at `https://aeqi.ai/docs`.
Content-only repo. No build, no deploy script, no UI.

```
docs/
├── api/             # API reference
├── concepts/        # Mental model, primitives, vocabulary
├── getting-started/
├── guides/
├── platform/
└── self-hosting/
```

The `marked` dependency is for ad-hoc local rendering only. Production rendering is done by `aeqi-landing` at build time — it pulls this repo's contents and renders them through its own MDX/markdown pipeline.

## Convention

- Lowercase "aeqi" in prose at all times — never "AEQI".
- Title-case other product nouns: Blueprints, Economy, Agents, Quests, Ideas, Events.
- Don't say "prompts" — aeqi has four primitives (agents, ideas, quests, events).
- Code blocks use the right fences: `bash`, `rust`, `typescript`, `tsx`, `json`.

## Worktree workflow

**Never edit `main` directly.** Cut a worktree off `main`:

```bash
cd /home/claudedev/aeqi-docs
BR=docs-<topic-slug>
git worktree add /home/claudedev/aeqi-docs-$BR -b $BR origin/main
```

Always use `git -C <path>` for git ops in the worktree.

### Verify (before /ship)

```bash
git -C /home/claudedev/aeqi-docs-$BR diff --check    # no whitespace errors
```

That's the whole verify. Content-only — no build to fail.

### Ship

Use `/ship` — commits, pushes, merges to main, removes the worktree, deletes the branch, auto-invokes `/evolve`. **No deploy step**: `aeqi-landing`'s next build pulls the latest docs and renders them. If the docs change is urgent, ship it here, then trigger an `aeqi-landing` rebuild (a no-op landing commit + `/ship` from there does it).
