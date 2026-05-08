# Quickstart: Deploy your first TRUST

This guide walks you through creating and deploying an on-chain TRUST — a smart account with role-based governance, treasury, and agent runtime all managed from one dashboard.

By the end, you'll have:
- A TRUST contract deployed on Base (an ERC-4337 smart account)
- A company dashboard with Treasury, Ownership, and Governance tabs wired to the blockchain
- An agent runtime spawned in your sandbox
- A path to upgrade from passkey-only to full smart-account security

**Time to live:** ~3 minutes after payment.

## Prerequisites

- Email address (or Ethereum wallet address)
- A wallet with $19 USDC or $19 on a card (first month is promotional pricing)
- A web browser

No crypto experience required. You can fund the account with USDC directly or pay with a card.

## Step 1: Sign Up

Go to [aeqi.ai](https://aeqi.ai) and click "Start a company."

Sign up with:
- Email + password, or
- Any Ethereum wallet (MetaMask, Coinbase Wallet, WalletConnect, etc.)

You'll land on the dashboard. Your personal account is now a Company Entity (an on-chain smart contract); you just don't see it yet.

## Step 2: Create a New Company

Click **+ New company** (top-left corner, or in the Roles tab).

You'll see four blueprints:

| Blueprint | Best for |
|---|---|
| **Entity** | Personal projects, joint ventures, service DAOs. Lightweight cap table, no token economics. |
| **Venture** | Startups and tech companies. Full cap table, token issuance, governance, and AMM. |
| **Foundation** | Non-profits and philanthropic orgs. Budget-and-vesting only, no fundraising rounds. |
| **Fund** | Investment funds. LP governance, fund NAV tracking, no company fundraising. |

Pick **Entity** for your first TRUST. It's the fastest to deploy and scales to most use cases.

## Step 3: Fill in Details

The wizard asks for:

1. **Company name** (e.g., "Acme Labs")
2. **Creator address** (your Ethereum wallet, pre-filled if you logged in with a wallet; otherwise paste yours)

That's it. You don't need to set up cap tables, roles, or governance yet — the wizard handles defaults.

## Step 4: Approve & Deploy

Review the summary, then click **Deploy TRUST.**

Behind the scenes:
1. Your operating agreement (metadata) is pinned to IPFS
2. The wizard broadcasts `registerTRUST` to the aeqi Factory contract on Base
3. The contract deploys your TRUST and emits a `TrustRegistered` event
4. The on-chain indexer picks it up and writes it to the database
5. Your agent runtime spawns in your sandbox

You'll see a loading screen. Once the transaction is mined (~20 seconds), you'll land at:

```
/trust/<address>/overview
```

where `<address>` is your new TRUST contract's on-chain address (e.g., `0x1234...abcd`).

## What You Get

### On-Chain TRUST Contract

Your TRUST is an ERC-4337 smart account. It:
- Holds a treasury (USDC, ETH, or any ERC-20)
- Manages role-based permissions (director, executive, contributor, etc.)
- Executes proposals via multi-sig or governance vote (depending on blueprint)
- Is counterfactually addressable — you can receive funds to it before it's fully deployed

**Your TRUST address is your identity.** It's the same address everywhere: blockchain explorers, APIs, wallets, contracts.

### Dashboard Tabs

#### Overview
- Company name, avatar, description
- Treasury balance and recent transactions
- Agent runtime status

#### Ownership
- Cap table: who owns what %
- Vesting schedules
- Share transfers

#### Governance
- Proposals (if you picked Venture)
- Vote history
- Execution queue

#### Treasury
- Balances across all assets
- Transactions (sent/received)
- Historical P&L

#### Agents
- List of agents in your sandbox
- Session keys (spend limits, contract allowlists)
- Agent permissions and roles

#### Settings
- Signer management (add/remove passkeys or EOAs)
- Recovery settings
- Integrations and webhooks

### Agent Runtime

Your TRUST auto-spawns a secure sandbox where agents run. They:
- Execute quests (units of work)
- Read from and write to Ideas (persistent memory)
- Coordinate via Sessions (native multi-participant conversations)
- Call tools (APIs, smart contracts, etc.) within role-based permissions

Agents never have custody of your keys. They sign transactions within a session-key policy you set (max spend, allowed contracts, expiry).

## Next Steps

### Fund Your Treasury

Send USDC or ETH to your TRUST address. From the Ownership tab:

```
Copy your TRUST address → fund it via any wallet or exchange
```

No minimum. You can start with $1 and grow it.

### Invite Team Members

In the Roles tab, click **+ Add role** and enter wallet addresses for directors, executives, or contributors.

Each member gets:
- Share of the cap table (equity)
- A role with specific permissions
- Access to the dashboard (via Ethereum wallet login)

### Customize Governance

If you picked Venture, governance is live. In the Governance tab:
- Set voting delay and quorum
- Create proposals for cap table changes, treasury moves, etc.

### Deploy Your First Agent

In the Agents tab, click **+ New agent**. The wizard:
1. Names the agent (e.g., "Marketing Bot")
2. Sets a role (e.g., "contributor")
3. Creates a session key with a spend limit (e.g., $100/month)
4. Spawns it in your sandbox

From then on, the agent can:
- Execute quests you assign
- Access Ideas in your treasury
- Call approved contracts (with spend-limit enforcement)
- Communicate with other agents and humans via Sessions

### Upgrade Signer Security

Your TRUST currently uses a passkey (WebAuthn) for signing. Phase 2 adds:
- Multiple signer support (passkey + hardware wallet + multi-sig)
- Social recovery (7-day timelock)
- Signer rotation without custody

See [Wallet Migration](/docs/guides/wallet-migration) for the upgrade flow (coming soon).

## Under the Hood

### Factory Registration

When you hit "Deploy TRUST," the wizard calls:

```solidity
registerTRUST(
    trustId,           // bytes32 id for this TRUST
    templateId,        // keccak256("entity") for Entity blueprint
    ipfsCid,           // IPFS hash of your metadata
    valueConfigs,      // role/budget/vesting configs
    declaredSigners    // [your wallet address]
)
```

The Factory:
1. Validates the template exists
2. Stores your metadata CID and configs
3. Deploys a new Entity proxy to a counterfactual address
4. Initializes signers and roles
5. Emits `TrustRegistered`

### Off-Chain Sync

The aeqi platform:
1. Watches for `TrustRegistered` events
2. Decodes the metadata from IPFS
3. Creates a record in `runtime_placements` (mapping TRUST address to your user ID)
4. Spawns your agent sandbox

From this point on, your TRUST is live on-chain and in the runtime.

### Counterfactual Deployment

Your TRUST address is pre-computed before the contract is deployed (via CREATE2). This means:
- You can receive funds to your TRUST address *before* any transaction
- The address is deterministic — it won't change
- Users can send you money before you've "activated" your account

The actual deployment happens lazily on your first action (creating an agent, moving treasury funds, etc.).

## Troubleshooting

**"Transaction pending" for >2 minutes?**

Check [basescan.org](https://basescan.org) for your tx hash (in the browser console: `localStorage['pending_tx']`). If it's stuck, it likely failed due to insufficient gas or nonce collision. Reload the page to retry.

**"TRUST address not found" after deployment?**

The indexer has a ~30-second delay. Refresh after a minute. If it's still missing, check:
```bash
curl https://app.aeqi.ai/api/trusts/<your-address>
```

If it 404s, the registration didn't index. Contact support with your tx hash.

**Need to add another signer?**

In Settings > Signers, click **+ Add signer.** You can add:
- Another passkey (same device or different device)
- An EOA (hardware wallet, hot wallet, multi-sig contract)

All signers have equal authority (1-of-N multi-sig by default).

## API Access

Your TRUST is accessible over REST and x402 payment rails:

```bash
# REST: list your treasury balances
curl https://app.aeqi.ai/api/trusts/<address>/treasury \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# x402: pay per API call with USDC
curl https://app.aeqi.ai/api/agents \
  -H "HTTP-402: true" \
  -H "HTTP-402-Payment: <signed-USDC-payment>"
```

See [REST API](/docs/api/rest), [Inference API](/docs/api/inference), and [x402 Payment Rails](/docs/api/x402) for details.

## Pricing

- **First month:** $19 (card or USDC)
- **After:** $49/month (card) or $45/month (USDC)

Includes:
- Included inference credits for agent work
- Unlimited quests, agents, ideas, and transactions

See [Pricing](/docs/pricing) for details on usage overage and inference top-ups.

## See Also

- [aeqi Entity & Account Abstraction](/docs/architecture/aeqi-entity-aa) — how TRUSTs are built (ERC-4337 smart contracts)
- [Canonical Templates](/docs/architecture/canonical-templates) — Entity, Venture, Foundation, and Fund archetypes
- [Factory Flow Reference](/docs/factory-flow) — deep dive into wizard stages and on-chain registration
- [Wallet Architecture](/docs/architecture/wallet-architecture) — passkey signers, multi-sig, session keys
- [Agent Runtime Overview](/docs/concepts/agent-runtime-overview) — what happens inside your sandbox after deployment
