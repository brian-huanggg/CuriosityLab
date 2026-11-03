# ADR-IDENTITY-0006: TOTP two-factor authentication with recovery codes

- Status: Accepted (TOTP) / Proposed (secret encryption, recovery codes)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The Owner requires two-factor authentication. TOTP works with any authenticator app and needs no SMS or mail delivery. Unlike a password, the TOTP secret must be read back by the server to compute the expected code, so it cannot be hashed. Users who lose their device need a way back in that is not a weak bypass.

## Decision Drivers
- Standard, offline, free second factor.
- Teaching the difference between hashing and encryption.
- Recovery without an admin-driven reset in normal cases.

## Considered Options
1. TOTP (RFC 6238) with encrypted secrets and single-use hashed recovery codes.
2. SMS or email one-time codes.
3. TOTP secret stored in plaintext.

## Decision
- TOTP per RFC 6238: SHA-1, 6 digits, 30 s step (the parameters authenticator apps support), accepted window ±1 step.
- Replay protection: store `last_used_step`; a code for that step or earlier is rejected.
- Enrolment: re-authentication, 160-bit random secret shown as `otpauth://` QR code, confirmed by one valid code before it is active.
- Secret encrypted at rest with AES-256-GCM; the key comes from Vault via ESO ([ADR-SHARED-0010](../../shared/adr/0010-secrets-with-external-secrets-operator.md)); each row stores a key id for rotation.
- Recovery codes: 10 random codes shown once at enrolment, stored as SHA-256 hashes, each single use; regenerating replaces the whole set; using one emits `RECOVERY_CODE_USED`.
- The TOTP step is rate-limited and counts towards account backoff.

Rejected: SMS/email codes (cost, SIM swap, mail cannot leave the lab); plaintext secrets (a database leak would expose every second factor).

## Consequences
### Positive
- Works offline with any authenticator app; a `cl_auth` leak alone does not reveal secrets.
### Negative / Trade-offs
- Loss of the encryption key makes every TOTP enrolment unusable; key backup is required.
- TOTP is phishable; passkeys are the stronger option ([ADR-IDENTITY-0007](0007-passkeys-with-spring-security-webauthn.md)).
### Follow-up actions
- Choose a TOTP library or own implementation (OI-IDN-08).
- Verify how a TOTP step plugs into Spring Security 7 multi-factor authentication support.

## Compliance / Verification
Tests with RFC 6238 test vectors; replay test; test that ciphertext in the database does not contain the secret.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §5.1, §6.2, §8.1
- ADRs: [ADR-IDENTITY-0005](0005-password-hashing-and-account-protection.md), [ADR-IDENTITY-0007](0007-passkeys-with-spring-security-webauthn.md)
