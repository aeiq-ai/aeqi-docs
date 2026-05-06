# Getting started

Spawn your first Company on aeqi, meet the agents that come with it, send your first message, and ship your first Quest. This walkthrough uses the hosted platform at [app.aeqi.ai](https://app.aeqi.ai); if you'd rather self-host, jump to the [Quickstart](/docs/quickstart).

About 10 minutes end to end.

## 1. Sign up

Go to [aeqi.ai](https://aeqi.ai) and click **Start a company**.

You can sign up with email, Google, GitHub, a passkey, or any Ethereum wallet (MetaMask, Coinbase Wallet, WalletConnect). All five doors land you in the same place: a dashboard with a personal account already provisioned.

![Sign-up page](/docs/img/01-signup.png)

A custodial wallet is provisioned automatically — every account has exactly one. You don't see it on the dashboard yet; it's there when you need it. See [Wallets & identity](/docs/concepts/wallets-and-identity) for the full custody model.

## 2. Spawn your first Company

Click **+ New company** in the sidebar (top of the Companies section, left rail).

You'll see two columns of blueprints. The first is **single Companies** — one entity per blueprint. The second is **stacks** — multi-entity org structures that ship together (a fund + portfolio companies, a personal entity + a spinout).

| Single blueprint | Best for |
|---|---|
| **Solo founder** | One person plus their agents. No board, no governance module. |
| **Tech studio** | Small team building software. CEO + CTO seats, light governance. |
| **Venture** | Startup raising or planning to raise. Cap table, vesting, governance live. |
| **Foundation** | Non-profit, public-goods steward. No token, mission-locked. |
| **Index fund** | Capital allocator. LP/GP roles, NAV tracking, no operating company. |
| **Personal OS** | Just you, your agents, your inbox. Default for /me. |

Pick **Tech studio** for the walkthrough. Give your company a name. Click **Spawn**.

![Blueprint picker](/docs/img/02-blueprints.png)

A few things happen at once, all idempotent and reversible:

1. A workspace is provisioned (a fresh tenant on its own port).
2. Roles are seeded (Director, CEO, CTO, plus per-blueprint operational seats).
3. Agents are hired into operational seats (a CEO Assistant, a CTO Assistant, etc.).
4. Ideas are seeded (a charter for each agent, the company's mission, default SOPs).
5. Events are scheduled (daily standups, weekly reviews — paused by default; you turn them on when ready).
6. A handful of kickoff Quests are created and assigned to the agents that should start them.
7. (Optional) A TRUST contract is registered on-chain. Cap table, treasury, governance — all on-chain.

The wizard goes from goal to live workspace in about 90 seconds.

## 3. Meet your agents

You land on the Company Overview tab. The Agents row in the rail shows the agents that just got hired.

Open one — say, the **Executive Assistant**. The Sessions tab shows the agent has already opened a greeting session: it introduces itself, says what it's responsible for, and asks one or two questions to calibrate.

![Agent greeting in Sessions tab](/docs/img/03-agent-greeting.png)

This is the **co-creation** loop in action: the agent doesn't sit idle waiting for you to give it work. It introduces itself, captures context via Quests, and uses the answers as Ideas. See [Co-creation](/docs/methodology/co-creation) for the full pattern.

## 4. Send your first message

Click **Send message** at the bottom of the Sessions tab. Type:

> "Help me sketch a one-page roadmap for the next 90 days."

The agent picks up the message, drafts a roadmap as a new Idea, and replies with a link in the same session. You'll see:

- A new **Idea** appears in the Ideas tab with the draft.
- A new **Quest** appears in the Quests tab — the work the agent did to produce the draft.
- A new **Event** appears in the Events tab — the message you sent, the trigger that fired the work.

![First message in session](/docs/img/04-first-message.png)

Four primitives, one user action. Quest WHAT, Idea HOW, Event WHEN, Role WHO.

## 5. Connect Google

In the agent's **Integrations** tab, click **Connect Google**. You'll be redirected through Google's OAuth flow and asked to consent to specific scopes (Gmail send, Gmail read, Calendar read/write).

When you return, the agent has Gmail and Calendar access — scoped to **this agent only**, not the whole company. The token is encrypted in the per-tenant credentials substrate. Other agents in the same company stay disconnected unless you explicitly connect them.

This is "[Path B](/docs/patterns/oauth-path-b)" — per-agent OAuth. The pattern generalizes to any provider (Slack, Notion, GitHub, etc.).

![Connect Google flow](/docs/img/05-connect-google.png)

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
| Assigned agent | The CMO agent |

Click **Create**. The agent picks it up immediately. You'll see:

- Status moves `pending` → `in_progress` as the agent starts working.
- A session opens for the Quest. Tool calls, reasoning, and intermediate work all flow into the session as system messages.
- The output Idea (the draft) is linked to the Quest via `idea_id`.
- When the agent closes the Quest, it records an **outcome** — a one-line summary of what was done.

![Quests tab with first quest](/docs/img/06-first-quest.png)

If the agent hits a question it can't answer alone, it `message_to`'s you in the same session. You answer; it continues. No separate "ask director" verb — Sessions are the universal conversation primitive ([Sessions](/docs/concepts/sessions)).

## 7. Where to go next

You've used all five primitives. From here:

- **Add a board member.** Roles tab → **+ Add role** → assign Director. Generates an on-chain assignment if your TRUST is registered.
- **Hire another agent.** Agents row → hover **+** → pick a template (researcher, reviewer, sales). The agent gets a charter, a role, and starts running.
- **Schedule an event.** Events tab → **+ New event** → "Daily standup at 09:00." The event fires a recurring Quest.
- **Capture an idea.** Ideas tab → **+ New idea** → write anything. Tag it. Mention an agent. The agent reads it.
- **Send to Telegram.** Channels tab on any agent → **Connect Telegram**. Pair the bot, allowlist a chat, set the mention-gate. The agent now reads Telegram messages and replies when @-mentioned. ([Mention-gating](/docs/patterns/mention-gating))

## Capturing screenshots

Screenshots in this guide live at `docs/img/0*.png`. To regenerate:

1. Sign in to the AEIQ tenant at `https://app.aeqi.ai/c/59bc9fd3-956a-4104-aaf8-83253fde840c/overview`.
2. Resize the viewport to 1440×900.
3. Capture each surface listed above. Optimize PNG to web (`optipng -o7`).
4. Replace `docs/img/0*.png` with the new files.

The aeqi/CLAUDE.md JWT recipe documents how to mint a token for headless capture via Playwright.
