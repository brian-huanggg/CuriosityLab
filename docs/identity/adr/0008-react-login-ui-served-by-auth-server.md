# ADR-IDENTITY-0008: React login UI served by auth-server

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
`auth-server` needs screens for login, MFA, passkeys, registration, email verification, password reset and account security. Every CuriosityLab UI uses React + TypeScript + MUI ([ADR-SHARED-0013](../../shared/adr/0013-react-for-all-user-interfaces.md)). The login pages must run on the auth host so that its session cookie, CSRF token and the WebAuthn `rpId` belong to that origin.

## Decision Drivers
- One UI technology for the whole platform.
- Same origin as the auth-server endpoints; no tokens in the browser.
- One deployable to build and release for identity.

## Considered Options
1. React bundle built with Vite and packaged into the auth-server JAR as static resources.
2. Server-side templates (Thymeleaf).
3. Login pages inside the main SPA (`web`) on the app host.
4. Separate static container for the login UI.

## Decision
Use option 1.

- The bundle is built in CI and copied into `static/` of the auth-server JAR; auth-server serves it on `auth.<domain>`.
- Routes such as `/login`, `/register`, `/account/security` return the SPA shell; the UI calls Spring Security endpoints and JSON endpoints under `/ui/api/**`.
- CSRF uses cookie-to-header tokens; the auth-server session cookie is HttpOnly.
- Shares the MUI theme and i18n resources with `web`, not runtime code.
- Strict CSP: only same-origin scripts, no inline scripts.

Rejected: Thymeleaf (a second UI technology); login inside `web` (wrong origin for the auth session and the passkey `rpId`, and the SPA would handle credentials); separate container (an extra deployable whose release must stay in step with auth-server endpoints).

## Consequences
### Positive
- Consistent look and one front-end skill set; UI and endpoints are versioned together.
### Negative / Trade-offs
- The auth-server build depends on a Node toolchain.
- Form-login and redirects must be adapted to an SPA (JSON responses or explicit redirects).
### Follow-up actions
- Decide where the UI source lives in the repository (OI-IDN-05).

## Compliance / Verification
Playwright end-to-end tests for each login path; CSP header check in CI.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §9; Shared architecture: §6
- ADRs: [ADR-SHARED-0013](../../shared/adr/0013-react-for-all-user-interfaces.md), [ADR-IDENTITY-0007](0007-passkeys-with-spring-security-webauthn.md)
