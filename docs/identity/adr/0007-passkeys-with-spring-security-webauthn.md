# ADR-IDENTITY-0007: Passkeys with Spring Security WebAuthn

- Status: Accepted (passkeys) / Proposed (details)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The Owner requires passkeys (WebAuthn). Passkeys are phishing-resistant because the browser binds each assertion to the relying party's origin. Spring Security provides built-in WebAuthn support (since 6.4, based on WebAuthn4J) with registration and authentication endpoints and JDBC credential repositories. Spring Security 7 adds multi-factor authentication support that tracks which factors a session has satisfied.

## Decision Drivers
- Phishing-resistant authentication for all users.
- Use framework support instead of implementing the WebAuthn ceremonies.
- Passkeys usable both without a password and as a second factor.

## Considered Options
1. Spring Security built-in WebAuthn support with its JDBC repositories in `cl_auth`.
2. A separate WebAuthn library (WebAuthn4J or Yubico java-webauthn-server) with own endpoints.
3. No passkeys; TOTP only.

## Decision
Use option 1.

- Configure `http.webAuthn(...)` with `rpId` = the auth host, `rpName` = CuriosityLab, and `allowedOrigins` = `https://auth.<domain>`.
- Store credentials with the JDBC `PublicKeyCredentialUserEntityRepository` and `UserCredentialRepository` (tables `user_entities`, `user_credentials`), migrated by Flyway.
- **Passwordless**: discoverable credential, user verification required; counts as multi-factor, no TOTP step.
- **Second factor**: after password login, a registered passkey can satisfy the second factor instead of TOTP.
- Registration requires an authenticated, recently re-authenticated session; users can name and remove passkeys.
- An account must keep at least one usable way to log in (password, or another passkey) before a passkey can be removed.

Rejected: separate library (more custom code, less teaching of the framework path); TOTP only (phishable).

## Consequences
### Positive
- Strongest login option with little custom code.
### Negative / Trade-offs
- `rpId` is bound to the auth domain; changing the domain (OI-01) invalidates all registered passkeys.
- The framework API is young; endpoint paths and repository schemas may change.
### Follow-up actions
- Verify against current Spring Security 7 docs: configuration DSL, default endpoint paths, JDBC schema, and how a WebAuthn factor is combined with password login in the MFA support.
- Decide whether attestation is ignored (`none`) as proposed.

## Compliance / Verification
Integration tests with a virtual authenticator (Playwright / Chrome DevTools); test that an assertion from a wrong origin is rejected.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §5.2, §6.3, §6.8
- ADRs: [ADR-IDENTITY-0006](0006-totp-two-factor-with-recovery-codes.md), [ADR-IDENTITY-0008](0008-react-login-ui-served-by-auth-server.md)
