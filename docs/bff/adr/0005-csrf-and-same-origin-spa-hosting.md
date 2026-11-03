# ADR-BFF-0005: CSRF protection and same-origin SPA hosting

- Status: Proposed
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
With a BFF ([ADR-BFF-0001](0001-backend-for-frontend-tokens-stay-server-side.md)) the browser authenticates with a cookie, which the browser attaches automatically. That makes cross-site request forgery possible. Where the SPA is hosted relative to the bff also decides whether CORS is needed and whether `SameSite` cookies work.

## Decision Drivers
- Every state-changing request must be protected against CSRF.
- No CORS configuration to get wrong.
- Works with the OIDC redirect back to the bff (top-level GET from `auth.<domain>`).
- Simple for the SPA: one header, set by the HTTP client.

## Considered Options
1. Cookie-to-header CSRF token plus `SameSite=Lax`, SPA and API on the same origin.
2. `SameSite=Strict` only, no token.
3. Synchronizer token embedded in the HTML page.
4. SPA on its own origin (for example `www.<domain>`) with CORS and credentials.

## Decision
Use option 1.

- The bff sets an `XSRF-TOKEN` cookie (not `HttpOnly`, `Secure`, `SameSite=Lax`); the SPA sends it as `X-XSRF-TOKEN` on `POST`, `PUT`, `PATCH`, `DELETE` to `/api/**` and `/bff/**`.
- The session cookie `__Host-SESSION` is `SameSite=Lax` as a second layer.
- WebSocket upgrades are checked by `Origin` header, since the browser WebSocket API cannot add custom headers.
- Hosting: `app.<domain>/` → `web` (static SPA), `/api` and `/bff` → bff; `auth.<domain>` → auth-server. SPA and API share one origin, so no CORS is configured.
- `GET` handlers never change state.

Option 2 is rejected because `Strict` drops the session cookie on the redirect back from `auth.<domain>` and on links from email, and `SameSite` alone does not protect against same-site attacks from other subdomains. Option 3 is rejected because the HTML is static and served by `web`, not rendered by the bff. Option 4 is rejected because it needs CORS with credentials and third-party-cookie-like behaviour, which browsers increasingly restrict.

## Consequences
### Positive
- Standard pattern supported by Spring Security and common HTTP clients.
- No CORS policy; cross-origin calls fail by default.
### Negative / Trade-offs
- The SPA must send the header on every write; a generated API client handles it.
- The CSRF cookie is readable by JavaScript (it is not a credential on its own).
- `web` and bff must stay behind one host and one Traefik router.
### Follow-up actions
- Verify against current Spring Security 7 docs the recommended reactive SPA CSRF setup (token request handler, BREACH masking, deferred token loading).

## Compliance / Verification
Integration tests: write without header → `403`; wrong `Origin` on `/ws/**` → `403`. ZAP checks cookie flags and absence of CORS headers.

## Related
- PRD: — (module PRD not written yet)
- Architecture: bff architecture §10, §12; Shared architecture: §6, §10.2
- ADRs: ADR-BFF-0001, ADR-BFF-0006, [ADR-SHARED-0013](../../shared/adr/0013-react-for-all-user-interfaces.md)
