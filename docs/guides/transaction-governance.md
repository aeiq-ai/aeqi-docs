# Transaction and Governance Best Practices

> **Retired stack.** This guide documented transaction and governance
> patterns for aeqi's earlier EVM contract layer — wagmi hooks, TypeChain
> factories, `0x`-prefixed calldata, and the transaction-context wrapper
> built around them. That layer has been retired. aeqi's on-chain
> operations now run on Solana programs under `projects/aeqi-solana/`
> (Anchor/Borsh), and the patterns described here do not apply to them.

For the current on-chain layer, see:

- [Factory flow](/docs/factory-flow) — the current Solana/Anchor factory:
  how Companies are registered on-chain today.
- [IPFS content addressing](/docs/guides/ipfs-content-addressing) — CID
  handling for the current programs, with the EVM conventions marked as
  historical.

The full historical text of this guide remains available in the repository's
git history.
