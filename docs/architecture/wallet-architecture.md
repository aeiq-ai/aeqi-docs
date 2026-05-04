# Wallet Architecture & Account Abstraction

AEQI uses a **passkey-native ERC-4337 smart account on Base**. Every account, company, and agent is an on-chain AEQI Entity — a comprehensive smart contract template with cap tables, roles, governance, and session keys.

## The stack at a glance

| Component | Choice |
|---|---|
| **Signer** | Passkey (P-256 WebAuthn) — primary; EOA (MetaMask) — secondary |
| **Smart Account** | ERC-4337 on Base |
| **Contract** | AEQI Entity (custom, written end-to-end) |
| **Bundler** | silius (Rust, self-hosted) |
| **Paymaster** | Custom contract + Rust signing service (self-hosted) |
| **Recovery** | On-chain timelock-gated facilitator role + email identity backup |

## Why this pattern

**Pattern 3 (passkey-native smart accounts)** is the cleanest non-custodial onboarding:

- Private key lives in device Secure Enclave (Apple T2, Android StrongBox, TPM) — recoverable by device OS, not held by any service
- Smart account on-chain validates passkey signatures directly
- AEQI never touches the key — we literally cannot sign
- Trust model: zero for signing, operational for convenience (bundler, paymaster, agents with bounded session keys)

## What changed in 2024

Two breakthroughs enabled this:

1. **WebAuthn PRF extension** — deterministically derive signing keys from passkeys on-device, never extractable
2. **Coinbase Smart Wallet (June 2024)** — proved the UX works: email signup → passkey → smart account → no SaaS needed

The legacy providers (Privy, Magic, Dynamic) used MPC/TEE to solve the "user has email only" problem. Passkeys removed that constraint.

## The AEQI Entity contract

One template, three configurations:

| Configuration | Owners | Use case |
|---|---|---|
| **Personal Company** | 1 (the user) | User account. Auto-created at signup. |
| **Joint Company** | N | Multi-owner company with cap table, governance, vesting. |
| **Agent Entity** | Parent Company | Agent delegated a session key with on-chain policy bounds (spend limit, contract allowlist, expiry). |

### What the contract contains

- **Signers** — P-256 passkey verifier, secp256k1 EOA verifier, multi-sig logic
- **Cap table** — share issuance, transfers, vesting schedules
- **Roles** — CEO, employee, contributor, agent with scoped permissions
- **Session-key module** — agent delegation with on-chain policy enforcement
- **Governance** — proposals, voting, quorum rules (active for joint Companies only)
- **Recovery** — signer rotation via timelock-gated `recoveryFacilitator` role

All on **one contract template**. Different module configurations per use case.

### Why we don't build on Safe

Safe is the dominant multi-sig; we considered using it as a base.

Decision: build AEQI Entity end-to-end ourselves.

Reasons:

1. AEQI's primitive is "company with cap table + roles + governance + agent delegation." Safe's primitive is "co-signature." Different primitives → different contracts.
2. Full ownership of the ABI. Etherscan and tooling recognize it as "AEQI Entity," not "Safe with modules."
3. Upgrade independence. Safe's roadmap moves on its own schedule; we don't want to be downstream.
4. Audit posture. Custom contract is more work but covers exactly our model. Safe-modules approach still requires full audits for our modules on top of Safe audit coverage.

## Trust model

### What aeqi holds

Nothing. We cannot sign, move funds, or change signers.

| Thing | Where it lives | Control |
|---|---|---|
| **Passkey (signing key)** | Device Secure Enclave | Only user's biometric unlocks it |
| **Entity contract** | On-chain on Base | Entity's own logic (signed by passkey only) |
| **Entity's contents** | Inside contract on-chain | Same — passkey signs all changes |

### What the user trusts us for

| Layer | Trust required | Graceful degradation |
|---|---|---|
| **Signing** | None | Only passkey signs; we're cryptographically excluded |
| **Contract code** | Yes, once | Mitigated by audit, open source, immutable on-chain |
| **Paymaster funding** | Operationally yes | User can pay gas themselves; graceful degradation, not lock-in |
| **Bundler availability** | Operationally yes | UserOps can route to any ERC-4337 bundler; standard mempool |
| **Indexing / UI** | Operationally yes | If aeqi.ai is down, use Etherscan or any 4337-compatible wallet |
| **Agent operations** | Yes, but bounded | Session keys have on-chain policy limits; user revokes any time |

### Escape paths (can user take their wallet?)

Yes, completely:

1. **Use it without us** — any 4337-compatible wallet UI, point at Entity address, sign with passkey
2. **Add a different signer** — call `addSigner(metamaskAddress)` from Face ID; MetaMask can now also sign; remove passkey if desired
3. **Migrate assets out** — transfer everything to a new address

If aeqi shuts down, every Entity keeps running on-chain. Users lose our UI and agents; they keep assets, cap tables, signing authority. **The chain is the source of truth, not our database.**

## Recovery without custody

Recovery doesn't require holding keys. It requires authority to rotate signers, enforced by the smart contract itself.

### Mechanism

Entity contracts have a `recoveryFacilitator` role with **strictly bounded authority**: can ONLY propose adding a new signer, with 7-day timelock, vetoable by any existing signer.

```solidity
function proposeAddSigner(address newSigner) external {
    require(msg.sender == recoveryFacilitator, "not authorized");
    pendingSigner = newSigner;
    pendingSignerActivatesAt = block.timestamp + 7 days;
    emit RecoveryProposed(newSigner);
}

function activateAddedSigner() external {
    require(block.timestamp >= pendingSignerActivatesAt, "timelock");
    signers.add(pendingSigner);
    pendingSigner = address(0);
}

function cancelRecovery() external onlySigner {
    pendingSigner = address(0);     // ANY existing signer can veto
}
```

aeqi takes the `recoveryFacilitator` role. Authority is "ring a doorbell the user can ignore for 7 days." Custody and recovery are separate authorities; we have the second without the first.

### Three recovery layers (by frequency)

| Layer | Mechanism | Coverage |
|---|---|---|
| **1. Device sync** | iCloud Keychain / Google Password Manager auto-sync passkeys | ~95% of scenarios — invisible |
| **2. Email + timelock** | Prove identity (email OTP) → enroll new passkey on new device → 7-day timelock with warnings, cancelable from any device | Lost all devices |
| **3. Trustees** (v2, opt-in) | User designates 2-of-3 trustees; they can rotate signers without aeqi | Maximum trustlessness for power users |

## Onboarding flows

### Email + passkey

```
1. User enters email
2. 6-digit OTP verification
3. Browser prompts "Create passkey for aeqi.ai?"
4. Face ID / Touch ID / Windows Hello
5. Device Secure Enclave generates P-256 keypair
6. Public key sent to us; we compute Entity address (counterfactual)
7. Account ready

First action (agent setup, treasury action, etc.):
8. We submit UserOp deploying personal Company Entity, signed by passkey, paid by paymaster
9. Entity deployed at precomputed address
10. From then on: Face ID per transaction
```

### Google + passkey

Identical to email, but step 1-2 replaced with Google OAuth (we get verified email via standard `email` scope).

### GitHub + passkey

Identical to email, but step 1-2 replaced with GitHub OAuth + `GET /user/emails` scope call.

### MetaMask connect (SIWE)

```
1. User clicks "Connect wallet"
2. SIWE handshake (EIP-4361) — sign nonce with MetaMask
3. We have proof of EOA ownership
4. Compute Entity address with EOA as sole signer (counterfactual)
5. Prompt for email (SIWE gives no email)
6. Account ready; first action deploys Entity

User's MetaMask becomes the signer on Entity. aeqi runtime can be granted
session key for agents (optional, or require per-tx approval).
```

## Self-hosted infrastructure

| Component | Build / Adopt | Details |
|---|---|---|
| **Bundler** | Adopt `silius` (Rust) | Self-host as sibling to aeqi-platform |
| **Paymaster contract** | Write our own | ~80 lines Solidity. One per chain. |
| **Paymaster backend** | Write our own | Rust service; signs paymaster approvals based on policy |
| **AEQI Entity contract** | Write our own | Signers, cap table, roles, session keys, governance. Audit before mainnet. |
| **Entity factory** | Write our own | CREATE2 deployer; deterministic addresses |
| **Session-key module** | Write our own | On-chain policy enforcement for agent delegation (AEQI IP) |
| **EntryPoint** | Use canonical | EF-deployed singleton on every chain |

On-server topology:

```
aeqi-platform.service       (auth, users, identity)
aeqi-bundler.service        (silius, ERC-4337 mempool)
aeqi-paymaster.service      (Rust, signs paymaster approvals)
aeqi-host-<entity>.service  (per-tenant runtime)
```

Plus three contracts per chain (Base mainnet + Sepolia staging):
- AEQI Entity implementation
- AEQI Entity factory
- AEQI paymaster

## Pricing — per-Company

Each Company costs:
- **First month:** $19
- **Each month after:** $49

Since every user auto-creates a personal Company at signup, every user pays at least $49/mo. Creating additional Companies adds to the bill. Joining other Companies as a member is free.

### Why per-Company beats per-user

- Aligns with what we charge for (real on-chain Companies)
- Solo users not penalized for collaborating (cofounders each pay for themselves; one of you pays for the joint Company)
- Transparent math: $49 per Company
- Recurring revenue aligns with infra cost (paymaster, bundler, RPC, runtime)

## Glossary

| Term | Meaning |
|---|---|
| **Account Abstraction (AA)** | Accounts should be smart contracts with arbitrary logic, not just keypairs |
| **ERC-4337** | The implementation standard for AA. UserOps, EntryPoint, bundlers, paymasters. Live March 2023. What we use. |
| **EIP-7702** | Newer hybrid — EOAs can temporarily delegate to a smart contract (Pectra upgrade, 2024-2025). Additive to 4337. |
| **Smart account** | Smart-contract-based account (4337 or 7702). |
| **Passkey** | WebAuthn credential. Private key in device Secure Enclave, never extractable. |
| **WebAuthn PRF extension** | Derive signing key from passkey on-device, deterministically, never extractable. |
| **EntryPoint** | Canonical singleton contract on every EVM chain. Validates and executes UserOps. |
| **Bundler** | Off-chain service bundling UserOps and submitting to EntryPoint. We self-host (silius). |
| **Paymaster** | Contract + service paying gas on behalf of users. We self-host. |
| **UserOp** | A "pseudo-transaction" in ERC-4337. Smart account users sign this instead of a regular tx. |
| **Session key** | Scoped, time-limited, policy-bounded signer delegated to an app (us) to act within strict limits without per-action user signature. |
| **Counterfactual address** | Deterministic future address of a contract not yet deployed. We know user's Entity address before any on-chain action. |
| **SIWE** | Sign-In With Ethereum (EIP-4361). Prove EOA ownership via signature. |
