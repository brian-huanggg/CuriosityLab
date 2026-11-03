# ADR-IDENTITY-0002: Session for login, tokens for services

- Status: Accepted (BFF holds tokens) / Proposed (token lifetimes: access 5 min, refresh rotating, absolute lifetime)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The book covers Session vs Token. Sessions are easy to revoke but are stateful; self-contained tokens scale and cross service boundaries but cannot be revoked before they expire. CuriosityLab has three places where "being logged in" matters: the auth host, the bff, and the services behind the bff. Each needs a different answer.

## Decision Drivers
- Tokens must never reach the browser ([ADR-BFF-0001](../../bff/adr/0001-backend-for-frontend-tokens-stay-server-side.md)).
- Services (platform, later extracted modules) must validate callers without a call to auth-server per request.
- Logout, password reset and account disable must take effect quickly.

## Considered Options
1. Server-side login session on auth-server; short-lived JWT access tokens plus rotating refresh tokens held by the bff.
2. Long-lived JWT access tokens only.
3. Opaque access tokens validated by introspection on every request.
4. One shared session for auth-server, bff and platform.

## Decision
Use option 1.

- **auth-server**: its own server-side login session (Spring Session Data Redis, cookie on `auth.<domain>`). It means "this browser has authenticated here" and enables SSO; it is not used by services.
- **bff**: holds access, refresh and ID tokens in its own Redis session; the browser only has the bff session cookie.
- **Services**: receive JWT access tokens (TokenRelay) and validate them locally with JWKS.
- **Revocation** by short access-token lifetime plus refresh-token rotation. Logout, password reset and disable invalidate the authorization, so the next refresh fails.
- Proposed lifetimes: authorization code 1 min; access token 5 min; ID token 5 min; refresh token rotated on every use, authorization absolute lifetime 8 h; auth-server login session idle 30 min, absolute 8 h.

Rejected: long-lived JWTs (cannot be revoked); introspection per request (auth-server on the hot path of every API call); one shared session (couples deployables and their stores).

## Consequences
### Positive
- Each layer uses the model that fits it, which is the teaching point of the chapter.
- Platform needs no call to auth-server per request.
### Negative / Trade-offs
- An issued access token stays valid up to 5 min after logout.
- Three session/token lifetimes must be kept consistent (auth-server, bff, tokens).
### Follow-up actions
- Align lifetimes with the bff idle and absolute timeouts (OI-IDN-01).
- Verify whether refresh-token reuse detection is built in; add it if not.

## Compliance / Verification
Integration tests: refresh rotates the token; an old refresh token is rejected; password reset and logout cause `invalid_grant` on the next refresh.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §6.5, §6.6, §7.2
- ADRs: [ADR-BFF-0001](../../bff/adr/0001-backend-for-frontend-tokens-stay-server-side.md), [ADR-BFF-0003](../../bff/adr/0003-sessions-in-redis-with-spring-session.md), [ADR-BFF-0007](../../bff/adr/0007-logout-and-session-termination.md)
