---
title: Wallets & Identity
sidebar_position: 5
---

# Wallets & Identity

> Status: **architecture proposal** — not yet implemented. This document is the locked design that implementation follows.

aeqi treats identity and on-chain agency as two distinct layers. **Users** are the off-chain human-identity layer; **agents** are the on-chain WHO primitive. Wallets attach to both, but with different rules. This document specifies the wallet, key-custody, and authentication architecture that ships across all three deployment modes (shared-host SaaS free trial, dedicated-VPS paid SaaS, self-hosted).

## Principles

1. **Users and agents are separate primitives.** Users have credentials. Agents have wallets. A user is never an agent. The two never collapse.
2. **Wallets attach to users *and* agents, independently.** A user has personal wallets. A company-agent has its own wallet. Directing a company does not give you ownership of its wallet — you sign on its behalf within your director rights.
3. **Custody is per-wallet, not per-user.** Custodial, co-custody, and self-custody states are properties of individual wallets. A user can hold their primary in self-custody and their secondary in custodial signing simultaneously.
4. **The custodial path always exists.** Every user gets exactly one auto-provisioned custodial wallet on signup, regardless of which auth method they used. This is the only auto-created primitive in the entire system. It exists so users who later want runtime-assisted signing don't have to trigger wallet creation manually.
5. **MPC is the load-bearing security layer.** All custodial wallets are 2-of-2 threshold ECDSA between the server and the user's passkey-bound device. The server never holds a complete signing key. KEK encryption is defense-in-depth on top, not a substitute.
6. **Architecture is identical across deployment modes.** What changes is only the master-KEK backend.

## The five sign-up doors

A user can create an account via:

| Door | Auth credential stored | Auto-created wallet |
|---|---|---|
| Email magic link | `email` | one custodial (primary) |
| Google OAuth | `oauth_google.sub` | one custodial (primary) |
| GitHub OAuth | `oauth_github.sub` | one custodial (primary) |
| Passkey (WebAuthn) | `passkey.credential_id` | one custodial (primary) |
| External wallet (SIWE) | `wallet.address` (self-custody) | one custodial (secondary) |

In all five cases the result is identical: a `users` row, one `user_auth_methods` row matching the chosen door, and exactly one `user_wallets` row provisioned by the runtime. The fifth door additionally stores the user-supplied wallet as a second `user_wallets` row marked `is_primary = true`, with the auto-provisioned custodial wallet sitting as `is_primary = false` and ready for later use.

After signup, a user can:

- Add unlimited additional wallets (custodial, co-custody, or external) at any time.
- Add additional auth methods (link Google to an email-signup account, etc.).
- Designate any wallet as primary; exactly one wallet per user is primary at any moment.
- Use any wallet's address as a SIWE login credential.
- Use any auth method to log into the same account.

## Custody states

```
custodial  ──upgrade──▶  co_custody  ──upgrade──▶  self_custody
                                                       │
                                                  irreversible
```

| State | Server share | Client share | Routine signing | Cap-table-grade signing |
|---|---|---|---|---|
| `custodial` | held (encrypted) | none yet | runtime alone via session subkey | runtime alone (passkey re-auth) |
| `co_custody` | held (encrypted) | passkey-bound on device | runtime via session subkey | requires both server + client |
| `self_custody` | destroyed | full key (BIP-39 backed) | user signs via external wallet | user signs via external wallet |

A custodial wallet upgrades to co-custody the moment the user enrolls a passkey and runs the share-binding ceremony. The server's full key is then re-sharded into a 2-of-2 split. Until that ceremony completes, the wallet is signable by the runtime alone — fine for low-value defaults, and the design pushes users toward enrollment with a non-blocking nudge after signup.

Transition to self-custody is irreversible: the server's share is permanently destroyed, the user must have already received their BIP-39 recovery seed, and from that point only the user can sign for that wallet. The runtime cannot help.

## Schema

### Platform DB (`platform.db`)

```sql
-- Existing tables: users, user_auth_methods (formerly oauth_states + login_codes), user_sessions
-- New tables for the wallet layer:

CREATE TABLE user_wallets (
  id                            TEXT PRIMARY KEY,
  user_id                       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address                       TEXT NOT NULL UNIQUE,
  pubkey                        BLOB NOT NULL,
  custody_state                 TEXT NOT NULL CHECK (custody_state IN ('custodial','co_custody','self_custody')),
  is_primary                    INTEGER NOT NULL DEFAULT 0,
  provisioned_by                TEXT NOT NULL CHECK (provisioned_by IN ('runtime','user')),
  server_share_ciphertext       BLOB,
  server_share_kek_ciphertext   BLOB,
  kek_version                   INTEGER,
  client_share_commitment       BLOB,
  recovery_seed_revealed_at     TEXT,
  added_at                      TEXT NOT NULL,
  CHECK (
    (custody_state = 'self_custody'  AND server_share_ciphertext IS NULL)
    OR (custody_state IN ('custodial','co_custody') AND server_share_ciphertext IS NOT NULL)
  )
);
CREATE UNIQUE INDEX idx_user_wallets_one_primary ON user_wallets(user_id) WHERE is_primary = 1;
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(address);

CREATE TABLE passkey_credentials (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id       BLOB NOT NULL UNIQUE,
  public_key          BLOB NOT NULL,
  sign_count          INTEGER NOT NULL DEFAULT 0,
  transports          TEXT,
  attestation_format  TEXT,
  prf_supported       INTEGER NOT NULL DEFAULT 0,
  added_at            TEXT NOT NULL,
  last_used_at        TEXT
);

CREATE TABLE session_keys (
  id                 TEXT PRIMARY KEY,
  parent_wallet_id   TEXT NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
  subkey_pubkey      BLOB NOT NULL,
  scope_jsonb        TEXT NOT NULL,
  expires_at         TEXT NOT NULL,
  parent_signature   BLOB NOT NULL,
  created_at         TEXT NOT NULL,
  revoked_at         TEXT
);
CREATE INDEX idx_session_keys_parent ON session_keys(parent_wallet_id) WHERE revoked_at IS NULL;

CREATE TABLE wallet_signing_audit (
  id                 TEXT PRIMARY KEY,
  wallet_id          TEXT NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
  session_key_id     TEXT REFERENCES session_keys(id),
  payload_hash       BLOB NOT NULL,
  scope_match        TEXT NOT NULL,
  signed_at          TEXT NOT NULL
);
```

### Runtime DB (`aeqi.db`)

```sql
-- Existing agents table extended:
ALTER TABLE agents ADD COLUMN wallet_address     TEXT;
ALTER TABLE agents ADD COLUMN custody_state      TEXT;
ALTER TABLE agents ADD COLUMN custody_authority  TEXT;  -- 'platform' | 'self'

-- New table for the user→agent direction relation:
CREATE TABLE agent_directors (
  agent_id      TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('director','member','observer')),
  rights_jsonb  TEXT,
  added_at      TEXT NOT NULL,
  revoked_at    TEXT,
  PRIMARY KEY (agent_id, user_id)
);
CREATE INDEX idx_agent_directors_user ON agent_directors(user_id) WHERE revoked_at IS NULL;
```

Agent wallets are managed through the same `aeqi-wallets` crate the platform uses, just with `agent_id` as the owning entity instead of `user_id`. The schema parallels `user_wallets` (separate `agent_wallets` table) and is added in the agent-wallet phase, not the initial user-wallet phase.

## Cryptographic primitives

### Threshold signing: cggmp24

We use the [`cggmp21`/`cggmp24` crate from LFDT-Lockness](https://github.com/LFDT-Lockness/cggmp21) — currently the only audited, permissively-licensed, pure-Rust, production-deployed implementation of modern threshold ECDSA on secp256k1. It is maintained by DFNS, has an independent Kudelski security audit on v0.6.x, and supports both 2-of-2 and general t-of-n topologies.

**Why ECDSA, not Schnorr/FROST:** EVM is the primary chain target. Ethereum EOAs verify ECDSA via `ecrecover`. Using FROST (Schnorr) would force every user wallet to be a smart-contract account (EIP-4337 / EIP-7702), adding deployment gas, bundler dependencies, and UX complexity. CGGMP24 online signing is sub-10ms on commodity hardware; the round-trip is dominated by network latency, not cryptography. FROST becomes the right answer if and when we add Solana support (`frost-ed25519`).

**Known constraints:**
- Proactive share refresh is not yet implemented in cggmp24 (open issue [#162](https://github.com/LFDT-Lockness/cggmp21/issues/162)). For 2-of-2, full key compromise requires both server *and* client share simultaneously — refresh is hardening, not load-bearing. We design without it for v1 and contribute or sponsor the feature before scaling beyond meaningful balances.
- CVE-2025-66017 (presignature handling) is patched in v0.7.0-alpha.2; we pin to that version or later.
- A WASM client may pull in the full cggmp24 dep heavily. We measure and, if size is prohibitive, ship a thin client implementation using `k256` plus the specific MPC rounds we need.

### Client-share storage: passkey-bound

The client share lives on the user's device, sealed by their platform passkey. We use the WebAuthn PRF extension (HKDF-derived 32-byte secret per credential) to derive a wrapping key, then store the encrypted client-share blob in IndexedDB. PRF is supported in modern Chrome, Safari, and Firefox as of 2026. Where PRF is unavailable, we fall back to the WebAuthn `largeBlob` extension (limited browser support) or a signature-derived KDF (any conformant authenticator).

Cloud-synced platform passkeys (iCloud Keychain, Google Password Manager) replicate the credential and PRF/largeBlob data across the user's devices automatically. Hardware keys (YubiKey, Nitrokey) do not sync, so users with hardware-only passkeys explicitly opt into single-device custody and own their device-pairing flow.

### Master KEK: pluggable backend

```rust
// Pseudocode trait shape — actual signatures may vary

trait MasterKekProvider: Send + Sync {
    fn bootstrap(config: KekConfig) -> Result<Self>;
    async fn wrap(&self, plaintext_kek: &[u8]) -> Result<Bytes>;
    async fn unwrap(&self, ciphertext: &[u8]) -> Result<SecretBytes>;
    async fn rotate(&self) -> Result<RotationReceipt>;
    fn attestation(&self) -> Option<AttestationDoc>;
}
```

**v1 default across all deployment modes: `LocalSoftwareKek`.** Master KEK derived via Argon2id from an operator-typed passphrase loaded from systemd `EnvironmentFile=` at startup. Salted, encrypted at rest in a sealed file. Plaintext master KEK lives in process memory only between `unwrap()` and the immediate `zeroize()` after the per-wallet KEK is unwrapped.

**Why software-only is acceptable for v1:** the security argument is stacked. To compromise *any* user's funds, an attacker must (a) breach the running process memory to access the master KEK, (b) decrypt the per-wallet server share, (c) *also* obtain the user's passkey-bound client share from a separate device. The MPC requirement is the load-bearing layer; KEK encryption protects against database leaks and disk-theft scenarios where the running process is not reachable. Hetzner does not currently offer Nitro-equivalent TEEs on commodity VPS lines, so requiring TEEs would force a multi-cloud topology incompatible with the existing deployment.

**v2 backends (planned, gated behind config + Cargo features):**

- `AwsKmsKek` — instance-role-based unwrap via AWS KMS. Pluggable for any deployment that runs on AWS.
- `GcpKmsKek` — equivalent on GCP. Cheapest at the dedicated-VPS scale (~$0.06/key/month).
- `NitroEnclaveKek` — for the shared-host SaaS path if we move free trial off Hetzner. Only mode that gives a verifiable "operator cannot read your share" claim via PCR-pinned attestation.
- `YubiHsmKek` — for self-hosted prosumer. ~$650 one-time cost; tamper-evident hardware; on-device wrap/unwrap.

The DB schema stores only `(wallet_id, wrapped_kek_ciphertext, kek_version)`. Backend swap is config-only; no schema migration. Argon2id fallback is feature-flagged off in SaaS builds to make accidental enablement impossible.

### Recovery: BIP-39, user-controlled

At wallet provisioning, the runtime generates the keypair, immediately splits it into 2-of-2 shares, and computes the BIP-39 mnemonic from the original entropy. The mnemonic is **revealed to the user once on demand** (`POST /me/wallets/:id/reveal`, re-auth gated), with `recovery_seed_revealed_at` timestamped. Whether or not the user has ever revealed it, the BIP-39 mnemonic is recoverable from the runtime's encrypted server share + the user's client share — i.e. recovery does not depend on the user having written the seed down, only on having the client share.

**Critical property: master KEK loss is an availability event, not a total loss.** If a runtime operator irrecoverably loses the master KEK, server shares for that instance become undecryptable. Users who hold their client share (on their device) and (optionally) have revealed their seed phrase can recover their private key independently and migrate to a new wallet. This must be enforced architecturally — the recovery flow cannot rely on server-side state.

## Authentication flows

### Login (any of five paths)

1. Frontend calls `POST /api/auth/login/{kind}` with the credential payload.
2. Platform looks up the credential in `user_auth_methods` (or `user_wallets` for kind=wallet, or `passkey_credentials` for kind=passkey).
3. If matched, platform verifies the credential proof:
   - Email: magic link token verified.
   - OAuth: ID token validated against provider's JWKS.
   - Passkey: WebAuthn assertion verified.
   - Wallet: SIWE message + signature verified, nonce consumed.
4. Platform issues a JWT (`jti` row in `user_sessions`).
5. Frontend stores token, calls `GET /me` to populate session state.

### Signup (any of five paths)

Identical to login until step 4, with two additional steps:
3a. Insert `users` row, `user_auth_methods` row.
3b. Provision custodial wallet:
- Generate keypair (or initiate DKG with the client) via the wallet crate.
- Compute address, BIP-39 mnemonic.
- Encrypt the server share with a fresh per-wallet KEK.
- Wrap the per-wallet KEK with the master KEK provider.
- Insert `user_wallets` row with `provisioned_by='runtime'`. Set `is_primary` based on whether the user signed up with their own external wallet (then external is primary, custodial is not).

### Wallet operations

| Operation | Endpoint | Requires |
|---|---|---|
| List wallets | `GET /me/wallets` | session |
| Add custodial | `POST /me/wallets/custodial` | session |
| Add external (link a wallet they control) | `POST /me/wallets/external` | session + SIWE proof |
| Set primary | `PUT /me/wallets/:id/primary` | session |
| Remove | `DELETE /me/wallets/:id` | session, not primary, no recent unrevoked session keys |
| Reveal seed | `POST /me/wallets/:id/reveal` | session + re-auth (passkey or 2FA) |
| Upgrade to co-custody | `POST /me/wallets/:id/custody/co` | session + passkey enrollment ceremony |
| Transition to self-custody | `POST /me/wallets/:id/custody/self` | session + re-auth + reveal acknowledgement |
| Sign tx | `POST /me/wallets/:id/sign` | session + valid session-key delegation OR passkey re-auth + 2-of-2 round |
| Authorize session subkey | `POST /me/wallets/:id/delegate` | session + passkey for co-custody wallets |

## Component layout

A new crate, **`aeqi-wallets`**, holds all wallet logic and is depended on by both `aeqi-platform` (for SaaS) and `aeqi-web` (for self-hosted). The crate is service-agnostic: it exposes pure functions and DB repositories, not HTTP handlers. Both services map their HTTP routes onto its API.

```
aeqi-wallets/
  src/
    mpc/         cggmp24 wrapper, share split/recombine, signing rounds
    kek/         MasterKekProvider trait + backends (software, kms_aws, kms_gcp, yubihsm)
    siwe/        SIWE message parsing + signature verification
    passkey/     WebAuthn registration + assertion + PRF wrapping
    delegation/  session-key issuance, scope evaluation, signing
    store/       sqlx repositories over user_wallets, agent_wallets, session_keys, audit
    recovery/    BIP-39 mnemonic generation, derivation, share→seed reconstruction
    types/       Address, Pubkey, ScopedDelegation, etc.
```

`aeqi-platform` adds five new auth endpoints (passkey ×2, SIWE ×2 — signup and login pairs, plus a second-factor passkey enrollment endpoint), the `/me/wallets/*` surface, and a wallet provisioning hook in the existing signup paths. `aeqi-web` exposes the same surface when running in self-hosted (`AuthMode::Accounts`) mode.

The runtime side adds `agent_directors` and three new columns on `agents`, plus a thin signing client that calls the platform's `/internal/wallets/:id/sign` endpoint when an agent action requires its wallet.

## Phased plan

Each phase is shippable, deployed, and committed before the next begins. Worktrees per phase. CI green at every phase boundary.

### Phase 0 — Foundation & validation (~2 days)
- Architecture doc landed (this document).
- Spike: cggmp24 v0.7.x compiles on stable Rust 1.85, completes a 2-of-2 keygen + sign cycle locally, latency measured.
- Spike: Argon2id software-KEK backend, sealed-file ops, zeroize discipline.
- New crate `aeqi-wallets` scaffolded with the module layout above.
- DB migrations drafted for `user_wallets`, `passkey_credentials`, `session_keys`, `wallet_signing_audit`, `agent_directors`.

### Phase 1 — Server-side wallet primitives (~4 days)
- `aeqi-wallets/mpc/` complete: keygen, signing, share serialization.
- `aeqi-wallets/kek/` complete with software backend; trait shape locked.
- `aeqi-wallets/store/` complete: sqlx repos for user wallets, KEK-version tracking.
- Internal admin-only endpoint to manually provision a wallet for a test user end-to-end.
- BIP-39 mnemonic generation + reveal (no UI yet).

### Phase 2 — Auto-provisioning hook (~2 days)
- Hook into existing `aeqi-platform` signup paths (email, Google, GitHub) to call `aeqi-wallets::provision_custodial_for_user`.
- New users automatically receive one `user_wallets` row at `custodial`, `is_primary=true`.
- `GET /me` includes `wallets[]`.
- Frontend: minimal display of "your wallet address" on the dashboard. No interactivity yet.

### Phase 3 — Passkey enrollment & co-custody upgrade (~4 days)
- `aeqi-wallets/passkey/` using `webauthn-rs`.
- New endpoints: `POST /me/passkeys/register/begin`, `/register/finish`, `/list`, `/delete/:id`.
- Frontend: passkey registration ceremony in account settings, prompted with a soft nudge after first signup.
- `POST /me/wallets/:id/custody/co`: re-shards the server-held key into 2-of-2, stores client share commitment, runs the PRF-bound IndexedDB blob ceremony in the browser.

### Phase 4 — SIWE auth path & multi-wallet (~3 days)
- `aeqi-wallets/siwe/` complete: nonce issuance, message parse, signature verify.
- `POST /api/auth/signup/wallet`, `POST /api/auth/login/wallet` endpoints.
- `POST /me/wallets/external` — add an additional wallet by proving SIWE.
- Frontend: "Connect Wallet" button on login page (only visible if user-agent supports it; uses EIP-1193 / WalletConnect).
- `PUT /me/wallets/:id/primary`.

### Phase 5 — Custody transitions & recovery UI (~3 days)
- `POST /me/wallets/:id/reveal` with strong re-auth gating and irreversibility warnings.
- `POST /me/wallets/:id/custody/self` — destroys server share, marks irreversible.
- Frontend: settings UI for these flows. Loud confirmation modals.

### Phase 6 — Session keys & delegated signing (~4 days)
- `aeqi-wallets/delegation/` complete: scope DSL, issuance, evaluation.
- `POST /me/wallets/:id/delegate`, `GET /me/wallets/:id/delegations`, `DELETE /me/wallets/:id/delegations/:delegation_id`.
- `POST /me/wallets/:id/sign` accepts a session-key proof for routine signing without re-prompt.
- Wired through to one initial use case (e.g. a recurring agent payment).

### Phase 7 — Agent wallets (~5 days)
- `agent_wallets` table parallels `user_wallets`.
- Agent creation flow provisions a wallet for the agent.
- Custody-by-director model: directors hold client shares; multi-director DAO logic for scope/threshold.
- Cap-table actions sign through the agent's wallet.

### Phase 8 — Hardware backends (deferred, gated) 
- Cargo features for `aws_kms_kek`, `gcp_kms_kek`, `yubihsm_kek`, `nitro_enclave_kek`.
- Per-mode deploy docs in `self-hosting/` and `platform/`.
- Operator-facing docs on rotation, recovery, and threat-model differences.

Estimated total: **~27 implementation-days plus Phase 0**, sequenced across 6–8 calendar weeks given testing, design review, and deploy cadence. Phases 1–4 land the user-facing wallet experience end-to-end and are the meaningful MVP.

## Decisions locked

- **Crypto:** cggmp24 v0.7.x for threshold ECDSA on secp256k1.
- **KEK v1:** software (Argon2id + sealed file) across all deployment modes.
- **KEK v2:** pluggable backends per mode (KMS, YubiHSM, Nitro).
- **Custody upgrade path:** custodial → co_custody → self_custody (irreversible).
- **Recovery:** BIP-39 from original entropy, user-controlled, master-KEK-loss is availability event only.
- **Architecture identical across modes; service-agnostic `aeqi-wallets` crate.**
- **No third-party SaaS dependencies (Privy, Dynamic, Auth0, Magic, Web3Auth) for any layer.**

## Threat model summary

| Threat | Mitigation |
|---|---|
| DB leak / cold disk theft | Per-wallet KEK + master KEK encryption at rest. |
| Master KEK compromise alone | Useless without per-user client shares. |
| Server process compromise | MPC: server alone cannot sign. |
| Client device theft | MPC: client share alone cannot sign; passkey assertion required to access. |
| Both server and one client device compromised simultaneously | Full custody breach for that user. Mitigated in v2 by t-of-n, proactive refresh, hardware backends. |
| Phishing of user's external wallet (self-custody) | User responsibility; we surface clear signing-payload UI. |
| Operator coercion (subpoena, insider) | v1: legal/operational only. v2: Nitro Enclave attestation gives a verifiable "we cannot read your share" claim. |
| User loses passkey + has not revealed seed | Recovery via cloud-synced passkey on another device; if that fails, user is locked out of self-custody actions but can re-prove control via OAuth/email login and re-enroll. |
| User loses everything (devices, passkeys, recovery seed) | Total loss. Documented up-front. |

## Out of scope for v1

- Multi-chain support beyond EVM secp256k1. Solana / non-EVM chains arrive when product demand warrants.
- Smart-account wallets (EIP-4337/7702). EOA-shaped MPC is sufficient until UX or governance forces an upgrade.
- Account abstraction sponsorship / paymasters. Users hold their own gas at first.
- Multi-party DAO threshold schemes for company agents (covered in Phase 7).
- Hardware-key-only flows (YubiKey, Ledger as primary auth). Possible but deferred.
