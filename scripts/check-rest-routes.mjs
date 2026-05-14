#!/usr/bin/env node
// Drift guard: every route registered in aeqi-platform/src/server.rs or in
// selected aeqi-web/src/routes/*.rs files must be mentioned in docs/api or
// docs/reference. Catches route/schema drift the MCP guard cannot see — the
// 2026-05-13 audit found seven docs with stale or fictional routes that
// passed the existing check.
//
// Two sources are scanned today:
//
// 1. **Platform** — `../aeqi-platform/src/server.rs`. Every `.route("/api/…")`
//    is checked as a literal path string. The platform surface is the
//    user-facing control plane and is small enough to enumerate.
//
// 2. **Runtime web** — selected files under `../aeqi/crates/aeqi-web/src/routes/`.
//    Routes registered there are mounted at `.nest("/api", ...)` in
//    `aeqi-web/src/server.rs`, so the script prepends `/api` to each
//    discovered path. Today only `ideas.rs` is scanned (Wave 1 of the Ideas
//    primitive steward sweep, 2026-05-14). Other route files join as their
//    respective primitives' waves land.
//
// Run via `npm run check:rest-routes`. If either sibling repo is absent
// (e.g. CI without that repo cloned), the script skips cleanly — this is a
// local-dev guard, not a blocker for content-only pipelines.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

// Sources to scan. Each entry: { label, path, prefix }
// `prefix` is prepended to each extracted route — empty for sources that
// already include `/api/...` in their path strings (platform server.rs);
// `/api` for runtime web routes that get mounted at `.nest("/api", ...)`.
const sources = [
  {
    label: "platform",
    path: resolve(root, "../aeqi-platform/src/server.rs"),
    prefix: "",
  },
  {
    label: "runtime:ideas",
    path: resolve(root, "../aeqi/crates/aeqi-web/src/routes/ideas.rs"),
    prefix: "/api",
  },
];

// Routes registered by one of the sources but intentionally not in
// user-facing docs. Each entry must have a real reason.
const allowlist = new Set([
  // Catch-all proxy — described as a mechanism in docs/api/rest.md but the
  // literal `/api/{*rest}` string is implementation detail.
  "/api/{*rest}",
  // Internal reachability probe — short-circuits to 204 in the platform
  // and never reaches the runtime.
  "/api/inbox/__probe__/dismiss",
]);

const sourcesPresent = sources.filter((s) => existsSync(s.path));
const sourcesMissing = sources.filter((s) => !existsSync(s.path));

if (sourcesPresent.length === 0) {
  console.log(
    "REST routes drift check skipped — no source files present. " +
      `Tried: ${sources.map((s) => relative(root, s.path)).join(", ")}. ` +
      "Clone aeqi-platform and aeqi alongside aeqi-docs to enable this guard.",
  );
  process.exit(0);
}

// Match `.route("PATH", …)` — the only way routes are registered in axum
// router builders.
const routeRegex = /\.route\(\s*"([^"]+)"/g;

// Collect routes from every present source, prepending the source prefix.
const routesBySource = new Map();
const allRoutes = new Set();
for (const source of sourcesPresent) {
  const text = readFileSync(source.path, "utf8");
  const found = new Set();
  for (const match of text.matchAll(routeRegex)) {
    found.add(`${source.prefix}${match[1]}`);
  }
  routesBySource.set(source.label, found);
  for (const route of found) allRoutes.add(route);
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

if (missing.length || stale.length) {
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
  process.exit(1);
}

const summary = sourcesPresent
  .map((s) => `${s.label}=${routesBySource.get(s.label).size}`)
  .join(", ");
const skipped = sourcesMissing.length
  ? ` (skipped ${sourcesMissing.map((s) => s.label).join(", ")})`
  : "";
console.log(
  `REST routes drift check passed (${allRoutes.size} total routes: ${summary}; ` +
    `${allowlist.size} allow-listed, ${docFiles.length} docs scanned${skipped}).`,
);
