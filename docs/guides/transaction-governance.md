# Transaction and Governance Best Practices

This document outlines best practices for handling transactions and governance operations in the aeqi platform. These patterns ensure consistency, security, and excellent user experience across the entire application.

> **Chain context.** The code in this guide is the **EVM** layer: wagmi hooks
> (`useWriteContract`, `writeContractAsync`), TypeChain factories
> (`TRUST__factory`, `TokenModule__factory`, `FundingModule__factory`), and
> `0x`-prefixed addresses/calldata. aeqi's Solana governance programs (under
> `projects/aeqi-solana/`) expose the same logical operations through Anchor,
> not these factory patterns — don't copy these snippets onto the Solana layer.
> Identifiers containing `TRUST` (`TRUST__factory`, `trustContract`,
> `trust_address`) are on-chain contract/protocol names and are kept verbatim;
> user-facing prose says "Company".

## Table of Contents

- [Transaction Handling](#transaction-handling)
- [Governance Proposals](#governance-proposals)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [UI/UX Guidelines](#uiux-guidelines)
- [Code Examples](#code-examples)

## Transaction Handling

### 1. Always Use Transaction Context Wrapper

**Never** call contract methods directly. Always wrap them with the transaction context for consistent UX.

```typescript
// ❌ Bad - Direct contract call
await writeContract({
  address: contractAddress,
  abi: SomeModule__factory.abi,
  functionName: 'someFunction',
  args: [arg1, arg2],
});

// ✅ Good - Using transaction wrapper
await wrapTransaction(
  async () => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: SomeModule__factory.abi,
      functionName: 'someFunction',
      args: [arg1, arg2],
    });
    return hash;
  },
  {
    pendingTitle: 'Processing Transaction',
    pendingDescription: 'Your transaction is being processed...',
    successTitle: 'Transaction Successful',
    successDescription: 'Your transaction has been completed',
    errorTitle: 'Transaction Failed',
    onSuccess: () => {
      // Handle success (e.g., close modal, refresh data)
    },
  },
);
```

### 2. Transaction Context Options

Always provide meaningful, user-friendly messages:

```typescript
interface TransactionOptions {
  pendingTitle: string; // Short, action-oriented title
  pendingDescription: string; // Clear description of what's happening
  successTitle: string; // Confirmation title
  successDescription: string; // What was accomplished
  errorTitle: string; // Error title
  metadata?: Record<string, any>; // Additional data for logging
  onSuccess?: () => void; // Success callback
  onError?: (error: Error) => void; // Error callback
}
```

### 3. Hook Pattern for Contract Interactions

Create dedicated hooks for complex contract interactions:

```typescript
export function useModuleAction() {
  const { writeContractAsync } = useWriteContract();
  const { wrapTransaction } = useTransaction();

  const performAction = useCallback(
    async (params: ActionParams) => {
      return wrapTransaction(
        async () => {
          // Build calldata if needed
          const calldata = buildCalldata(params);

          // Execute transaction
          const hash = await writeContractAsync({
            address: params.moduleAddress,
            abi: Module__factory.abi,
            functionName: 'actionFunction',
            args: [calldata],
          });

          return hash;
        },
        {
          pendingTitle: 'Performing Action',
          pendingDescription: `Processing ${params.actionName}...`,
          successTitle: 'Action Complete',
          successDescription: `Successfully completed ${params.actionName}`,
          errorTitle: 'Action Failed',
        },
      );
    },
    [writeContractAsync, wrapTransaction],
  );

  return { performAction };
}
```

## Governance Proposals

### 1. Centralized Proposal Creation

All proposals MUST go through the global proposal modal. Never create proposals directly.

```typescript
// ❌ Bad - Direct proposal creation
const proposalCid = await uploadToIPFS(proposalData);
await governanceContract.propose(...);

// ✅ Good - Using proposal modal
openProposalModal({
  title: 'Update Configuration',
  description: 'Updating system configuration...',
  executionDetails: {
    targets: [targetAddress],
    calldatas: [calldata],
    values: ['0'],
  },
  governanceAddress: trustContract.governanceContract?.id,
  governanceConfigId: governancePower?.activeGovernanceType,
});
```

### 2. Proposal Modal Configuration

The proposal modal handles the complete flow:

1. User input (title, description, reasoning, impact)
2. IPFS upload
3. Governance contract interaction
4. Transaction wrapping

```typescript
interface ProposalModalConfig {
  title: string; // Default title
  description: string; // Default description
  executionDetails: {
    targets: string[]; // Contract addresses to call
    calldatas: string[]; // Encoded function calls
    values: string[]; // ETH values (usually '0')
    humanReadable?: string[]; // Human-readable descriptions
  };
  governanceAddress?: string; // Governance contract address
  governanceConfigId?: string; // For role-based governance
  onComplete?: () => void; // Success callback
}
```

### 3. Calldata Generation

Always generate calldata using contract factories:

```typescript
// For Company configuration updates (TRUST is the on-chain contract name)
const calldata = TRUST__factory.createInterface().encodeFunctionData(
  'setBytesConfig',
  [
    keccak256(toHex('trust')), // key
    keccak256(toHex('trust.ipfsCid')), // id
    stringToHex(ipfsCid), // value
  ],
) as `0x${string}`;

// For module-specific actions
const calldata = FundingModule__factory.createInterface().encodeFunctionData(
  'advanceFunding',
  [],
) as `0x${string}`;
```

### 4. Proposal Decoding

Maintain the proposal decoder for human-readable action descriptions:

```typescript
// In proposal-decoder.ts
export const FUNCTION_SIGNATURES = {
  '0x4b4f9a2d': {
    name: 'advanceFunding',
    icon: DollarSign,
    description: 'Advance to next funding round',
    abi: 'function advanceFunding()',
  },
  // Add all governance-executable functions
};
```

## Error Handling

### 1. User-Friendly Error Messages

Transform technical errors into understandable messages:

```typescript
try {
  await performAction();
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    toast.error('Insufficient balance to perform this action');
  } else if (error.message.includes('user rejected')) {
    toast.info('Transaction cancelled');
  } else {
    toast.error('Transaction failed. Please try again.');
    console.error('Transaction error:', error);
  }
}
```

### 2. Validation Before Submission

Always validate before initiating transactions:

```typescript
// Check governance power
if (!governancePower?.canPropose) {
  toast.error('You do not have permission to create proposals');
  return;
}

// Validate addresses
if (!isAddress(delegateAddress)) {
  toast.error('Please enter a valid address');
  return;
}

// Check balances
if (amount > balance) {
  toast.error('Amount exceeds available balance');
  return;
}
```

## Security Considerations

### 1. Input Validation

Always validate user inputs:

```typescript
// Address validation
const isValidAddress = (address: string): boolean => {
  return address.startsWith('0x') && address.length === 42;
};

// Amount validation
const isValidAmount = (amount: string, decimals: number): boolean => {
  try {
    const value = parseUnits(amount, decimals);
    return value > 0n;
  } catch {
    return false;
  }
};

// IPFS CID validation
const isValidIpfsCid = (cid: string): boolean => {
  return cid.startsWith('Qm') || cid.startsWith('bafy');
};
```

### 2. Access Control

Check permissions before showing UI elements:

```typescript
// Check if user can create proposals
const canPropose = governancePower?.canPropose || false;

// Check if user can execute
const canExecute =
  proposal.state === 'succeeded' && (hasRole('EXECUTOR_ROLE') || isProposer);

// Role-based access
const hasRequiredRole = userRoles.includes(requiredRole);
```

### 3. Calldata Verification

Never trust external calldata:

```typescript
// Decode and verify calldata before display
const decoded = decodeProposalAction(call);
if (!decoded || decoded.name === 'Unknown') {
  console.warn('Unable to decode action:', call);
  // Show raw data with warning
}
```

## UI/UX Guidelines

### 1. Loading States

Show appropriate loading indicators:

```typescript
// Button loading state
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="animate-spin" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>

// Full-screen transaction modal (handled by context)
// Automatically shows animated aeqi logo with status
```

### 2. Success Feedback

Provide clear success confirmation:

```typescript
onSuccess: () => {
  // Close modals
  setIsModalOpen(false);

  // Show success toast (if not handled by transaction context)
  toast.success('Operation completed successfully');

  // Refresh data if needed
  refetch();
};
```

### 3. Progressive Disclosure

Don't overwhelm users with technical details:

```typescript
// Simple view by default
<div>
  <h3>Update Configuration</h3>
  <p>Change your configuration</p>
</div>;

// Advanced details on expansion
{
  showAdvanced && (
    <div>
      <p>Target: {target}</p>
      <p>Function: {functionName}</p>
      <p>Calldata: {calldata}</p>
    </div>
  );
}
```

## Code Examples

### Complete Module Action Example

```typescript
// hooks/modules/useModuleUpdate.ts
export function useModuleUpdate() {
  const { writeContractAsync } = useWriteContract();
  const { wrapTransaction } = useTransaction();
  const { openProposalModal } = useProposalModal();

  const updateModule = useCallback(
    async ({
      trustContract,
      moduleId,
      newImplementation,
      requiresProposal = true,
    }: UpdateModuleParams) => {
      // Build calldata
      const calldata = TRUST__factory.createInterface().encodeFunctionData(
        'setModule',
        [moduleId, newImplementation, true],
      ) as `0x${string}`;

      if (requiresProposal) {
        // Create proposal for module update
        openProposalModal({
          title: 'Update Module',
          description: `Updating configuration`,
          executionDetails: {
            targets: [trustContract.id],
            calldatas: [calldata],
            values: ['0'],
          },
          governanceAddress: trustContract.governanceContract?.id,
          governanceConfigId: EMPTY_BYTES,
        });
      } else {
        // Direct execution (for admins)
        await wrapTransaction(
          async () => {
            const hash = await writeContractAsync({
              address: trustContract.id as Address,
              abi: TRUST__factory.abi,
              functionName: 'setModule',
              args: [moduleId, newImplementation, true],
            });
            return hash;
          },
          {
            pendingTitle: 'Updating Configuration',
            pendingDescription: `Installing new implementation`,
            successTitle: 'Configuration Updated',
            successDescription: 'Configuration has been successfully updated',
            errorTitle: 'Update Failed',
          },
        );
      }
    },
    [writeContractAsync, wrapTransaction, openProposalModal],
  );

  return { updateModule };
}
```

### Complete Delegation Example

```typescript
// components/governance/delegation.tsx
export function DelegationManager({ trustContract, governancePower }) {
  const { writeContractAsync } = useWriteContract();
  const { wrapTransaction } = useTransaction();
  const [delegateAddress, setDelegateAddress] = useState('');
  const [delegationType, setDelegationType] = useState<'token' | 'vesting'>(
    'token',
  );

  const handleDelegate = useCallback(async () => {
    // Validation
    if (!isAddress(delegateAddress)) {
      toast.error('Please enter a valid address');
      return;
    }

    const contractAddress =
      delegationType === 'token'
        ? trustContract.tokenContract?.id
        : trustContract.vestingContract?.id;

    if (!contractAddress) {
      toast.error(`No ${delegationType} contract found`);
      return;
    }

    // Check if user has balance
    const balance =
      delegationType === 'token'
        ? governancePower?.tokenVotingPower
        : governancePower?.vestingVotingPower;

    if (!balance || balance === 0n) {
      toast.error(`No ${delegationType} balance to delegate`);
      return;
    }

    // Execute delegation
    await wrapTransaction(
      async () => {
        const hash = await writeContractAsync({
          address: contractAddress as Address,
          abi: TokenModule__factory.abi,
          functionName: 'delegate',
          args: [delegateAddress as Address],
        });
        return hash;
      },
      {
        pendingTitle: 'Delegating Voting Power',
        pendingDescription: `Delegating ${delegationType} voting power to ${truncateAddress(
          delegateAddress,
        )}`,
        successTitle: 'Delegation Successful',
        successDescription: `Your ${delegationType} voting power has been delegated`,
        errorTitle: 'Delegation Failed',
        metadata: {
          delegationType,
          delegateAddress,
          balance: balance.toString(),
        },
        onSuccess: () => {
          setDelegateAddress('');
          toast.success('Delegation complete!');
        },
      },
    );
  }, [
    delegateAddress,
    delegationType,
    trustContract,
    governancePower,
    writeContractAsync,
    wrapTransaction,
  ]);

  return <div>{/* UI components */}</div>;
}
```

## Summary

These best practices ensure:

1. **Consistency**: All transactions follow the same pattern
2. **Security**: Proper validation and error handling
3. **UX Excellence**: Clear feedback and intuitive flows
4. **Maintainability**: Centralized logic and reusable patterns
5. **Governance Integrity**: All proposals go through proper channels

Remember: The goal is to abstract blockchain complexity while maintaining transparency and security. Users should understand what's happening without needing technical knowledge.
