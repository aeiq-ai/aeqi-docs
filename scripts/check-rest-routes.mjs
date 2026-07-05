#!/usr/bin/env node
// Drift guard, both directions:
//
// 1. **Source → docs** — every route registered in the scanned source files
//    must be mentioned in docs/api or docs/reference (or be on `allowlist`).
//    Catches route/schema drift the MCP guard cannot see — the 2026-05-13
//    audit found seven docs with stale or fictional routes that passed the
//    existing check.
// 2. **Docs → source** — every route path documented in docs/api or
//    docs/reference must exist in the scanned sources (or be on
//    `documentedAllowlist`). Catches fictional or retired routes surviving
//    in the docs.
//
// Two sources are scanned today:
//
// 1. **Platform** — `src/routes/router.rs` read via
//    `git -C ../aeqi-platform show origin/main:src/routes/router.rs`.
//    aeqi-platform is a bare repo whose on-disk ghost working tree is stale
//    (it drifted from origin/main by 2026-06-12) — NEVER read its files from
//    disk. Every `.route("/api/…")` is checked as a literal path string. The
//    platform surface is the user-facing control plane and is small enough
//    to enumerate.
//
// 2. **Runtime web** — selected files under `../aeqi/crates/aeqi-web/src/routes/`,
//    read from disk (the aeqi repo has a normal working tree). Routes
//    registered there are mounted at `.nest("/api", ...)` in
//    `aeqi-web/src/server.rs`, so the script prepends `/api` to each
//    discovered path. Today only `ideas.rs` is scanned (Wave 1 of the Ideas
//    primitive steward sweep, 2026-05-14). Other route files join as their
//    respective primitives' waves land.
//
// Run via `npm run check:rest-routes`. If a sibling repo (or the git ref) is
// absent (e.g. CI without that repo cloned), that source skips cleanly — this
// is a local-dev guard, not a blocker for content-only pipelines.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

// Sources to scan. Each entry: { label, kind, …, prefix }
// `prefix` is prepended to each extracted route — empty for sources that
// already include `/api/...` in their path strings (platform router.rs);
// `/api` for runtime web routes that get mounted at `.nest("/api", ...)`.
//
// kind "git" reads `ref:file` from the named repo via `git show` (required
// for aeqi-platform — bare repo, stale ghost working tree). kind "fs" reads
// a normal file from disk.
const sources = [
  {
    label: "platform",
    kind: "git",
    repo: resolve(root, "../aeqi-platform"),
    ref: "origin/main",
    file: "src/routes/router.rs",
    prefix: "",
  },
  {
    label: "runtime:ideas",
    kind: "fs",
    path: resolve(root, "../aeqi/crates/aeqi-web/src/routes/ideas.rs"),
    prefix: "/api",
  },
];

// Direction 1 allow-list: routes registered by one of the sources but
// intentionally not in user-facing docs. Each entry must have a real reason.
const allowlist = new Set([
  // Internal weekly-walk launcher. It is HMAC-gated and is not a public API
  // contract even though it is registered on the authenticated route tree.
  "/api/walks/launch",
  // UI reachability probe for inbox dismiss. It returns 204 and is deliberately
  // not a tenant/runtime API surface.
  "/api/inbox/__probe__/dismiss",
  // Machine-to-machine surface called by per-tenant runtimes with runtime
  // tokens, not by users or their MCP clients. Not a public API contract.
  "/api/runtime/heartbeat",
  "/api/runtime/reset",
  "/api/runtime/analytics-token",
  "/api/runtime/payments/create_payment_link",
  "/api/runtime/payments/create_product",
  "/api/runtime/telegram/deliver",
  // Operator-only admin routes behind require_admin; deliberately undocumented.
  "/api/admin/roots/{name}/custom-budget",
  "/api/admin/companies/{id}",
]);

// Direction 2 allow-list: route paths documented in docs/api or docs/reference
// that do not appear in the scanned sources but are legitimate. Each entry
// must have a real reason.
const documentedAllowlist = new Set([
  // Runtime web routes registered in aeqi-web route files this guard does not
  // scan yet (only ideas.rs is scanned): agents.rs, quests.rs, sessions.rs,
  // chat.rs. Real routes — drop these entries as their route files join the
  // `sources` list.
  "/api/agents",
  "/api/agents/spawn",
  "/api/quests",
  "/api/sessions",
  "/api/chat",
  // docs/api/rest.md generalizes the three concrete OAuth callback routes
  // (github/google/etsy) as one parameterized line.
  "/api/integrations/{provider}/callback",
  // docs/api/authentication.md's key-rotation walkthrough names the path
  // param {old_id} for narrative clarity; the registered route is
  // /api/keys/{id}, which is documented separately.
  "/api/keys/{old_id}",
]);

function readSource(source) {
  if (source.kind === "git") {
    if (!existsSync(source.repo)) return null;
    try {
      return execFileSync(
        "git",
        ["-C", source.repo, "show", `${source.ref}:${source.file}`],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      );
    } catch {
      // Repo present but ref/file unavailable (shallow clone, renamed file):
      // skip this source rather than fail a content-only pipeline.
      return null;
    }
  }
  if (!existsSync(source.path)) return null;
  return readFileSync(source.path, "utf8");
}

function describeSource(source) {
  return source.kind === "git"
    ? `${relative(root, source.repo)} @ ${source.ref}:${source.file}`
    : relative(root, source.path);
}

// Match `.route("PATH", …)` — the only way routes are registered in axum
// router builders.
const routeRegex = /\.route\(\s*"([^"]+)"/g;

// Collect routes from every readable source, prepending the source prefix.
const routesBySource = new Map();
const allRoutes = new Set();
const sourcesMissing = [];
for (const source of sources) {
  const text = readSource(source);
  if (text === null) {
    sourcesMissing.push(source);
    continue;
  }
  const found = new Set();
  for (const match of text.matchAll(routeRegex)) {
    found.add(`${source.prefix}${match[1]}`);
  }
  routesBySource.set(source.label, found);
  for (const route of found) allRoutes.add(route);
}

if (routesBySource.size === 0) {
  console.log(
    "REST routes drift check skipped — no source files readable. " +
      `Tried: ${sources.map(describeSource).join(", ")}. ` +
      "Clone aeqi-platform and aeqi alongside aeqi-docs to enable this guard.",
  );
  process.exit(0);
}

function listMarkdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      out.push(...listMarkdownFiles(path));
    } else if (entry.endsWith(".md")) {
      out.push(path);
    }
  }
  return out;
}

// Search across docs/api and docs/reference — these are where the platform
// surface is described. Concept docs are not the source of truth for routes.
const docFiles = [
  ...listMarkdownFiles(join(root, "docs", "api")),
  ...listMarkdownFiles(join(root, "docs", "reference")),
];
const docsBody = docFiles.map((f) => readFileSync(f, "utf8")).join("\n");

// ── Direction 1: every registered route is documented ──────────────────────

const missing = [];
for (const route of allRoutes) {
  if (allowlist.has(route)) continue;
  if (!docsBody.includes(route)) {
    missing.push(route);
  }
}

// Find allow-listed entries that are no longer registered — keeps the
// allow-list honest as routes are renamed or removed.
const stale = [];
for (const entry of allowlist) {
  if (!allRoutes.has(entry)) {
    stale.push(entry);
  }
}

// ── Direction 2: every documented route exists in source ───────────────────

// Extract route-shaped `/api/...` tokens from the docs. Segments are literal
// path pieces or axum-style params (`{id}`, `{*rest}`). A token immediately
// followed by `/` is a namespace/wildcard mention (`/api/billing/*`,
// `/api/admin/*`), not a route claim — skip it. This mirrors the literal
// matching direction 1 applies: documented paths must match the registered
// path strings exactly, param names included.
const docRouteRegex =
  /(?<![\w.\/-])\/api(?:\/(?:[A-Za-z0-9_.-]+|\{\*?[A-Za-z0-9_]+\}))+/g;

const documentedRoutes = new Map(); // route -> Set of doc files
for (const file of docFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(docRouteRegex)) {
    if (text[match.index + match[0].length] === "/") continue;
    if (!documentedRoutes.has(match[0])) {
      documentedRoutes.set(match[0], new Set());
    }
    documentedRoutes.get(match[0]).add(relative(root, file));
  }
}

const unknown = [];
for (const [route, files] of documentedRoutes.entries()) {
  if (documentedAllowlist.has(route)) continue;
  if (!allRoutes.has(route)) {
    unknown.push({ route, files: [...files].sort() });
  }
}

// Keep the reverse allow-list honest: an entry is stale if the route is no
// longer documented, or now exists in source (no longer an exception).
const staleDocumented = [];
for (const entry of documentedAllowlist) {
  if (!documentedRoutes.has(entry) || allRoutes.has(entry)) {
    staleDocumented.push(entry);
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

if (missing.length || stale.length || unknown.length || staleDocumented.length) {
  console.error("REST routes drift check failed:");
  if (missing.length) {
    console.error(
      `\n${missing.length} route(s) registered in source but not mentioned in docs/api or docs/reference:`,
    );
    for (const route of missing.sort()) {
      // Find which source registered it (for the error message).
      const owners = [];
      for (const [label, set] of routesBySource.entries()) {
        if (set.has(route)) owners.push(label);
      }
      console.error(`  - ${route}  (${owners.join(", ")})`);
    }
    console.error(
      "\nEither document the route in the appropriate api/reference doc, or " +
        "add it to the allowlist at the top of scripts/check-rest-routes.mjs with a reason.",
    );
  }
  if (stale.length) {
    console.error(
      `\n${stale.length} allowlist entr${stale.length === 1 ? "y is" : "ies are"} no longer registered in source:`,
    );
    for (const route of stale.sort()) {
      console.error(`  - ${route}`);
    }
    console.error("\nRemove the stale entr(y/ies) from the allowlist.");
  }
  if (unknown.length) {
    console.error(
      `\n${unknown.length} route(s) documented in docs/api or docs/reference but not registered in source:`,
    );
    for (const { route, files } of unknown.sort((a, b) =>
      a.route.localeCompare(b.route),
    )) {
      console.error(`  - ${route}  (${files.join(", ")})`);
    }
    console.error(
      "\nEither remove/correct the documented route, or add it to the " +
        "documentedAllowlist at the top of scripts/check-rest-routes.mjs with a reason.",
    );
  }
  if (staleDocumented.length) {
    console.error(
      `\n${staleDocumented.length} documentedAllowlist entr${staleDocumented.length === 1 ? "y is" : "ies are"} stale (no longer documented, or now registered in source):`,
    );
    for (const route of staleDocumented.sort()) {
      console.error(`  - ${route}`);
    }
    console.error("\nRemove the stale entr(y/ies) from the documentedAllowlist.");
  }
  process.exit(1);
}

const summary = [...routesBySource.entries()]
  .map(([label, set]) => `${label}=${set.size}`)
  .join(", ");
const skipped = sourcesMissing.length
  ? ` (skipped ${sourcesMissing.map((s) => s.label).join(", ")})`
  : "";
console.log(
  `REST routes drift check passed (${allRoutes.size} total routes: ${summary}; ` +
    `${allowlist.size} allow-listed, ${documentedRoutes.size} documented routes ` +
    `checked back against source, ${documentedAllowlist.size} doc-side allow-listed, ` +
    `${docFiles.length} docs scanned${skipped}).`,
);
