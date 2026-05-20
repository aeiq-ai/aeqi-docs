# IPFS Content Addressing (CID Handling)

This guide explains how aeqi handles IPFS Content Identifiers (CIDs) — the standard format depends on whether the CID is stored on-chain in smart contracts or off-chain in IPFS documents.

## Overview

The core principle: **IPFS CIDs are serialized differently depending on their storage layer.**

- **On-chain (smart contracts)**: hex-encoded with `0x` prefix
- **Off-chain (IPFS documents)**: standard string format (Qm... or bafy...)

This separation ensures compatibility with contract ABIs while maintaining IPFS conventions for document references.

## Storage Formats

### On-Chain: Hex-Encoded CIDs

All CIDs stored in smart contracts MUST be hex-encoded with a `0x` prefix.

**Format:** `0x${hexEncodedCID}`

**Used in:**

- `Factory.registerTRUST()` — ipfsCid parameter
- Role configurations — ipfsCid field
- Budget configurations — ipfsCid field
- Treasury / transaction records — any field referencing IPFS content
- Any contract function accepting a CID parameter

**Example:**

```typescript
// Original CID (standard string)
const cidString = 'QmXyzABC123...';

// Convert for on-chain storage
const cidForContract = `0x${Buffer.from(cidString).toString('hex')}` as `0x${string}`;

// Usage in contract interaction
await writeContractAsync({
  address: factoryAddress,
  abi: Factory__factory.abi,
  functionName: 'registerTRUST',
  args: [cidForContract, /* ... other args ... */],
});
```

### Off-Chain: Standard String Format

All CIDs stored within IPFS documents use standard string format — no hex encoding.

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

## Conversion Patterns

### String to Contract (Encoding)

Use when sending a CID to any contract function:

```typescript
function encodeCidForContract(cidString: string): `0x${string}` {
  return `0x${Buffer.from(cidString).toString('hex')}` as `0x${string}`;
}

// Usage
const ipfsCid = 'QmABC...';
const encoded = encodeCidForContract(ipfsCid);
// Result: '0xQm...' (hex-encoded)
```

### Contract to String (Decoding)

Use when reading a CID from contract storage for display or IPFS retrieval:

```typescript
function decodeCidFromContract(cidHex: `0x${string}`): string {
  return Buffer.from(cidHex.slice(2), 'hex').toString();
}

// Usage
const hexCid = '0xABC...'; // from contract read
const cidString = decodeCidFromContract(hexCid);
// Result: 'QmABC...' (standard string)
```

## Implementation Recipes

### Recipe 1: Upload to IPFS and Store on-Chain

```typescript
// 1. Generate data
const trustConfig = {
  version: 1,
  roles: [{ id: 'founder', address: '0x123...' }],
};

// 2. Upload to IPFS (returns standard string CID)
const ipfsCid = await pinToIPFS(JSON.stringify(trustConfig));
// ipfsCid: 'QmXyzABC123...'

// 3. Encode for contract
const cidForContract = encodeCidForContract(ipfsCid);

// 4. Store on-chain
await writeContractAsync({
  address: factoryAddress,
  abi: Factory__factory.abi,
  functionName: 'registerTRUST',
  args: [cidForContract, /* ... */],
});
```

### Recipe 2: Read from Chain and Fetch from IPFS

```typescript
// 1. Read from smart contract
const trustConfig = await readContract({
  address: trustAddress,
  abi: TRUST__factory.abi,
  functionName: 'getConfig',
});
// trustConfig.ipfsCid: '0xABC...' (hex-encoded)

// 2. Decode to standard format
const cidString = decodeCidFromContract(trustConfig.ipfsCid);

// 3. Fetch from IPFS
const ipfsData = await fetchFromIPFS(cidString);
// ipfsData: the original JSON document
```

### Recipe 3: Nested IPFS References

```typescript
// 1. Create inner documents (e.g., operating agreement)
const agreementCid = await pinToIPFS(operatingAgreementPDF);

// 2. Create parent document with references (use string format)
const parentData = {
  version: 1,
  name: 'My TRUST',
  references: [
    {
      type: 'operating-agreement',
      ipfsCid: agreementCid, // Standard string — no encoding!
      description: 'Operating Agreement',
    },
  ],
};

// 3. Upload parent
const parentCid = await pinToIPFS(JSON.stringify(parentData));

// 4. Store parent on-chain (now with encoding)
const cidForContract = encodeCidForContract(parentCid);
await registerWithFactory(cidForContract);
```

## CID Format Validation

Validate CID format before encoding or decoding:

```typescript
function isValidCidString(cid: string): boolean {
  // CIDv0: Starts with "Qm", exactly 46 characters
  if (cid.startsWith('Qm') && cid.length === 46) return true;
  
  // CIDv1: Starts with "ba", 59+ characters
  if (cid.startsWith('ba') && cid.length >= 59) return true;
  
  return false;
}

function isValidCidHex(cidHex: string): boolean {
  // Must start with 0x and be valid hex
  return /^0x[0-9a-f]+$/i.test(cidHex);
}

// Usage
if (!isValidCidString(userInput)) {
  throw new Error('Invalid CID format. Must start with Qm or ba.');
}
```

## Common Pitfalls

1. **DO NOT** hex-encode CIDs within IPFS documents.
   - Inside IPFS JSON, CIDs are always standard strings.
   - Only encode at the contract boundary.

2. **DO NOT** send raw CID strings to contract functions.
   - Contracts expect hex-encoded bytes, not UTF-8 strings.
   - Always encode before contract interaction.

3. **DO NOT** mix formats within the same storage layer.
   - On-chain: all hex-encoded.
   - Off-chain (IPFS): all standard strings.

4. **ALWAYS** validate CID format before conversion.
   - Malformed CIDs can cause silent encoding errors.
   - Use validation functions before processing.

5. **ALWAYS** test round-trip conversions.
   - Encode → store → decode → fetch should yield original data.

## Testing CID Round-Trips

```typescript
// Test both directions
async function testCidRoundTrip() {
  // Original CID (standard string)
  const originalCid = 'QmXyzABC123...';
  
  // Encode for contract
  const encoded = encodeCidForContract(originalCid);
  console.assert(encoded.startsWith('0x'), 'Should be hex-prefixed');
  
  // Decode back
  const decoded = decodeCidFromContract(encoded);
  
  // Should match original
  console.assert(decoded === originalCid, 'Round-trip should preserve CID');
  
  // Verify via IPFS fetch
  const ipfsContent = await fetchFromIPFS(decoded);
  console.assert(ipfsContent, 'IPFS fetch should work');
}
```

## See Also

- **[Factory Flow Reference](/docs/factory-flow)** - how Factory uses ValueConfigs with CIDs for TRUST configuration
- **[Solana Program Anchor Documentation](https://www.anchor-lang.com/)** - for on-chain serialization patterns
- **[IPFS Content Addressing](https://docs.ipfs.tech/concepts/content-addressing/)** - CID specification and format versions
