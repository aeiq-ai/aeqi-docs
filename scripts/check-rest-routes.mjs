#!/usr/bin/env node
// Drift guard: every aeqi-platform .route("…") must be mentioned in docs/api
// or docs/reference. Catches the class of drift the MCP guard cannot see —
// the 2026-05-13 audit found seven docs with stale or fictional routes that
// passed the existing check.
//
// Run via `npm run check:rest-routes`. Looks for the platform source at
// `../aeqi-platform/src/server.rs` (sibling repo on disk). If the sibling
// is not present (e.g. CI without that repo cloned), exits 0 with a skip
// notice — the check is a local-dev guard, not a blocker for content-only
// pipelines.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");
const platformServerRs = resolve(root, "../aeqi-platform/src/server.rs");

if (!existsSync(platformServerRs)) {
  console.log(
    `REST routes drift check skipped — ${relative(root, platformServerRs)} not present. ` +
      "Clone aeqi-platform alongside aeqi-docs to enable this guard.",
  );
  process.exit(0);
}

// Routes registered by aeqi-platform but intentionally not in user-facing docs.
// Each entry must have a real reason — proxy plumbing, internal probes, etc.
const allowlist = new Set([
  // Catch-all proxy — described as a mechanism in docs/api/rest.md but the
  // literal `/api/{*rest}` string is implementation detail.
  "/api/{*rest}",
  // Internal reachability probe — short-circuits to 204 in the platform
  // and never reaches the runtime.
  "/api/inbox/__probe__/dismiss",
]);

const serverSource = readFileSync(platformServerRs, "utf8");

// Match `.route("PATH", …)` — the only way routes are registered in server.rs.
const routeRegex = /\.route\(\s*"([^"]+)"/g;
const routes = new Set();
for (const match of serverSource.matchAll(routeRegex)) {
  routes.add(match[1]);
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
for (const route of routes) {
  if (allowlist.has(route)) continue;
  if (!docsBody.includes(route)) {
    missing.push(route);
  }
}

// Find allow-listed entries that are no longer registered — keeps the
// allow-list honest as routes are renamed or removed.
const stale = [];
for (const entry of allowlist) {
  if (!routes.has(entry)) {
    stale.push(entry);
  }
}

if (missing.length || stale.length) {
  console.error("REST routes drift check failed:");
  if (missing.length) {
    console.error(
      `\n${missing.length} route(s) registered in aeqi-platform/src/server.rs are not mentioned in docs/api or docs/reference:`,
    );
    for (const route of missing.sort()) {
      console.error(`  - ${route}`);
    }
    console.error(
      "\nEither document the route in the appropriate api/reference doc, or " +
        "add it to the allowlist at the top of scripts/check-rest-routes.mjs with a reason.",
    );
  }
  if (stale.length) {
    console.error(
      `\n${stale.length} allowlist entr${stale.length === 1 ? "y is" : "ies are"} no longer registered in server.rs:`,
    );
    for (const route of stale.sort()) {
      console.error(`  - ${route}`);
    }
    console.error("\nRemove the stale entr(y/ies) from the allowlist.");
  }
  process.exit(1);
}

console.log(
  `REST routes drift check passed (${routes.size} routes registered, ${allowlist.size} allow-listed, ${docFiles.length} docs scanned).`,
);
