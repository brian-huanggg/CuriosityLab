# ADR-BFF-0001: Backend for Frontend, tokens stay server-side

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The React SPA needs to call `platform` APIs that are protected by OAuth2 access tokens issued by `auth-server`. Where those tokens live decides how much damage an XSS bug or a malicious dependency in the SPA can do. The IETF draft "OAuth 2.0 for Browser-Based Applications" describes three architectures and recommends a Backend for Frontend as the most secure one for business applications. The book also needs a clear "session vs token" chapter.

## Decision Drivers
- Tokens must never be readable by JavaScript ([Shared architecture: §1.1](../../shared/architecture.md#11-key-quality-attributes)).
- A confidential OAuth2 client (client secret), not a public one.
- Refresh tokens must not be exposed to the browser at all.
- Immediate, server-side session invalidation.
- Simple SPA code: no token storage, no refresh logic in the frontend.

## Considered Options
1. **Backend for Frontend (BFF):** a server-side OAuth2 client holds all tokens; the browser holds only an `HttpOnly` session cookie; the BFF proxies API calls and attaches the access token.
2. **Token-mediating backend:** a backend obtains tokens as a confidential client but hands the access token to the SPA, which calls APIs directly.
3. **Browser-based OAuth2 client:** the SPA is a public client (authorization code + PKCE) and stores tokens in memory or browser storage.

## Decision
Use option 1. The `bff` deployable is a confidential OIDC client of `auth-server` (authorization code + PKCE, client secret from Vault via ESO). Access, refresh and ID tokens are stored only in the server-side session. The browser receives an `HttpOnly`, `Secure`, `SameSite=Lax` session cookie and nothing else. Every API call goes through the bff, which attaches the access token and forwards the request.

Option 2 is rejected because the access token still reaches JavaScript, so an XSS attacker can exfiltrate and replay it until it expires. Option 3 is rejected because both access and refresh tokens are exposed to JavaScript, the client cannot keep a secret, and the draft discourages it for applications handling sensitive data.

## Consequences
### Positive
- XSS can act as the user only while the page is open; it cannot steal tokens for later use.
- Logout and forced logout are server-side and immediate.
- The SPA has no token handling code.
### Negative / Trade-offs
- An extra deployable and an extra network hop on every API call.
- Cookie-based authentication needs CSRF protection ([ADR-BFF-0005](0005-csrf-and-same-origin-spa-hosting.md)).
- Server-side session state requires a shared store ([ADR-BFF-0003](0003-sessions-in-redis-with-spring-session.md)).
### Follow-up actions
- Track the IETF draft for changes in its recommendation (verify against the current draft).
- Book chapter on session vs token with this ADR as the reference.

## Compliance / Verification
E2E test asserts that no response body, cookie or `localStorage` entry contains a token; ZAP checks cookie flags; ArchUnit/review rule: the SPA has no OAuth2 client library.

## Related
- PRD: — (module PRD not written yet)
- Architecture: bff architecture §1, §6; Shared architecture: §9
- ADRs: ADR-BFF-0002, ADR-BFF-0003, ADR-BFF-0005, [ADR-IDENTITY-0002](../../identity/adr/0002-session-for-login-tokens-for-services.md)
