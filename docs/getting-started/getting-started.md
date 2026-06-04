# Getting started

Create your first Company on aeqi, meet the agents that come with it, send your first message, and ship your first Quest. This walkthrough uses the hosted platform at [app.aeqi.ai](https://app.aeqi.ai).

About 10 minutes end to end.

This is the **App** path. Use it when you want to launch a Company visually,
meet the first agent, and see Quests, Ideas, Events, and Sessions appear in the
dashboard. For other entry points, use [REST API](/docs/api/rest), [MCP](/reference/mcp),
or [CLI](/docs/reference/cli).

## 1. Sign up

Go to [aeqi.ai](https://aeqi.ai) and click **Request access**.

You can sign up with email, Google, GitHub, a passkey, or a supported wallet
where those options are enabled for your deployment. All doors land you in the
same place: a dashboard with a personal account and access to create or join a
Company.

Wallet and signer behavior is deployment-dependent. Some deployments can
provision assisted signers or expose wallet login; others only use platform
identity until a protocol module is enabled. See [Wallets & identity](/docs/concepts/wallets-and-identity).

## 2. Create your first Company

Click **Launch Company** or **+ New Company**.

In the current hosted release, the public catalog is intentionally conservative:
one default aeqi Blueprint. It starts a minimal Company with a primary agent,
shared memory, a bootstrap Quest, and a review cadence. Specialized archetypes
stay out of the public catalog until their product behavior and protocol
assumptions are audited.

| Single blueprint | Best for |
|---|---|
| **aeqi** | A general Company shell. The mission defines the operating structure. |

Pick **aeqi**. Give your Company a name. Click **Create**.

A few things happen at once:

1. A workspace is provisioned (a fresh tenant on its own port).
2. Initial roles and the primary agent are seeded.
3. Ideas are created for the Company mission and operating context.
4. Events schedule the first operating rhythm.
5. One kickoff Quest asks you to define the Company mission before adding specialist agents or more structure.

The wizard takes you from goal to live workspace without requiring you to design an org chart first.

Some API and protocol surfaces still call this runtime vehicle a `TRUST`.
Beginner product surfaces should be read as Company-first; `TRUST` is the
underlying runtime/protocol term.

## 3. Meet your agents

You land on the Company overview tab. The Agents row in the rail shows the agents that just got hired.

Open the primary agent. The Sessions tab shows the agent has opened a greeting session: it asks what the Company should make true, then turns the answer into operating context and the first Quests.

This is the **co-creation** loop in action: the agent doesn't sit idle waiting for you to give it work. It introduces itself, captures context via Quests, and uses the answers as Ideas. See [Co-creation](/docs/methodology/co-creation) for the full pattern.

## 4. Send your first message

Click **Send message** at the bottom of the Sessions tab. Type:

> "Help me sketch a one-page roadmap for the next 90 days."

The agent picks up the message, drafts a roadmap as a new Idea, and replies with a link in the same session. You'll see:

- A new **Idea** appears in the Ideas tab with the draft.
- A new **Quest** appears in the Quests tab — the work the agent did to produce the draft.
- A new **Event** appears in the Events tab — the message you sent, the trigger that fired the work.

Four operating primitives, one user action: the Agent executes, the Quest
frames the work, the Idea stores the artifact, and the Event records what
happened.

## 5. Connect Google

Where enabled for your deployment, open the agent's **Integrations** tab and click **Connect Google**. You'll be redirected through Google's OAuth flow and asked to consent to specific scopes (Gmail send, Gmail read, Calendar read/write).

When you return, the agent has Gmail and Calendar access — scoped to **this agent only**, not the whole Company. The token is encrypted in the per-tenant credentials substrate. Other agents in the same Company stay disconnected unless you explicitly connect them.

This is "[Path B](/docs/patterns/oauth-path-b)" — per-agent OAuth. The pattern generalizes to any provider (Slack, Notion, GitHub, etc.).

From this point on, the agent can:

- Send mail from your shared inbox (`gmail.send`).
- Search and reply (`gmail.search`).
- Find busy times (`calendar.find_busy`), propose slots (`calendar.propose_slots`), create meetings (`calendar.create_event`), generate Meet links (`meet.create`).

Tools call the right account because credentials are scoped by `(scope_kind=Agent, scope_id=<this agent>, provider=google)`.

## 6. Spawn a Quest

Quests are units of work. Open the **Quests** tab and click **+ New quest**.

| Field | Example |
|-------|---------|
| Subject | "Draft Q3 launch announcement" |
| Description | "Long-form post for the blog. 600–800 words. Voice: confident, technical, restrained. Reference the v0.41.0 co-creation release." |
| Priority | `high` |
| Assigned agent | The primary agent |

Click **Create**. The agent picks it up immediately. You'll see:

- Status moves from `todo` to `in_progress` as the agent starts working.
- A session opens for the Quest. Tool calls, reasoning, and intermediate work all flow into the session as system messages.
- The output Idea (the draft) is linked to the Quest via `idea_id`.
- When the agent closes the Quest, it records an **outcome** — a one-line summary of what was done.

If the agent hits a question it can't answer alone, it `message_to`'s you in the same session. You answer; it continues. No separate "ask director" verb — Sessions are the universal conversation primitive ([Sessions](/docs/concepts/sessions)).

## 7. Where to go next

You've used the four operating primitives and the supporting structures around
them. From here:

- **Use the CLI.** Run [aeqi chat or a local runtime](/docs/reference/cli) from
  your terminal.
- **Connect an AI client.** Configure [MCP](/reference/mcp) so Codex, Claude
  Code, or another client can use Company memory and quests.
- **Integrate over HTTP.** Use the [REST API](/docs/api/rest) for platform and
  runtime operations.
- **Add a board member.** Roles tab → **+ Add role** → assign Director. On-chain registration and assignment are optional deployment features, not required to use the runtime.
- **Hire another agent.** Agents row → hover **+** → pick a template (researcher, reviewer, sales). The agent gets a charter, a role, and starts running.
- **Schedule an event.** Events tab → **+ New event** → "Daily standup at 09:00." The event fires a recurring Quest.
- **Capture an idea.** Ideas tab → **+ New idea** → write anything. Tag it. Mention an agent. The agent reads it.
- **Send to Telegram.** Where enabled, Channels tab on any agent → **Connect Telegram**. Pair the bot, allowlist a chat, set the mention-gate. The agent now reads Telegram messages and replies when @-mentioned. ([Mention-gating](/docs/patterns/mention-gating))
