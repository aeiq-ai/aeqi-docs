# Wallet Migration: Phase 1 to Phase 2

**Status:** Shipped 2026-05-05. Passkey-native smart accounts (Phase 2) operational.

Migrate your aeqi Entity from Phase 1 (custodial EOA signer) to Phase 2 (passkey-native with on-device signing). This guide covers the `migrate-to-passkey` CLI tool.

---

## Overview

**Phase 1** — aeqi holds your signing key (EOA) on your behalf. Your assets are secured by your account login only.

**Phase 2** — You hold your own signing key in your device's Secure Enclave via a WebAuthn passkey. aeqi cannot access your keys. After migration, your Entity supports both signers; the EOA can be retired when you're ready.

This migration is **voluntary and non-destructive**. You control the timeline.

---

## When to Migrate

Migrate when you are ready to:
- Own your own signing key in your device's Secure Enclave
- Enable passwordless login via passkey
- Use your private key outside of aeqi (third-party wallets, etc.)
- Remove dependency on aeqi's key custody

Migration is not required to use aeqi. Existing Phase 1 Entities work indefinitely.

---

## Prerequisites

Before running the migration, you need:

| Item | Source | Notes |
|------|--------|-------|
| **Entity address** | Your company dashboard | Contract address of the Entity being migrated |
| **P-256 public key** | Passkey registration flow | 65-byte uncompressed key from `WebAuthn getPublicKey()` |
| **EOA private key** | aeqi ops (secure channel only) | Current custodial signer, hex-encoded |
| **Bundler running** | Local or hosted | `aeqi-bundler` at `http://127.0.0.1:3000` (local) |
| **Entity contract** | Phase 2 deployment | Smart contract must support `addSigner(uint8,bytes32,bytes32)` |

### Extract the P-256 public key

When your user completes passkey enrollment in your application, extract the public key from the WebAuthn credential:

```typescript
// In your passkey registration flow
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: ...,
    rp: { name: "aeqi", id: "aeqi.io" },
    user: { id: new Uint8Array(16), name, displayName: name },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256 (P-256)
    attestation: "direct",
  },
});

// Extract the public key
const pubkeyArrayBuffer = credential.response.getPublicKey();
const pubkeyHex = Buffer.from(pubkeyArrayBuffer).toString("hex");
console.log(pubkeyHex); // 04<64 bytes>
```

The resulting hex string is 130 characters (65 bytes, with `04` prefix for uncompressed format). Pass this to `migrate-to-passkey --pubkey`.

---

## Running the Migration

### Build the CLI tool

```bash
git clone https://github.com/aeqiai/aeqi.git
cd aeqi
cargo build -p aeqi-paymaster --bin migrate_to_passkey --release
```

The binary is at `./target/release/migrate_to_passkey`.

### Dry run (always start here)

Before committing to a migration, always inspect the UserOp first:

```bash
./target/release/migrate_to_passkey \
  --entity 0xYourEntityAddress \
  --pubkey 04<your-p256-hex-key> \
  --eoa-key <your-eoa-hex-private-key> \
  --dry-run
```

**Output:**
```
user_op_hash: 0x<32-byte-hex>
Dry run — UserOp not submitted.
```

Review the encoded calldata in the logs before proceeding. No on-chain state is modified.

### Execute the migration

Once you've verified the dry run:

```bash
./target/release/migrate_to_passkey \
  --entity 0xYourEntityAddress \
  --pubkey 04<your-p256-hex-key> \
  --eoa-key <your-eoa-hex-private-key> \
  --bundler http://127.0.0.1:3000 \
  --entry-point 0x0000000071727De22E5E9d8BAf0edAc6f37da032 \
  --chain-id 8453
```

**Output on success:**
```
user_op_hash: 0x<32-byte-hex>
tx_hash:      0x<32-byte-hex>
Migration complete. Entity 0xYourEntityAddress now has a P-256 signer.
```

### Command-line reference

| Flag | Required | Default | Notes |
|------|----------|---------|-------|
| `--entity` | Yes | — | Contract address of the Entity |
| `--pubkey` | Yes | — | P-256 public key, hex-encoded (see formats below) |
| `--eoa-key` | Yes | — | EOA private key, hex-encoded (no `0x` prefix) |
| `--bundler` | No | `http://127.0.0.1:3000` | Bundler JSON-RPC endpoint |
| `--entry-point` | No | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | ERC-4337 EntryPoint address |
| `--chain-id` | No | `31337` | Chain ID (decimal). Use `8453` for Base mainnet, `84532` for Base Sepolia |
| `--dry-run` | No | `false` | Print UserOp without submitting |

### Accepted public key formats

| Format | Length | Example |
|--------|--------|---------|
| Uncompressed (preferred) | 65 bytes | `04` + 32-byte X + 32-byte Y |
| Raw X\|\|Y | 64 bytes | 32-byte X + 32-byte Y (no `04` prefix) |

Compressed keys (33 bytes, `02`/`03` prefix) are **not supported**.

---

## What Happens During Migration

1. **Parse inputs** — Validates Entity address, P-256 key, and EOA key.
2. **Encode calldata** — ABI-encodes `addSigner(uint8 kind=1, bytes32 pubkeyX, bytes32 pubkeyY)`.
3. **Build UserOp** — Constructs an ERC-4337 UserOperation with the Entity as `sender`.
4. **Sign** — Signs the UserOp with your current EOA private key.
5. **Submit** — Sends `eth_sendUserOperation` to the bundler.
6. **Poll** — Waits for `eth_getUserOperationReceipt` (up to 60 seconds, 2-second intervals).
7. **Return** — Prints UserOp hash and transaction hash on success.

**On success:** Your Entity now has **two signers** (EOA + P-256). Either signer can authorize transactions.

---

## Recovery: The Timelocked Facilitator

aeqi holds a timelocked `recoveryFacilitator` role on your Entity contract. This role **does not activate** during migration — it only applies if you lose access to both your passkey and your EOA key.

If you lose device access:
1. Contact aeqi support with proof of identity.
2. aeqi initiates a 7-day recovery timelock for signer rotation.
3. If you regain access, you can veto the recovery.
4. After 7 days, aeqi can add a new signer on your behalf.

This migration does NOT use the recovery path. You remain in full control of your entity.

---

## Verify Success

After the tool reports completion, verify on-chain that the passkey signer was added:

```bash
# Check signer count (should be 2)
cast call 0xYourEntityAddress "getSignerCount()(uint256)" --rpc-url https://mainnet.base.org
# Expected: 2

# Inspect the SignerAdded event
cast receipt 0xTransactionHashFromOutput --rpc-url https://mainnet.base.org | grep SignerAdded
```

You can now sign with your passkey in any aeqi application that supports passkey login.

---

## Removing the EOA Signer

**Optional:** After you've verified passkey login works and you're confident in your passkey recovery process, you can remove the EOA signer to fully migrate to Phase 2:

```bash
# From your Entity owner (via EOA or passkey)
cast send 0xYourEntityAddress "removeSigner(uint8,bytes32,bytes32)" 0 <X_COORDINATE> <Y_COORDINATE>
```

Once removed, only your passkey can authorize transactions. Ensure you have a secure passkey backup before removing the EOA signer.

---

## Caveats and Limitations

### Nonce Collision

The migration uses nonce `0x0` by default. If your Entity has already processed other UserOps, the bundler will reject with error `AA25` (invalid nonce).

**Check your current nonce:**
```bash
cast call 0x0000000071727De22E5E9d8BAf0edAc6f37da032 \
  "getNonce(address,uint192)(uint256)" 0xYourEntityAddress 0 \
  --rpc-url https://mainnet.base.org
```

If nonce is not `0`, the migration tool cannot proceed with this initial version. Contact aeqi support for a workaround.

### EOA Key Security

The `--eoa-key` flag accepts raw hex. **Never inline private keys in shell history.** Use a secrets manager:

```bash
# Good: via environment variable or secrets manager
EOA_KEY=$(vault kv get -field=key secret/aeqi/entity-signer)
./migrate_to_passkey --eoa-key "$EOA_KEY" ...

# Bad: inline
./migrate_to_passkey --eoa-key abc123def456... ...
```

### Gas and Sponsorship

The migration does **not** request paymaster sponsorship. Your Entity must have sufficient ETH for gas (typically 50–150k gas depending on contract overhead).

If gas is a blocker, contact aeqi support. Paymaster integration is planned for Phase 2.2.

### Bundler Availability

The bundler must be running and healthy before migration. Verify with:

```bash
curl -s http://127.0.0.1:3000 \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Should return "0x7a69" (31337 in decimal)
```

---

## Rollback

There is **no automatic rollback**. Adding a signer is additive and immutable on-chain. If you want to undo the migration:

1. You can remove the passkey signer via `removeSigner(...)` once it's added.
2. Your Entity will revert to EOA-only signing.
3. Ensure at least one signer remains at all times (contract enforces this).

---

## Troubleshooting

### "invalid --entity address"
Ensure the Entity address starts with `0x` or is a valid hex string. Example: `0x1234567890abcdef...` (40 hex chars after `0x`).

### "invalid --pubkey"
The pubkey must be either:
- 65 bytes (130 hex chars) with `04` prefix: `04<X><Y>`
- 64 bytes (128 hex chars) without prefix: `<X><Y>`

Verify format with: `echo -n "<pubkey>" | wc -c` should return 128 or 130.

### "bundler error: AA25 (invalid nonce)"
Your Entity has already processed UserOps. Query the current nonce and contact aeqi support.

### "bundler error: insufficient funds"
Your Entity does not have enough ETH for gas. Transfer ETH to the Entity address and retry.

### "timeout polling for receipt"
The bundler did not include your UserOp in a block within 60 seconds. This can happen during network congestion. The operation may still succeed on-chain. Check the `user_op_hash` via a block explorer or wait and retry.

---

## Testing (for developers)

If you are contributing to aeqi or testing the migration tool:

```bash
# Unit tests (no external deps)
cargo test -p aeqi-paymaster --test it_migrate_to_passkey

# Integration tests (requires live stack)
export ANVIL_URL=http://127.0.0.1:8545
export BUNDLER_URL=http://127.0.0.1:3000
export ENTITY_ADDR=0x<mock-entity-address>
export EOA_KEY=<hex-private-key>
cargo test -p aeqi-paymaster --test it_migrate_to_passkey -- --nocapture
```

Tier 1 tests run in CI. Tier 2 tests are automatically skipped if `ANVIL_URL` is not set.

---

## Next Steps

- **Login:** Use your passkey to sign in to aeqi applications.
- **Backup:** Ensure your passkey is backed up (platform-dependent; iOS Keychain, Windows Hello, etc.).
- **Retire EOA:** Once confident, remove the EOA signer via `removeSigner(...)`.
- **Governance:** Your Entity contract is now ready for multi-signer governance, session keys, and delegated execution.

For questions or issues, contact aeqi support or open an issue on [GitHub](https://github.com/aeqiai/aeqi).
