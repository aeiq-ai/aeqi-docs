# Contracts

Solidity contracts in the aeqi on-chain layer. ABI lives in `aeqi-core/abi/`.

## Core set

| Contract | Role | File |
|---|---|---|
| `TRUST.sol` | Per-Company role-graph smart account. ERC-4337. | aeqi-core/contracts/TRUST.sol |
| `Factory.sol` | Deploys new TRUSTs from templates. | aeqi-core/contracts/Factory.sol |
| `Beacon.sol` | Beacon Proxy implementation registry; version-locked. | aeqi-core/contracts/Beacon.sol |
| `Proposal.sol` | Voting + execution queue. | aeqi-core/contracts/Proposal.sol |
| `RoleModule.sol` | Role definitions + on-chain RBAC. | aeqi-core/contracts/modules/RoleModule.sol |
| `TokenModule.sol` | Ownership token (ERC-20 + extensions). | aeqi-core/contracts/modules/TokenModule.sol |
| `VestingModule.sol` | Time + market-cap vesting schedules. | aeqi-core/contracts/modules/VestingModule.sol |
| `BudgetModule.sol` | Spend limits, role budgets. | aeqi-core/contracts/modules/BudgetModule.sol |
| `FundingModule.sol` | Multi-stage round state machine (Venture). | aeqi-core/contracts/modules/FundingModule.sol |
| `GovernanceModule.sol` | Proposals, votes, execution relay. | aeqi-core/contracts/modules/GovernanceModule.sol |
| `FundModule.sol` | LP/GP carry waterfall (Fund). | aeqi-core/contracts/modules/FundModule.sol |
| `AeqiEntity.sol` | User/agent ERC-4337 smart account. | aeqi-core/contracts/AeqiEntity.sol |
| `Paymaster.sol` | ERC-7677 endorsement paymaster. | aeqi-core/contracts/Paymaster.sol |

## Selectors and signatures

```solidity
// Factory
function registerTRUST(
    bytes32 trustId,
    bytes32 templateId,        // keccak256("entity") | "venture" | "foundation" | "fund"
    bytes ipfsCid,             // CIDv1, 32 bytes
    bytes valueConfigs,        // ABI-encoded module configs
    address[] declaredSigners
) external returns (address trustAddress);

event TrustRegistered(
    bytes32 indexed trustId,
    address indexed trustAddress,
    bytes32 templateId,
    bytes ipfsCid
);
```

```solidity
// RoleModule
function assignRole(
    bytes32 roleId,            // keccak256(roleName)
    address occupant
) external;

event RoleAssigned(
    bytes32 indexed roleId,
    address indexed occupant
);
```

```solidity
// GovernanceModule
function propose(
    address[] targets,
    uint256[] values,
    bytes[] calldatas,
    string description
) external returns (uint256 proposalId);

function vote(uint256 proposalId, uint8 support) external;

function execute(uint256 proposalId) external;
```

## Deployments

### Anvil chain 31337 (local dev)

| Contract | Address |
|---|---|
| Factory | (per dev session — varies by `forge script` run) |
| AEIQ dogfood TRUST | `0x4a9221095d6863f068d1543fc7995c25347b4edc` |

Run `forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast` to (re)deploy locally.

### Base mainnet

Pending. Contract is mainnet-deployable (TRUST optimized to 23,550 bytes in v0.18.0). Deploy when production launches.

### Base Sepolia (test)

| Contract | Address |
|---|---|
| Factory | TBD |
| Bundler entrypoint | Standard ERC-4337 v0.7 (`0x0000000071727De22E5E9d8BAf0edAc6f37da032`) |

## ABI files

ABIs live in `aeqi-core/abi/`. The `aeqi/crates/aeqi-chain` Rust crate generates type-safe bindings via `alloy_sol_types::sol!`.

For frontend (TypeScript), bindings are regenerated at build via wagmi's CLI:

```bash
cd aeqi/apps/ui
npm run wagmi
```

## Encoding gotchas

### `abi_encode` vs `abi_encode_params`

When ABI-encoding a tuple as the outer payload for a `bytes`-typed Solidity argument that the contract decodes as a tuple, use `abi_encode_params()` not `abi_encode()`. The latter wraps the tuple in an outer tuple, breaking Solidity's `abi.decode` offset reads.

```rust
// WRONG — wraps in outer tuple
let payload = (a, b, c).abi_encode();

// RIGHT — flat encoding
let payload = (a, b, c).abi_encode_params();
```

This bug shipped during wizard validation; the fix is in `aeqi-platform/src/dao_provisioner.rs`. See `feedback_alloy_abi_encode_trap.md`.

### Venture template chain-specific configs

The Venture template's Uniswap + UniFutures modules unconditionally `abi.decode` chain-specific config in `finalizeModule()`. On plain anvil supply zero-address stub `ValueConfig` entries; on Base/Mainnet supply real addresses. `dao_provisioner.rs` gates on `template_id == keccak256("venture")`.

## Upgrade model

Beacon Proxies are version-locked. The PROTOCOL Foundation may publish a new Beacon, but a TRUST only adopts it if its own governance votes to pull. We don't push patches.

Modules are not user-attachable post-deploy in v1 (changing template = redeploy). Module upgrade lives behind governance + a long timelock.

## Related

- [Chain](/docs/architecture/chain)
- [Canonical templates](/docs/architecture/canonical-templates)
- [Factory flow](/docs/factory-flow)
- [aeqi Entity & AA](/docs/architecture/aeqi-entity-aa)
