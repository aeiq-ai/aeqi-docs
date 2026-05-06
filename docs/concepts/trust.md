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

- **Not a multisig.** Gnosis Safe is a threshold signature contract. A TRUST adds a role graph, governance module, vesting, and an agent runtime on top of a 1-of-N signer set. They solve different problems.
- **Not a DAO.** "DAO" implies token-vote governance as the primary mechanism. A TRUST is general-purpose — a solo founder's TRUST has no token and no governance module enabled.
- **Not custody.** aeqi does not hold your keys. The TRUST contract holds treasury funds; you (or your agents) sign UserOperations to move them.

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
| **Treasury** | ERC-20 balances via indexer |
| **Governance** | Proposal state from governance module |
| **Settings** | Signer list + passkey configuration |

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

## See Also

- [Deploy Your First TRUST](/docs/getting-started/deploy-your-first-trust) — create a TRUST in 3 minutes
- [Factory Flow Reference](/docs/factory-flow) — deep dive into wizard stages and on-chain registration
- [Canonical Templates](/docs/architecture/canonical-templates) — the four on-chain archetypes
- [aeqi Entity & Account Abstraction](/docs/architecture/aeqi-entity-aa) — ERC-4337 implementation details
- [Wallet Architecture](/docs/architecture/wallet-architecture) — passkey signers, session keys, recovery
