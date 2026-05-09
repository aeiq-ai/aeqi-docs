# Factory Flow Reference

The Factory is the core on-chain component for creating DAOs (companies, funds, entities) in aeqi. It's a sophisticated multi-stage wizard that guides users through creating on-chain organizations with proper governance, vesting, and funding structures.

**Companion docs:**
- [TRUST](/docs/concepts/trust) — the on-chain identity primitive each company gets.
- [Canonical templates](/docs/architecture/canonical-templates) — the four locked TRUST archetypes.

## Architecture Philosophy

### Design Patterns

1. **Multi-Stage Wizard Pattern**: Factory flow uses stage-based UX (Idea → Setup → Launch), decoupled from contract encoding complexity.
2. **Optimistic UI Updates**: State updates happen immediately in the frontend while blockchain operations follow asynchronously.
3. **Value-Configs System**: All TRUST configuration is serialized as a Vec<ValueConfig> (key-value pairs with encoded bytes), allowing arbitrary extensibility without contract changes.
4. **Two-Level Budget/Role Hierarchy**: Budgets allocate pools to role types; roles assign addresses to specific amounts within those pools.
5. **Progressive Enhancement**: Start with minimal config, add complexity as needed.

## Value Configs System

The core data structure for TRUST configuration is `ValueConfig`:

```rust
struct ValueConfig {
    valueId: bytes32,      // ref to parent TRUST (e.g., sha3('role.trustConfig'))
    key: bytes32,          // config type key (e.g., sha3('token'), sha3('roles'))
    value: Vec<u8>,        // encoded bytes (ABI-encoded or custom binary)
    valueType: u32,        // config type indicator
}
```

### Config Types

1. **Token Config**: Token name, symbol, supply allocations
2. **Budget Config**: Budget allocations and vesting schedules
3. **Role Config**: Role assignments, vesting positions, and account links
4. **Funding Config**: Valuation and funding rounds
5. **Governance Config**: Voting parameters, delays, thresholds

### Encoding/Decoding Pattern

All configs are serialized to `Vec<u8>` via ABI encoding or custom binary protocols. The decoding happens in the runtime (aeqi-platform) during provisioning:

```rust
// aeqi-platform/src/dao_provisioner.rs
fn decode_role_config(encoded: &[u8]) -> Result<RoleConfig> {
    // ABI decode or custom deserialize
    // Returns strongly-typed RoleConfig struct
}

fn encode_role_config(config: &RoleConfig) -> Vec<u8> {
    // Serialize back for contract storage
}
```

This pattern allows:
- Contract to remain config-agnostic (just stores opaque bytes)
- Runtime to deserialize into domain models
- Future config types to be added without contract upgrade

## Budget & Role System (Deep Dive)

### Two-Level Hierarchy

The system uses a two-level structure for sophisticated allocation patterns:

#### Level 1: Budget Allocations

```rust
BudgetRequest {
    id: bytes32,                    // sha3('budget.vesting.founder')
    sourceBudgetId: bytes32,        // parent budget
    targetModuleId: bytes32,        // target (e.g., sha3('vesting'))
    amount: u256,                   // total allocation
    config: Vec<u8>,                // encoded role types array
}
```

#### Level 2: Role Assignments

```rust
RoleRequest {
    account: Address,               // wallet address
    roleType: bytes32,              // sha3('director'), sha3('advisor'), etc.
    vestingPositionRequests: [{
        sourceBudgetId: bytes32,    // links back to budget
        amount: u256,               // individual allocation
    }]
}
```

### Budget ID Pattern

Budget IDs follow a consistent naming convention:

```
sha3('budget.vesting.founder')   → DIRECTOR role pool
sha3('budget.vesting.team')      → EXECUTIVE, OFFICER, LEAD, CONTRIBUTOR pool
sha3('budget.vesting.advisor')   → ADVISOR role pool
sha3('budget.vesting.dealflow')  → DEALFLOW role pool
sha3('budget.vesting.holder')    → HOLDER role pool
```

This allows template-agnostic discovery: instead of hardcoding budget IDs, the provisioner queries all budgets and discovers which ones support each role type.

## Template Types

The Factory ships with three template families:

### 1. Venture Template

- **Default Allocations**:
  - Founder Pool: 28%
  - Core Team: 12%
  - Advisor: 2%
  - Dealflow: 2%
  - Holder: 2%
- **Modules**: Token, Governance, Roles, Vesting, Budget, AMM
- **Use Case**: Startup cap tables with founder lockup and team vesting

### 2. Fund Template

- **Modules**: Fund, Governance, Roles, Treasury, Budget
- **Use Case**: Venture fund with LP governance and fund management

### 3. Entity Template

- **Default**: 100% to directors
- **Modules**: Roles, Treasury, Budget
- **Use Case**: Minimal organizational structure (e.g., a service DAO)

## Role Types

Standard role types across all templates:

```rust
sha3('director')    → Founders/Leaders
sha3('executive')   → C-level team
sha3('officer')     → Senior team
sha3('lead')        → Team leads
sha3('contributor') → Team members
sha3('advisor')     → External advisors
sha3('dealflow')    → Business development
sha3('holder')      → Token holders (no allocation)
```

## Flow Stages

### Stage 1: Idea

**Purpose**: Capture basic TRUST metadata (off-chain)

**What gets collected:**
- Organization name, description, avatar
- Token ticker and supply
- Social links, documentation URLs
- Which template to use

**Output**: IPFS CID of the off-chain metadata

### Stage 2: Setup

**Purpose**: Configure on-chain parameters via ValueConfigs

**Sub-stages:**

#### Valuation & Funding
- Set initial token valuation (affects token allocation percentages)
- Define funding round parameters

#### Governance
- Voting delay and period (blocks or time)
- Quorum threshold, support threshold
- Early execution settings

#### Roles & Vesting
- Define budget allocations per role type
- Assign specific addresses to roles
- Set vesting schedules per role

### Stage 3: Launch

**Purpose**: Register TRUST on-chain and monitor indexer confirmation

**What happens:**
1. All ValueConfigs are serialized and passed to Factory.registerTRUST
2. Only directors with non-zero addresses become declared signers
3. Contract emits TrustRegistered event
4. Indexer polls and reads the event, indexes the new TRUST address
5. Platform writes (trust_id, trust_address, placement) to runtime_placements

**Key: Declared Signers**

Only DIRECTOR roles with non-zero addresses are declared signers:

```rust
let declared_signers = role_config
    .roleRequests
    .iter()
    .filter(|r| r.role_type == sha3('director') && r.account != ZERO_ADDRESS)
    .map(|r| r.account)
    .collect::<Vec<_>>();
```

This is used for multi-sig and governance weight initialization.

## State Management (Platform-Side)

The provisioning flow is orchestrated in `aeqi-platform/src/dao_provisioner.rs`:

1. **Load Template**: Fetch template from Factory contract
2. **Deserialize Idea**: Parse user-provided IPFS metadata
3. **Construct ValueConfigs**: From UI state → encoded bytes
4. **Build TRUSTConfigRequest**: Aggregate all configs + ipfsCid
5. **Call registerTRUST**: Send transaction to Factory contract
6. **Poll Indexer**: Wait for TrustRegistered event to be indexed
7. **Write Placement**: Record trust_address in runtime_placements

## Transaction Flow

The on-chain registration is a single atomic call:

```rust
pub fn registerTRUST(
    trustId: bytes32,
    templateId: bytes32,
    ipfsCid: bytes32,
    valueConfigs: Vec<ValueConfig>,
    declaredSigners: Vec<Address>,
)
```

**What the contract does:**
1. Validates template exists
2. Stores ipfsCid reference for agreement docs
3. Stores all valueConfigs (opaque, contract doesn't interpret them)
4. Initializes multi-sig signers from declaredSigners
5. Emits TrustRegistered(trustId, templateId, ipfsCid)

## DaoConfig Structure (Runtime View)

Once provisioned, the runtime views the TRUST as:

```rust
struct DaoConfig {
    trust_id: bytes32,
    template: TemplateRef,
    ipfs_cid: String,
    ipfs_data: {
        name: String,
        description: String,
        tokenTicker: String,
        avatarUrl: String,
    },
    value_configs: Vec<ValueConfig>,
}
```

Decoding happens on-demand in the provisioner, transforming ValueConfig arrays into:

```rust
struct ResolvedConfig {
    token: TokenConfig,
    budgets: Vec<BudgetRequest>,
    roles: Vec<RoleRequest>,
    funding: FundingConfig,
    governance: GovernanceConfig,
}
```

## Validation

### Multi-Level Validation

1. **Client-side** (in apps/ui):
   - Name/ticker length and format
   - URL validity for docs/video links
   - Total allocations ≤ 100%

2. **Platform-side** (aeqi-platform):
   - Template exists
   - Budget IDs match expected pattern
   - Role types are recognized
   - All addresses are valid

3. **Contract-side** (Factory.sol):
   - Template is active
   - ipfsCid is non-zero
   - Declared signers array is non-empty
   - ValueConfigs serialize correctly

### Validation Flow

1. **Real-time**: As user types (debounced), validate in UI
2. **On blur**: When field loses focus, re-validate
3. **On submit**: Final validation before sending transaction
4. **Cross-field**: Total allocations don't exceed pool

## Common Patterns

### Adding a Default Role

When the venture template loads, auto-populate a director role for the connected wallet:

1. Load template and discover director budget
2. Check if budget has available allocation (usually 2%)
3. Create a RoleRequest with the connected wallet address
4. Add to roleRequests in the role config

This happens in the UI *before* the user hits "Launch" — it's an optimistic pre-fill, not a transaction.

### Creating a Custom Budget

To add a new budget type without contract changes:

1. Define a new budget ID: `sha3('budget.vesting.custom')`
2. Create BudgetRequest with that ID
3. Encode role types that can draw from it
4. Add to budgets array in valueConfigs

The contract never needs to know about the semantics — it just stores the bytes.

### Extending Config Types

To add a new config type (e.g., permissions matrix, fee structure):

1. Define a new key: `sha3('permissions')`
2. Implement encode/decode in aeqi-platform
3. Create a UI panel for editing
4. Decode at provisioning time and apply to runtime state

**No contract upgrade required** — it's just another ValueConfig entry.

## Debugging & Operations

### Verify the Smoke Test

See [`click-to-dao-smoke-test.md`](https://aeqi.ai/docs) for the full recipe. Quick checks:

```bash
# Is Factory registered with templates?
curl -sS http://127.0.0.1:8500/graphql -d \
  '{"query":"{ blueprintsForFactory(factoryAddress: \"0x...\") { templateId } }"}' | jq .

# Did the TRUST get registered?
curl -sS http://127.0.0.1:8500/graphql -d \
  '{"query":"{ trusts { id } }"}' | jq .
```

### Trace a Failed Provisioning

Check the logs in order:

```bash
# 1. Platform received the request
sudo journalctl -u aeqi-platform.service -n 100 | grep -i 'dao_provisioner\|registerTRUST'

# 2. Transaction was mined
curl -sS http://127.0.0.1:8545 -X POST -H 'Content-Type: application/json' \
  --data '{"jsonrpc":"2.0","method":"eth_getLogs","params":[...],"id":1}'

# 3. Indexer picked it up
sudo journalctl -u aeqi-indexer.service -n 50 | grep -i 'TrustRegistered'

# 4. Runtime placement was written
sudo sqlite3 /var/lib/aeqi/platform.db \
  "SELECT entity_id, trust_address, status FROM runtime_placements WHERE trust_address IS NOT NULL;"
```

## Best Practices

### Template Agnosticism

Never hardcode budget IDs or role type patterns. Instead:

```rust
// Good: discover at runtime
let director_budget = budgets
    .iter()
    .find(|b| decode_role_types(&b.config).contains(&sha3('director')))
    .ok_or("no director budget")?;

// Bad: assume sha3('budget.vesting.founder') always exists
let budget = budgets.iter().find(|b| b.id == sha3('budget.vesting.founder'))
```

This allows templates to evolve without breaking provisioning logic.

### Defensive Decoding

Always wrap ValueConfig decoding in proper error handling:

```rust
fn get_role_config(value_configs: &[ValueConfig]) -> Result<RoleConfig> {
    let encoded = value_configs
        .iter()
        .find(|vc| vc.key == sha3('roles'))
        .ok_or("missing role config")?
        .value
        .as_slice();
    
    decode_abi::<RoleConfig>(encoded)
        .map_err(|e| anyhow!("role config decode failed: {}", e))
}
```

### State Immutability

Once a TRUST is registered, its ValueConfigs are immutable (at the contract level). Any modifications create a new proposal/update transaction. This prevents surprises and keeps the audit trail clean.

## Conclusion

The Factory architecture balances:

- **Flexibility**: Config types are opaque to the contract; new types don't require upgrades
- **Safety**: Multi-level validation catches errors early
- **Extensibility**: Two-level budget/role system supports complex allocation patterns
- **Simplicity**: UI remains a three-stage wizard despite on-chain complexity

When working with the Factory:

1. Understand the value-configs serialization model (contract stores opaque bytes, runtime interprets)
2. Keep template discovery dynamic, never hardcode budget/role IDs
3. Validate at the appropriate layer (UI for UX, platform for semantics, contract for trust boundary)
4. Test with the smoke recipe before shipping

The architecture is designed to evolve — new templates, config types, and features can be added without breaking existing registrations.
