# aeiq Entity — Account Abstraction

Every user, company, and agent on aeiq is represented by an **aeiq Entity** — a smart contract on Base that implements ERC-4337 account abstraction. One contract template, three configurations.

## The Entity as a primitive

An **Entity** is aeiq's on-chain primitive for identity, ownership, and execution. It is not an account in the traditional sense (a keypair). It is a **smart contract** that owns itself.

| Configuration | Owners | On-chain behavior |
|---|---|---|
| **Personal Company** | 1 (the user) | A single user's account. Auto-created at signup. Holds their personal treasury, agents, sessions. |
| **Joint Company** | N | Multi-owner company. Cap table, roles, governance. Treasury shared among owners proportional to equity. |
| **Agent Entity** | Parent Company | An agent account. Owned by a parent Company Entity. Delegated a session key with on-chain policy bounds (spend limit, contract allowlist, expiry). |

## The contract anatomy

aeiq Entity is a comprehensive template written end-to-end. It is NOT built on Safe.

### IAccount interface (ERC-4337)

```solidity
interface IAccount {
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 entryPointHash,
        uint256 missingAccountFunds
    ) external;

    function executeUserOp(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external;
}
```

aeiq Entity implements this interface. It accepts UserOps signed by any registered signer (passkey, EOA, multi-sig).

### Signers module

Flexible signer configuration. Each aeiq Entity can have multiple signers of different types.

```solidity
struct PasskeySigner {
    bytes32 publicKeyX;
    bytes32 publicKeyY;
}

struct EOASigner {
    address account;
}

function isValidSignature(bytes32 hash, bytes calldata sig) 
    public view returns (bool) {
    // For each registered signer:
    //   - passkey signers → run P-256 verification math
    //   - EOA signers → run secp256k1 ecrecover
    // Accept if any signer's policy validates the signature.
}

function addSigner(address newSigner) external onlySigner;
function removeSigner(address signer) external onlySigner;
```

### Cap table module

Active for Joint Companies; dormant for Personal Companies.

```solidity
struct ShareClass {
    uint256 totalShares;
    mapping(address => uint256) balance;
    mapping(address => uint256) vestingStart;
    mapping(address => uint256) vestingEnd;
}

function issue(address to, uint256 amount, uint256 vestingEnd) 
    external onlyRole(CEO);
function transfer(address from, address to, uint256 amount) 
    external;
function balanceOf(address account) external view returns (uint256);
```

### Roles module

Defines who can do what within the Entity.

```solidity
enum RoleType { CEO, EMPLOYEE, CONTRIBUTOR, AGENT }

mapping(address => RoleType) public roles;

function grantRole(address account, RoleType role) 
    external onlyRole(CEO);
function revokeRole(address account) 
    external onlyRole(CEO);
```

Roles are permission vectors, not ownership shares. A CEO can have 0% equity but full decision authority.

### Session-key module

Scoped delegation for agents.

```solidity
struct SessionKey {
    address delegatedTo;        // Agent Entity or app signer
    uint256 spendLimit;         // Max USDC per period
    uint256 period;             // e.g., 30 days
    address[] allowedContracts;
    uint256 expiresAt;
}

mapping(bytes32 => SessionKey) public sessionKeys;

function delegateSessionKey(
    bytes32 keyId,
    address delegatedTo,
    uint256 spendLimit,
    uint256 period,
    address[] calldata allowedContracts,
    uint256 expiresAt
) external onlySigner;

function executeWithSessionKey(
    bytes32 keyId,
    address target,
    uint256 value,
    bytes calldata data
) external {
    require(sessionKeys[keyId].delegatedTo == msg.sender);
    require(canExecute(keyId, target, value)); // Check policy
    // Execute
}
```

User signs session key ONCE at company creation with their passkey. From then on, aeqi runtime signs FOR THE AGENT within the bounds. Custody never sits with us.

### Governance module

Active for Joint Companies only. Dormant for Personal Companies.

```solidity
struct Proposal {
    bytes calldata data;        // Encoded action
    uint256 votesFor;
    uint256 votesAgainst;
    uint256 createdAt;
    bool executed;
}

mapping(uint256 => Proposal) public proposals;

function propose(bytes calldata action) 
    external onlyRole(EMPLOYEE_OR_BETTER);
function vote(uint256 proposalId, bool support) 
    external onlyCapTableMember;
function execute(uint256 proposalId) 
    external;
```

Voting weight is proportional to share ownership.

### Recovery module

Signer rotation without custody.

```solidity
address public recoveryFacilitator;

address public pendingSigner;
uint256 public pendingSignerActivatesAt;

function proposeAddSigner(address newSigner) external {
    require(msg.sender == recoveryFacilitator);
    pendingSigner = newSigner;
    pendingSignerActivatesAt = block.timestamp + 7 days;
}

function activateAddedSigner() external {
    require(block.timestamp >= pendingSignerActivatesAt);
    signers[pendingSigner] = true;
    pendingSigner = address(0);
}

function cancelRecovery() external onlySigner {
    pendingSigner = address(0);  // ANY signer can veto
}
```

aeqi takes the `recoveryFacilitator` role. Cannot sign or move funds; can only ring a doorbell (propose signer) that the user can ignore for 7 days. Custody and recovery are different authorities.

## Architecture advantages

### We own the primitive

Writing aeqi Entity end-to-end means:
- Full control of the contract ABI
- Etherscan recognizes it as "aeqi Entity," not "Safe with modules"
- Upgrade independence from Safe's roadmap
- Full audit coverage of our exact model

### One template for three use cases

Same contract handles Personal Company, Joint Company, and Agent Entity. Different module configs activate/deactivate per use case.

### No third-party SaaS in the foundation

Passkey verification, signing, bundling, paymaster — all built in-house. No Privy, Magic, Coinbase Smart Wallet contracts, or Safe dependencies. Hard policy.

### Session keys enable bounded agent delegation

On-chain policy enforcement means we cannot exceed user-authorized limits. Session key defines max spend, allowed contracts, expiry. User revokes any time.

## Deployment & identity

Every Entity has:
- **On-chain identity:** its address (20-byte hex on Base)
- **Off-chain identity:** a slug (URL-friendly name, e.g., "acme-corp")
- **Counterfactual address:** deterministic address before deployment via CREATE2

When a user signs up:
1. We compute the Entity's counterfactual address (CREATE2 address that doesn't exist yet)
2. Store the mapping: user → slug → Entity address
3. On first action (creating an agent, deploying a company), we submit a UserOp that deploys the Entity to that address
4. From then on, the Entity is live on-chain

## Interoperability

### With ERC-4337 infrastructure

aeqi Entities are standard ERC-4337 smart accounts. They work with:
- Any ERC-4337 bundler (not just aeqi's silius)
- Any 4337-compatible wallet UI (not just aeqi.ai)
- Mainnet, Base, Optimism, Arbitrum (any chain with EntryPoint deployed)

### With existing smart contracts

Entities can interact with any Ethereum contract. Session-key module has an allowlist (`allowedContracts`) to scope agent interactions. Without that, an agent can only interact with contracts explicitly approved by the user.

## Trust assumptions

The Entity contract is **immutable on-chain**. Users trust:
1. The contract code is honest (mitigated by audit + open source)
2. The contract is actually deployed at the address they're shown (Etherscan verifies this)

Everything else is operationally optional:
- If aeqi's bundler goes down, use any other 4337 bundler
- If our paymaster stops funding gas, users pay themselves
- If aeqi.ai is down, use any wallet that supports the Entity ABI

The Entity is the source of truth. aeqi is the convenience layer.

## Glossary

| Term | Meaning |
|---|---|
| **aeqi Entity** | The smart contract primitive for users, companies, and agents on aeqi. One template, three configurations. |
| **ERC-4337** | Ethereum account abstraction standard. Defines UserOps, EntryPoint, bundlers, paymasters. |
| **UserOp** | A "pseudo-transaction" signed by a smart account user instead of a regular tx. Bundlers pack these into real txs. |
| **EntryPoint** | Canonical singleton contract on every EVM chain. Validates and executes UserOps. Deployed by Ethereum Foundation. |
| **Bundler** | Off-chain service that batches UserOps and submits them to the EntryPoint. |
| **Paymaster** | Contract + service that pays gas on behalf of users. |
| **Session key** | A scoped, time-limited, policy-bounded signer delegated to an app or agent. |
| **Counterfactual address** | The deterministic future address of a contract before it's deployed. Computed via CREATE2. |
| **CREATE2** | Ethereum opcode that lets contracts be deployed to deterministic addresses. |
| **Cap table** | Record of who owns what % of a company. Shares, vesting, transfers. |
| **Role** | A permission vector in a company. CEO, employee, contributor, agent. Different from equity ownership. |
