# ERC-4337 UserOperation Lifecycle

This document describes the end-to-end lifecycle of an ERC-4337 v0.7 UserOperation on aeqi, from sponsorship request through on-chain execution.

## Stack Overview

| Component | Address / Port | Notes |
|---|---|---|
| Anvil (EVM) | `http://127.0.0.1:8545` | chain ID 31337 |
| EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | ERC-4337 entry point |
| rundler bundler | `http://127.0.0.1:3000` | Alchemy's ERC-4337 bundler |
| aeqi-paymaster API | `http://127.0.0.1:3001` | ERC-7677 compatible paymaster service |
| Paymaster.sol | deployed per network | Sponsor contract |
| SimpleAccount | deployed per account | Minimal ERC-4337 smart account |

## Phase 1: Off-chain Sponsorship Request

The wallet requests gas sponsorship from the paymaster service.

```
POST http://127.0.0.1:3001/paymaster/sponsor
{
  "sender": "0x...",
  "nonce": 0,
  "callData": "0x...",
  "gasLimits": { ... }
}
```

The paymaster service:

1. **Checks sponsorship eligibility** — verifies the sender has remaining budget
2. **Computes validity window** — `validUntil = now() + 900s`, `validAfter = 0`
3. **Constructs the signing digest** (64 bytes total):
   ```
   keccak256(
     userOpHash        [32 bytes]  ← hash of UserOp fields + chainId + EntryPoint
     validUntil        [ 6 bytes]  ← uint48, big-endian
     validAfter        [ 6 bytes]  ← uint48, big-endian
     paymaster_addr    [20 bytes]  ← deployed Paymaster contract address
   )
   ```
4. **Signs the digest** with the paymaster private key (secp256k1, no eth_sign prefix)
5. **Returns the response**:
   ```json
   {
     "paymasterAndData": "0x<addr(20)><validUntil(6)><validAfter(6)><sig(65)>",
     "signature": "0x<sig(65)>",
     "validUntil": <unix timestamp>
   }
   ```

**Important**: The `userOpHash` passed to the paymaster is computed with a stub `paymasterAndData` (address + validity window only, no signature). The account owner signs the final UserOp hash separately in Phase 2.

## Phase 2: Off-chain Account Signature

Once the `paymasterAndData` is known, the wallet computes the final `getUserOpHash()` and signs it with the account owner's private key.

SimpleAccount uses the eth_sign prefix:

```
signingHash = keccak256("\x19Ethereum Signed Message:\n32" ++ getUserOpHash())
signature   = sign(signingHash, ownerPrivateKey)  # 65-byte ECDSA
```

The `cast wallet sign` command produces the correct signature:

```bash
cast wallet sign --no-hash <getUserOpHash_hex> --private-key <ownerKey>
```

## Phase 3: On-chain Bundler Submission

The wallet submits the UserOperation to the bundler via JSON-RPC.

```
eth_sendUserOperation
  params: [userOp, entryPointAddress]
```

The bundler:

1. **Simulates validation** — calls `EntryPoint.simulateValidation(userOp)` to check:
   - `IAccount.validateUserOp()` — validates owner signature
   - `IPaymaster.validatePaymasterUserOp()` — validates paymaster signature
2. **Holds in mempool** — waits for inclusion (near-instant on anvil)
3. **Submits for execution** — calls `EntryPoint.handleOps([userOp], beneficiary)`

## Phase 4: On-chain Execution

The EntryPoint executes the UserOperation.

```
EntryPoint.handleOps()
  │
  ├─ validateUserOp(userOp, missingFunds)
  │  SimpleAccount:
  │    • Recovers signer from eth_sign_prefixed_hash
  │    • Asserts signer == owner
  │    • Self-funds if no paymaster sponsor available
  │
  ├─ validatePaymasterUserOp(userOp, userOpHash, maxCost)
  │  Paymaster.sol:
  │    • Decodes paymasterAndData: validUntil, validAfter, signature
  │    • Reconstructs digest: keccak256(userOpHash || validUntil || validAfter || address(this))
  │    • Recovers signer via ECDSA.recover()
  │    • Asserts signer == authorizedSigner
  │    • Asserts block.timestamp in [validAfter, validUntil]
  │    • Returns context and validationData
  │
  ├─ execute(target, value, callData)
  │  Executes the account's intent (e.g., transfer tokens, call contract)
  │
  └─ postOp(context, actualGasCost)
     Paymaster deducts gas cost from its EntryPoint deposit
```

## Measured Gas Costs

Self-paying UserOperation (no paymaster sponsor) on anvil with a no-op execution:

| Metric | Value |
|---|---|
| actualGasUsed | 184,266 gas |
| actualGasCost | ~0.000184 ETH |
| Effective gas price | ~1 gwei (anvil default) |
| Block production latency | < 2 seconds |
| Receipt confirmation | 1 block |

## Signature Flow Summary

Two independent signatures protect the UserOperation:

```
Owner key    ──sign──►  eth_sign(getUserOpHash())  ──►  UserOp.signature
                                                         (65 bytes)

Paymaster key ──sign──► keccak256(
                          userOpHash(32)
                          validUntil(6)
                          validAfter(6)
                          paymaster_addr(20)
                        )  ──►  paymasterData.sig
                               (65 bytes, NO eth_sign prefix)
```

**Key difference**: The paymaster signer does NOT use the eth_sign prefix. The digest is a raw `keccak256` over packed fields. Paymaster.sol uses `ECDSA.recover(hash, sig)` for verification (not `toEthSignedMessageHash`).

## ERC-4337 v0.7 paymasterAndData Layout

The `paymasterAndData` field encodes the paymaster contract address, gas limits, validity window, and sponsorship signature.

```
Offset  Field                          Size
[0:20]  paymaster address              20 bytes
[20:36] paymasterVerificationGasLimit  16 bytes (uint128)
[36:52] paymasterPostOpGasLimit        16 bytes (uint128)
[52:58] validUntil                     6 bytes  (uint48)
[58:64] validAfter                     6 bytes  (uint48)
[64:129] signature                     65 bytes
───────────────────────────────────────────────
Total:                                 129 bytes
```

When constructing `paymasterAndData`, include the gas limits even if they are zero. The EntryPoint and bundler expect the full v0.7 layout.

## Reference

- [ERC-4337: Account Abstraction Using Alt Mempool](https://eips.ethereum.org/EIPS/eip-4337)
- [ERC-7677: Paymaster JSON-RPC Service](https://eips.ethereum.org/EIPS/eip-7677)
- [rundler Documentation](https://docs.stackup.sh/docs/bundler/network-configuration)
