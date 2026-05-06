# TRUST

A TRUST is aeqi's foundational on-chain primitive. It is a role-graph smart account — not a multisig, not a DAO — that holds a treasury, manages roles, and executes governance proposals on Base.

Every company created in aeqi is a TRUST.

## What a TRUST is

```
TRUST
├── Treasury       (ERC-20 balances, ETH, inbound/outbound)
├── Roles          (director, executive, contributor, advisor …)
├── Governance     (proposals, votes, execution queue)
├── Agents         (runtime identities bound to roles)
└── IPFS metadata  (name, description, operating agreement)
```

A TRUST is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. Its address is stable and deterministic — it is your company's identity on-chain. The same address appears on blockchain explorers, in API calls, in IPFS references, and in wallet UIs.

## What a TRUST is not

- **Not a multisig.** Gnosis Safe is a threshold signature contract: M-of-N keys agree on a transaction, the transaction executes. A TRUST adds a role-graph DAG, a governance module, vesting schedules, and an agent runtime on top of an N-signer set. Safe is *safety* (lose one key, the rest still control the funds). TRUST is *authority* (the org chart is a first-class on-chain object, and runtime agents inherit permissions from their roles). They solve different problems and they compose — a TRUST can declare a Safe as one of its directors.
- **Not a DAO.** "DAO" implies token-vote governance as the primary mechanism. A TRUST is general-purpose — a solo founder's TRUST has no token and no governance module enabled. We avoid the term in product copy and reserve it for technical comparison; the on-chain contract is `TRUST.sol`, the user-facing label is "smart account."
- **Not custody.** aeqi does not hold your signing keys. The TRUST contract holds treasury funds; you (or your agents bound to roles inside it) sign UserOperations to move them. See "Recovery without custody" below for how aeqi can help you rotate signers without ever being a signer itself.

## The role-graph

Every TRUST encodes a directed acyclic graph of roles, stored on-chain. Each node is a role with a type (`director`, `executive`, `officer`, `lead`, `contributor`, `advisor`, `dealflow`, `holder`); each edge declares "role A acts on behalf of role B." Authority flows through the transitive closure: a role inherits the permissions of every role reachable from it.

That graph is the authority surface for the runtime. When an agent bound to the `executive` role tries to spend treasury, the contract walks the graph: `executive → director → root` resolves the spending limit. When a contributor agent is added to a quest, the same graph determines what tools and budgets it inherits.

The same DAG renders client-side as the org chart in the dashboard. No translation layer. The boxes you draw in the wizard ARE the contract.

## Agent identity = TRUST identity

An agent in aeqi has an on-chain address — but that address isn't a fresh EOA. It's a TRUST. Every Company is a TRUST. Every Personal Entity is a TRUST. Every C-suite agent that needs its own treasury and signing scope can be a TRUST. The runtime's agent table and the chain's TRUST registry are two views of the same set.

This is the move that makes "an agent has its own bank account" trivial. The agent's bank account is the agent's TRUST. The agent's role assignments are the agent's authority. The agent's session keys are the spending policies on that TRUST. There is no "wrap an EOA in some custody product" step — the contract IS the identity.

## Structure

### Roles

Every participant in a TRUST holds a role. Roles are stored on-chain and determine what a signer can do.

| Role | Purpose |
|------|---------|
| `director` | Founding signers. Initial declared signers on `registerTRUST`. Cap-table-grade authority. |
| `executive` | C-level. Can create proposals, move treasury within a spend limit. |
| `officer` | Senior team. Operational authority. |
| `lead` | Team leads. Limited operational authority. |
| `contributor` | Individual team members. Executes quests within their session-key policy. |
| `advisor` | External advisors. Advisory weight in governance, no spending. |
| `dealflow` | Business development. Custom permissions per company. |
| `holder` | Token holders. Governance weight via token balance; no role-based spending. |

Roles are assigned during TRUST creation (in the wizard) or afterward via governance proposal.

### Templates

Four on-chain templates exist. You pick one at creation time:

| Template | Module set | Best for |
|----------|-----------|---------|
| **Foundation** | role, budget, token, vesting | Personal projects, non-equity orgs |
| **Entity** | role, budget, token, vesting, funding | Startups, joint ventures, service companies |
| **Venture** | role, budget, token, vesting, funding, AMM, UniFutures | Full economic stack: token issuance, cap tables, governance, AMM |
| **Fund** | role, token, vesting, budget, fund module | Investment funds with LP governance and NAV tracking |

Templates are locked — you cannot change a TRUST's template after creation. See [Canonical Templates](/docs/architecture/canonical-templates) for details.

### IPFS metadata

When a TRUST is created, its metadata (name, description, avatar, operating agreement) is pinned to IPFS. The content-addressed CID is stored on-chain. This means:

- The operating agreement is public, immutable, and censorship-resistant.
- Updating it requires a governance proposal that sets a new CID.

See [IPFS Content Addressing](/docs/guides/ipfs-content-addressing) for the CID encoding details.

## The URL

Your TRUST's canonical URL in the dashboard is:

```
/trust/<address>
```

where `<address>` is the on-chain contract address (e.g., `0x1a2b3c...`). This is permanent — it will not change. Old links of the form `/c/<entity_id>` redirect here with a 308.

## Lifecycle

### 1. Creation

You call `registerTRUST` on the Factory contract. Inputs:
- `templateId` — which of the four templates
- `ipfsCid` — IPFS hash of your metadata
- `valueConfigs` — encoded role, budget, vesting, and governance configs
- `declaredSigners` — wallet addresses of all directors

The Factory deploys a new TRUST proxy to a counterfactual address (CREATE2). The address is deterministic — you can receive funds to it before the contract is fully deployed.

### 2. Indexing

The on-chain indexer watches for `TrustRegistered` events. On detection:
1. Decodes metadata from IPFS
2. Writes a `runtime_placements` record (maps TRUST address to your user account)
3. Spawns your agent runtime sandbox

This takes ~20–30 seconds after the transaction mines.

### 3. Operation

Once live, the dashboard wires these tabs directly to on-chain state:

| Tab | Source |
|-----|--------|
| **Overview** | IPFS metadata + indexer balance query |
| **Roles** | `getRoles()` on the roles module |
| **Ownership** | Cap table from vesting and token modules |
| **Treasury** | ERC-20 + native balance via indexer |
| **Governance** | Proposal state from governance module |

The signer list and passkey configuration live on the agent's Settings rail rather than the Company rail — see [Agent rail](/docs/concepts/agents).

### 4. Governance

Any change to a TRUST's on-chain state (adding a role, moving treasury, updating governance params) requires a signed UserOperation. Depending on the template and config:

- **Solo TRUST (1-of-1):** director signs directly.
- **Multi-director (N-of-N):** all declared signers must sign.
- **Token governance (Venture):** proposals submitted on-chain, token-holder vote, execution after timelock.

## Agents and TRUSTs

Every TRUST auto-spawns an agent runtime sandbox. Agents in the sandbox:
- Are bound to roles within the TRUST
- Sign transactions within session-key policies (max spend, contract allowlist, expiry)
- Never have direct custody of the TRUST's signing keys

An agent can execute quests, coordinate with other agents, and call approved contracts — all without you needing to sign each individual action.

## Recovery without custody

The hardest question for a non-custodial system is "what happens when the user loses every device?" If aeqi never holds a key, who unlocks the TRUST?

The answer is a constrained on-chain `recoveryFacilitator` role with strictly bounded authority. aeqi takes that role on behalf of the user. It can do exactly one thing: call `proposeAddSigner(newAddr)` to start a 7-day on-chain timelock. It cannot sign transactions, move funds, bypass the timelock, or change the rules. The contract is immutable.

During those 7 days, any existing signer on any device can call `cancelRecovery()` to veto. After 7 days with no veto, anyone can call `activateAddedSigner()` to finalize. aeqi is a doorbell — we can ring it; the user can ignore it for a week from any device that still has access.

Three layers, in order of how often they fire:

1. **Automatic device sync.** iCloud Keychain and Google Password Manager already sync passkeys across the user's devices. Handles ~95% of "I lost my phone" cases invisibly.
2. **Email re-auth + 7-day timelock.** For "I lost everything." The user re-authenticates against email, enrolls a new passkey, and the timelock starts. Existing devices get daily warnings.
3. **Social recovery (v2).** User-designated 2-of-3 trustees. aeqi is not in the loop. Power-user opt-in.

The trust posture this produces is asymmetric and worth naming: if Privy is hacked, the attacker has the auth shares and signs immediately, no warning. If aeqi is hacked, the attacker can ring every doorbell, but every user gets 7 days of warning and active users veto trivially. Custody and recovery are different authorities; we hold the second without ever holding the first.

## See Also

- [Deploy Your First TRUST](/docs/getting-started/deploy-your-first-trust) — create a TRUST in 3 minutes
- [Factory Flow Reference](/docs/factory-flow) — deep dive into wizard stages and on-chain registration
- [Canonical Templates](/docs/architecture/canonical-templates) — the four on-chain archetypes
- [aeqi Entity & Account Abstraction](/docs/architecture/aeqi-entity-aa) — ERC-4337 implementation details
- [Wallet Architecture](/docs/architecture/wallet-architecture) — passkey signers, session keys, recovery
