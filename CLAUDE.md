# aeqi-docs

Markdown source for the public docs at `https://aeqi.ai/docs`.
Content-only repo. No build, no deploy script, no UI.

```
docs/
├── api/             # API reference (REST, MCP, auth, inference)
├── architecture/    # System architecture and canonical templates
├── blog/            # Dated release notes / public posts
├── concepts/        # Mental model, primitives, vocabulary
├── getting-started/ # First-run walkthroughs
├── guides/          # Task-oriented how-tos
├── methodology/     # How aeqi thinks: org architecture, co-creation, composition
├── patterns/        # Engineering patterns behind shipped features
├── reference/       # Schemas, CLI, IPC reference
├── platform/        # Hosted-platform docs (billing is wired)
└── self-hosting/    # Still empty — landing serves placeholders
```

The `marked` dependency is for ad-hoc local rendering only. Production rendering is done by `aeqi-landing` at build time — it pulls this repo's contents and renders them through its own MDX/markdown pipeline.

## Convention

- Lowercase "aeqi" in prose at all times — never "AEQI".
- Title-case other product nouns: Blueprints, Economy, Agents, Quests, Ideas, Events.
- Don't say "prompts" — aeqi has four primitives (agents, ideas, quests, events).
- Code blocks use the right fences: `bash`, `rust`, `typescript`, `tsx`, `json`.

## Stub sections

`platform/` has `billing.md` wired; only `self-hosting/` is still empty (the landing serves placeholders for it). Before adding content there, check `docs/index.md` — every file in those directories must be wired into the index. If a directory has no content yet, leave it empty (git ignores empty dirs); do NOT add placeholder `.gitkeep` or `_index.md` files.

## Landing renders only what it routes

aeqi-landing renders docs through **explicit `<Route>` declarations** in `aeqi-landing/src/docs/Docs.tsx` — NOT a generic markdown crawler. A new markdown file in this repo is invisible to users until a paired `<Route path="..." element={<MD file="..." />} />` lands in `Docs.tsx`.

When a docs ship adds new files — in any of the established directories (`methodology/`, `patterns/`, `reference/`, `blog/`, …) or a genuinely new one:

1. Land the markdown here (`/ship` in aeqi-docs).
2. Cut a worktree on aeqi-landing. Add a `<Route>` per new file in `aeqi-landing/src/docs/Docs.tsx`.
3. `/ship` from aeqi-landing — its build pulls the latest aeqi-docs and bundles the new content with the new routes.

Until step 2 ships, the markdown lands in main (durable) but `https://aeqi.ai/docs/<new-path>` 404s. Don't claim "shipped to users" without the landing-side wire.

## Gap-scanning convention

When a subagent scans for doc gaps, the canonical checklist is:

1. Is there a `concepts/<primitive>.md` for each of the four primitives (Agents, Events, Quests, Ideas), and is `concepts/company.md` current for the Company?
2. Is `platform/billing.md` current with the latest pricing model?
3. Are `platform/` and `self-hosting/` still intentionally empty, or do shipped features now warrant content?
4. Does `docs/index.md` link every file that exists in `docs/**/*.md`?

`docs/index.md` is not rendered; treat it as the repo's nav manifest.

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
git -C /home/claudedev/aeqi-docs-$BR diff --check       # no whitespace errors
cd /home/claudedev/aeqi-docs-$BR && npm run check       # MCP catalog + REST routes
```

`npm run check` runs both drift guards:

- `check:mcp-docs` — stale MCP tool catalogs, wrong `aeqi mcp` command forms,
  and hosted Codex/Claude config snippets drifting away from the current MCP
  setup.
- `check:rest-routes` — two directions. Every `.route("…")` registered in the
  platform router (read via `git -C ../aeqi-platform show
  origin/main:src/routes/router.rs` — aeqi-platform is a bare repo whose
  on-disk tree is stale; never read it from disk) or in the scanned
  `aeqi-web` route files must be mentioned in `docs/api` or `docs/reference`,
  and every route path documented there must exist in source. Each direction
  has its own allow-list at the top of `scripts/check-rest-routes.mjs`. The
  guard auto-skips a source if the sibling repo (or the git ref) is absent
  (CI without the peer repos cloned).

Note: `docs/index.md` is an in-repo nav manifest — the rendered `/docs` index
is aeqi-landing's `DocsHome.tsx`, so index changes need a landing-side check.

Content-only repo — no build to fail. Run individual checks (`npm run
check:mcp-docs` or `npm run check:rest-routes`) when narrowing the surface
under review.

### Ship

Use `/ship` — commits, pushes, merges to main, removes the worktree, deletes the branch, auto-invokes `/evolve`. **No deploy step**: `aeqi-landing`'s next build pulls the latest docs and renders them. If the docs change is urgent, ship it here, then trigger an `aeqi-landing` rebuild (a no-op landing commit + `/ship` from there does it).
