# Chain

aeqi's on-chain layer. TRUST contract, factory, templates, ERC-4337 stack. Live on Base; anvil for local dev.

## What goes on-chain

Four things, no more:

| Layer | What |
|---|---|
| **Identity** | The TRUST contract address — the Company's stable on-chain identity. |
| **Authority** | Director-tier roles via `RoleModule`. Operational roles stay runtime-only. |
| **Capital** | Treasury balances; ownership tokens (when minted); vesting schedules. |
| **Decisions** | Proposals + votes + execution queue via `Proposal.sol`. |

Everything else — Quests, Ideas, Events, Sessions, agents — stays in the runtime. The chain is for what needs to be enforceable; the runtime is for what needs to be fast.

## TRUST contract

```
TRUST.sol           ← role-graph smart account; per-Company contract instance
Proposal.sol        ← voting and execution
RoleModule.sol      ← role definitions, edges, on-chain RBAC
TokenModule.sol     ← ownership token (Venture)
VestingModule.sol   ← time + market-cap vesting
BudgetModule.sol    ← treasury + spend limits
FundingModule.sol   ← multi-stage rounds (Venture)
GovernanceModule.sol ← proposals + relay
FundModule.sol      ← LP/GP carry waterfall (Fund)
```

A TRUST is an ERC-4337 smart account. Its address is deterministic via CREATE2 — your Company can receive funds before deployment.

The contract is 23,550 bytes (mainnet-deployable; checked v0.18.0). Module set is fixed at template choice; modules are not user-attachable post-deploy in v1 (changing template = redeploy).

## Factory

```
Factory.registerTRUST(
    trustId,           // bytes32 deterministic id (keccak256(name + creator + nonce))
    templateId,        // keccak256("entity") | "venture" | "foundation" | "fund"
    ipfsCid,           // IPFS hash of operating agreement
    valueConfigs,      // role/budget/vesting configs as ABI-encoded tuples
    declaredSigners    // initial Director set (bytes20[])
)
```

The factory:

1. Validates the template exists.
2. Computes the deterministic CREATE2 address.
3. Stores metadata CID and configs.
4. Deploys the TRUST proxy (Beacon Proxy pointing at the version-locked Beacon).
5. Initializes signers and roles.
6. Emits `TrustRegistered`.

Beacon Proxies are version-locked — upgrades are pull-based. The PROTOCOL Foundation may publish a new Beacon, but a TRUST only adopts it if its own governance votes to pull. We can't push patches.

See [Factory flow](/docs/factory-flow) for the full lifecycle.

## Canonical templates

Four locked configurations:

| Template | Modules | Best for |
|---|---|---|
| **Entity** | Token, Vesting, Funding, Governance, Role, Budget | Flexible shell — holdings, SPVs, custom orgs |
| **Venture** | Token, Vesting, Funding, Governance, Role, Budget | Startups raising capital — full cap table + state machine |
| **Foundation** | Governance, Role, Budget, Vesting | Non-profits, public-goods stewards — no token, no fundraising |
| **Fund** | Fund, Token, Governance, Role, Budget | Capital allocators — LP/GP, NAV, carry waterfall |

See [Canonical templates](/docs/architecture/canonical-templates) for the contract-level details.

## ERC-4337 stack

aeqi runs its own self-hosted Account Abstraction stack:

| Service | Role |
|---|---|
| **Bundler** (rundler v0.11.0) | Receives UserOperations from frontends/wallets, validates, builds bundles, submits to entrypoint. |
| **Paymaster** | ERC-7677 endorsement. Sponsors gas for verified users. Migration CLI shipped (v0.20.0): `aeqi-paymaster migrate-to-passkey` flips a custodial EOA to a passkey-bound smart account. |
| **EntryPoint** | Standard ERC-4337 v0.7. Singleton on Base. |
| **Smart account** | Per-user (and per-Company) AEQI Entity smart account contract. ERC-4337 + passkey signer + recovery facilitator. |

The wallet thesis: passkey-native + smart account, built in-house. NOT built on Safe (Safe is a multisig contract; aeqi's Entity contract has role-graph authority + ERC-4337 + recovery without custody). NOT custodial (we never hold keys; recovery is timelocked rotation). See [Wallet architecture](/docs/architecture/wallet-architecture).

End-to-end UserOp execution proven in v0.21.0: 184k gas measured through the full stack on anvil.

## Recovery without custody

Lose your passkey? aeqi facilitates signer rotation via:

- An on-chain `recoveryFacilitator` role (constrained — can request rotation, not directly sign).
- A 7-day timelock on rotation requests.
- Veto rights for any existing signer during the timelock.

Custody and recovery are different authorities. The facilitator role helps you rotate, but only with delay and existing-signer veto. We never hold a key that can move funds.

See [Recovery without custody](/docs/concepts/wallets-and-identity#recovery).

## Three money flows kept distinct

Subscriptions, inference top-ups, and treasury moves are three separate flows. Don't conflate.

| Flow | Source | Settled |
|---|---|---|
| Subscription | Personal card / personal USDC | Stripe / aeqi platform, monthly |
| Inference top-up | Treasury or personal | Per-call (subscription lane) or per-dollar (treasury / x402 lane) |
| Treasury | Internal | On-chain settlement |

Subscription does NOT debit treasury (failure modes diverge; a Company with empty treasury but live product still needs the subscription to honor). Inference top-ups CAN debit treasury (it's the Company's own usage). Treasury is the Company's own money.

See [Architecture: three money flows](/docs/methodology/org-architecture#three-money-flows-kept-distinct).

## IPFS

Operating agreements, role descriptions, and other metadata are pinned to IPFS at `registerTRUST`. CIDs go on-chain (32-byte CIDv1); the content is fetchable from any IPFS gateway.

aeqi runs its own kubo daemon (`aeqi-ipfs.service` on platform host) — no SaaS dependency. The Rust crate `aeqi-ipfs` wraps the local HTTP API.

See [IPFS content addressing](/docs/guides/ipfs-content-addressing).

## Click-to-DAO bridge

The wizard's "Click → live TRUST" path is production-stable. Two bugs were fixed during v0.21 wizard validation:

- **abi_encode trap**: alloy's `abi_encode` wraps tuple payloads in an outer tuple, breaking Solidity's `abi.decode` offset reads. Fix: `abi_encode_params()` for the outer encoding.
- **Venture template stub**: Venture's Uniswap + UniFutures modules unconditionally `abi.decode` chain-specific config. On plain anvil, that reverts. Fix: dao_provisioner gates on `template_id == keccak256("venture")` and stubs zero-address ValueConfig entries when the chain is anvil.

Both resolved. v0.26.0 added `/trust/<address>` canonical routing with 308 fallback from `/c/<entity_id>`.

Production trustsCount: 14+ (as of 2026-05-05).

## Networks

| Network | Status |
|---|---|
| **Base mainnet** | Pending — TRUST contract is mainnet-deployable. |
| **Base Sepolia** | Test path. |
| **Anvil chain 31337** | Local dev. AEQI dogfood TRUST lives here today. |

The AEQI dogfood TRUST is `0x4a9221095d6863f068d1543fc7995c25347b4edc` on anvil 31337. Move to Base when production launches.

## Related

- [Wallet architecture](/docs/architecture/wallet-architecture)
- [Canonical templates](/docs/architecture/canonical-templates)
- [aeqi Entity & AA](/docs/architecture/aeqi-entity-aa)
- [UserOperation lifecycle](/docs/architecture/userop-lifecycle)
- [Factory flow](/docs/factory-flow)
- [Contracts reference](/docs/reference/contracts)
