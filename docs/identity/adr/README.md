# Architecture Decision Records — identity

Decisions for the identity module and the `auth-server` deployable, one file per decision (`NNNN-kebab-case-title.md`, MADR-style, English). Referenced from other folders as `ADR-IDENTITY-NNNN`. See [ADR-SHARED-0001](../../shared/adr/0001-record-architecture-decisions.md) for the process.

## Rules

- Numbers are sequential within this folder and never reused.
- An accepted ADR is immutable. To change a decision, add a new ADR that supersedes the old one and update the `Supersedes / Superseded by` lines in both.
- When a decision changes, update [`../architecture.md`](../architecture.md) (§12 index) to match.
- Status values: `Accepted` (confirmed by the Owner), `Proposed` (recommended by the architect, awaiting confirmation), `Proposed (deferred)` (planned for a later phase). Mixed statuses mean different parts of the decision are at different stages.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-self-hosted-spring-authorization-server.md) | Self-hosted Spring Authorization Server | Accepted |
| [0002](0002-session-for-login-tokens-for-services.md) | Session for login, tokens for services | Accepted (BFF holds tokens) / Proposed (token lifetimes) |
| [0003](0003-permissions-resolved-by-platform-not-in-jwt.md) | Permissions resolved by platform, not in the JWT | Proposed |
| [0004](0004-account-and-member-data-ownership.md) | Account and member data ownership | Proposed (JIT provisioning) |
| [0005](0005-password-hashing-and-account-protection.md) | Password hashing and account protection | Proposed (Argon2id) |
| [0006](0006-totp-two-factor-with-recovery-codes.md) | TOTP two-factor authentication with recovery codes | Accepted (TOTP) / Proposed (secret encryption, recovery codes) |
| [0007](0007-passkeys-with-spring-security-webauthn.md) | Passkeys with Spring Security WebAuthn | Accepted (passkeys) / Proposed (details) |
| [0008](0008-react-login-ui-served-by-auth-server.md) | React login UI served by auth-server | Accepted |
| [0009](0009-email-verification-and-lab-mail-with-mailpit.md) | Email verification and lab mail with Mailpit | Proposed |

## Related documents

- [Identity architecture](../architecture.md)
- [Shared ADRs](../../shared/adr/README.md)
- [BFF ADRs](../../bff/adr/README.md)
