# IPFS Content Addressing (CID Handling)

This guide explains how aeqi handles IPFS Content Identifiers (CIDs). The
format depends on the storage layer: on-chain account fields on Solana, or
off-chain JSON documents in IPFS.

## Overview

The core principle: **IPFS CIDs are serialized differently depending on their
storage layer.**

- **On-chain (Solana programs)**: the ASCII bytes of the CID string in a
  fixed-size `[u8; 64]` account field, serialized with Borsh.
- **Off-chain (IPFS documents)**: standard string format (`Qm...` or
  `bafy...`).

aeqi's on-chain layer is the Solana/Anchor program suite under
`projects/aeqi-solana/`. An earlier EVM layer used a different convention
(`0x`-prefixed hex encoding); that layer is retired and covered at the end of
this guide for historical context only.

## On-Chain: Solana Account Fields

Solana program accounts that reference IPFS content carry the CID as a
fixed-size byte array:

```rust
// aeqi-role/src/state.rs
pub ipfs_cid: [u8; 64],

// aeqi-governance — proposals carry the same field shape
pub ipfs_cid: [u8; 64],
```

The field holds the ASCII bytes of the standard CID string, padded to 64
bytes. Both CIDv0 (`Qm...`, 46 characters) and CIDv1 base32 (`baf...`, 59+
characters) fit. Anchor serializes the array with Borsh — there is no hex
encoding and no `0x` prefix anywhere on this path.

```typescript
// Pack a CID string into the fixed 64-byte on-chain field
function cidToBytes(cidString: string): Uint8Array {
  const bytes = new TextEncoder().encode(cidString);
  if (bytes.length > 64) throw new Error("CID exceeds 64 bytes");
  const out = new Uint8Array(64); // zero-padded
  out.set(bytes);
  return out;
}

// Read it back for display or IPFS retrieval
function bytesToCid(field: Uint8Array): string {
  let end = field.length;
  while (end > 0 && field[end - 1] === 0) end--;
  return new TextDecoder().decode(field.subarray(0, end));
}
```

Used in:

- `aeqi-role` — role configuration documents (`ipfs_cid` on the role account).
- `aeqi-governance` — proposal documents (`ipfs_cid` on the proposal account).

## Off-Chain: Standard String Format

All CIDs stored within IPFS documents use standard string format — no
encoding of any kind.

**Format:** Regular CID strings (`Qm...` or `bafy...`)

**Used in:**

- References array within IPFS JSON documents
- Cross-references between IPFS documents
- Any CID stored as a value in an IPFS-hosted document

**Example:**

```typescript
const ipfsData = {
  version: 1,
  timestamp: Date.now(),
  createdAt: new Date().toISOString(),
  references: [
    {
      type: 'operating-agreement',
      ipfsCid: 'QmXyzABC123...', // Standard string format
      description: 'Operating Agreement',
    },
    {
      type: 'governance-config',
      ipfsCid: 'bafyXXX...',     // Both v0 and v1 formats accepted
      description: 'Governance Configuration',
    },
  ],
};

// Upload to IPFS as normal
const resultCid = await pinToIPFS(JSON.stringify(ipfsData));
```

Nested references stay in string form at every depth — only the final
on-chain write converts to the fixed byte-array field:

```typescript
// 1. Create inner documents (e.g., operating agreement)
const agreementCid = await pinToIPFS(operatingAgreementPDF);

// 2. Create parent document with references (string format)
const parentData = {
  version: 1,
  name: 'My Company',
  references: [
    { type: 'operating-agreement', ipfsCid: agreementCid, description: 'Operating Agreement' },
  ],
};

// 3. Upload parent
const parentCid = await pinToIPFS(JSON.stringify(parentData));

// 4. Store parent on-chain (fixed 64-byte field, Borsh-serialized)
const cidField = cidToBytes(parentCid);
```

## CID Format Validation

Validate CID format before packing or after unpacking:

```typescript
function isValidCidString(cid: string): boolean {
  // CIDv0: base58 SHA-256, always "Qm" + 44 base58 chars (46 total)
  if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid)) return true;

  // CIDv1: multibase prefix (base32 "bafy"/"bafk"/"bafyb"…), 59+ chars.
  // Match the "baf" prefix + base32 alphabet rather than a bare "ba" so
  // arbitrary "ba…" strings don't pass validation.
  if (/^baf[a-z2-7]{56,}$/.test(cid)) return true;

  return false;
}

// Usage
if (!isValidCidString(userInput)) {
  throw new Error('Invalid CID format. Must be a CIDv0 (Qm…) or CIDv1 (baf…).');
}
```

## Common Pitfalls

1. **DO NOT** encode CIDs within IPFS documents.
   - Inside IPFS JSON, CIDs are always standard strings.
   - Only convert to the byte-array form at the on-chain write.

2. **DO NOT** mix formats within the same storage layer.
   - On-chain: the fixed `[u8; 64]` ASCII field.
   - Off-chain (IPFS): standard strings.

3. **ALWAYS** validate CID format before conversion.
   - Malformed CIDs can cause silent errors downstream.

4. **ALWAYS** test round-trip conversions.
   - Pack → store → unpack → fetch should yield the original document.

## Historical: The Retired EVM Encoding

aeqi's earlier EVM contract layer stored CIDs hex-encoded with a `0x` prefix,
because EVM `bytes` arguments are not UTF-8 strings:

```typescript
// Retired EVM pattern — do not use on the Solana layer.
function encodeCidForContract(cidString: string): `0x${string}` {
  return `0x${Buffer.from(cidString).toString('hex')}` as `0x${string}`;
}

function decodeCidFromContract(cidHex: `0x${string}`): string {
  return Buffer.from(cidHex.slice(2), 'hex').toString();
}
```

This convention accompanied the retired EVM factory (`registerTRUST`,
TypeChain factories, `writeContractAsync`). None of it applies to the current
Solana programs — if you encounter `0x`-hex CID handling in older material,
treat it as historical. `registerTRUST` was an on-chain contract function
name kept verbatim in that era's code; the product noun in prose is
"Company".

## See Also

- **[Factory Flow Reference](/docs/factory-flow)** - the current Solana/Anchor factory: programs, Company and Template PDAs, and the create/register/instantiate instructions
- **[IPFS Content Addressing](https://docs.ipfs.tech/concepts/content-addressing/)** - CID specification and format versions
- **[Anchor framework](https://www.anchor-lang.com/)** - the Borsh-based serialization used by aeqi's Solana programs
