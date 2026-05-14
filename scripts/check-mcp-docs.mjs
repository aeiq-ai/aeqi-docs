import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const docsDir = join(root, "docs");

function listMarkdownFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listMarkdownFiles(path));
    } else if (entry.endsWith(".md")) {
      files.push(path);
    }
  }
  return files;
}

function lineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}

const failures = [];
const files = listMarkdownFiles(docsDir);

const bannedPatterns = [
  {
    pattern: /aeqi mcp serve/g,
    message: "use `aeqi mcp`; `serve` is not a current subcommand",
  },
  {
    pattern: /Hosted mode requires `AEQI_SECRET_KEY`;/g,
    message: "hosted MCP requires AEQI_SECRET_KEY, AEQI_API_KEY, and AEQI_PLATFORM_URL",
  },
  {
    pattern: /\|\s*`notes`\s*\|/g,
    message: "`notes` is not in the current hosted MCP catalog",
  },
  {
    pattern: /`aeqi_(projects|primer|prompts|status)`/g,
    message: "legacy discovery pseudo-tools are not in the current hosted MCP catalog",
  },
  {
    pattern: /\|\s*`agents`\s*\|\s*`hire`,\s*`retire`,\s*`list`,\s*`delegate`\s*\|/g,
    message: "agents catalog is stale; current actions are get, hire, retire, list, projects",
  },
];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const check of bannedPatterns) {
    for (const match of content.matchAll(check.pattern)) {
      failures.push({
        file,
        line: lineNumber(content, match.index ?? 0),
        message: check.message,
      });
    }
  }
}

function requireSnippet(file, snippet, message) {
  const content = readFileSync(join(root, file), "utf8");
  if (!content.includes(snippet)) {
    failures.push({ file: join(root, file), line: 1, message });
  }
}

const currentToolRows = [
  "| `me` | `profile`, `permissions` |",
  "| `ideas` | `store`, `search`, `update`, `delete`, `link`, `feedback`, `walk` |",
  "| `quests` | `create`, `list`, `show`, `update`, `close`, `cancel` |",
  "| `agents` | `get`, `hire`, `retire`, `list`, `projects` |",
  "| `events` | `create`, `list`, `enable`, `disable`, `delete`, `trigger`, `trace` |",
  "| `code` | `search`, `context`, `impact`, `diff_impact`, `file`, `file_summary`, `stats`, `index`, `incremental`, `synthesize` |",
];

for (const row of currentToolRows) {
  requireSnippet("docs/api/mcp.md", row, `MCP reference is missing current tool row: ${row}`);
  requireSnippet("docs/guides/claude-code.md", row, `Claude Code guide is missing current tool row: ${row}`);
}

const hostedConfigSnippets = [
  'args = ["mcp"]',
  'AEQI_SECRET_KEY = "sk_..."',
  'AEQI_API_KEY = "ak_..."',
  'AEQI_PLATFORM_URL = "https://app.aeqi.ai"',
];

for (const snippet of hostedConfigSnippets) {
  requireSnippet("docs/api/mcp.md", snippet, `Codex hosted config is missing ${snippet}`);
}

for (const snippet of ["`AEQI_SECRET_KEY`", "`AEQI_API_KEY`", "`AEQI_PLATFORM_URL`"]) {
  requireSnippet("docs/reference/cli.md", snippet, `CLI MCP reference is missing hosted requirement ${snippet}`);
}

const hostedEnvSnippets = [
  "export AEQI_API_KEY=ak_...",
  "export AEQI_SECRET_KEY=sk_...",
  "export AEQI_PLATFORM_URL=https://app.aeqi.ai",
];

for (const snippet of hostedEnvSnippets) {
  requireSnippet("docs/api/authentication.md", snippet, `Authentication MCP env example is missing ${snippet}`);
}

const claudeHostedSnippets = [
  '"AEQI_SECRET_KEY": "sk_..."',
  '"AEQI_API_KEY": "ak_..."',
  '"AEQI_PLATFORM_URL": "https://app.aeqi.ai"',
];

for (const snippet of claudeHostedSnippets) {
  requireSnippet("docs/guides/claude-code.md", snippet, `Claude Code hosted config is missing ${snippet}`);
}

requireSnippet(
  "docs/getting-started/quickstart.md",
  "[MCP Integration](/docs/api/mcp)",
  "Quickstart hosted IDE path should link to the client-neutral MCP guide",
);

if (failures.length > 0) {
  console.error("MCP docs drift check failed:");
  for (const failure of failures) {
    const file = relative(root, failure.file);
    console.error(`- ${file}:${failure.line} ${failure.message}`);
  }
  process.exit(1);
}

console.log(`MCP docs drift check passed (${files.length} markdown files scanned).`);
