# ADR-BFF-0007: Logout and session termination

- Status: Proposed
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
A user is logged in at two places: the bff session (holding tokens, [ADR-BFF-0003](0003-sessions-in-redis-with-spring-session.md)) and the auth-server login session (single sign-on). Ending only the bff session lets the next `/bff/login` succeed silently through the auth-server session; ending only the auth-server session leaves a valid refresh token in the bff. Users also need to end sessions on other devices, for example after losing a laptop.

## Decision Drivers
- Logout must end access immediately, not when tokens expire.
- Refresh tokens must not remain usable after logout.
- The auth-server SSO session must end too, so shared computers are safe.
- "Log out on all devices" for the user.
- Works from a `fetch` call in the SPA.

## Considered Options
1. Local bff session invalidation, refresh-token revocation, then OIDC RP-initiated logout at auth-server; optional all-devices logout.
2. Local bff session invalidation only.
3. RP-initiated logout only (redirect to auth-server), relying on token expiry.

## Decision
Use option 1. `POST /bff/logout` (CSRF-protected):

1. Revokes the refresh token at the auth-server revocation endpoint (RFC 7009).
2. Invalidates the session in Redis and expires `__Host-SESSION` and `XSRF-TOKEN`.
3. Returns `200 { "logoutUrl" }` with the auth-server end-session URL (`id_token_hint`, `post_logout_redirect_uri=https://app.<domain>/`); the SPA navigates there.

With `{ "allDevices": true }` the bff also deletes every session of the same `sub` (find by principal name) and asks auth-server to revoke all of the account's authorizations. Password change, password reset and account disable in auth-server revoke the account's authorizations, so the next refresh in the bff fails with `invalid_grant` and the bff session ends within one access-token lifetime ([ADR-IDENTITY-0002](../../identity/adr/0002-session-for-login-tokens-for-services.md)). OIDC back-channel logout is not used for now (bff OI-BFF-06).

Option 2 is rejected because the auth-server session remains and the refresh token stays valid. Option 3 is rejected because the bff session and refresh token stay valid until they expire.

## Consequences
### Positive
- Logout is immediate at both levels; no usable token remains.
- Lost-device scenario is covered by all-devices logout.
### Negative / Trade-offs
- Two network calls on logout; if revocation fails, the session is still deleted and the failure logged.
- Find-by-principal needs an indexed session repository (more Redis keys).
- Access tokens already issued stay valid until expiry (5 min, [ADR-IDENTITY-0002](../../identity/adr/0002-session-for-login-tokens-for-services.md)); acceptable because they never left the bff.
### Follow-up actions
- Verify against current Spring Security and Spring Authorization Server docs: reactive `OidcClientInitiatedServerLogoutSuccessHandler`, back-channel logout support, and revocation of all authorizations of a principal.

## Compliance / Verification
Integration tests: after logout the old cookie gets `401`, the refresh token is rejected by auth-server, `/bff/login` requires credentials; all-devices test with two sessions.

## Related
- PRD: — (module PRD not written yet)
- Architecture: bff architecture §8.3, §9.4; Identity architecture (logout)
- ADRs: ADR-BFF-0001, ADR-BFF-0003, [ADR-IDENTITY-0002](../../identity/adr/0002-session-for-login-tokens-for-services.md)
