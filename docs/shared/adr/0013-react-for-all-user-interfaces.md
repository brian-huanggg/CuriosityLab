# ADR-SHARED-0013: React for all user interfaces

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab has a main SPA (`web/`) and a login UI served by `auth-server`. The login UI includes passkeys (WebAuthn), TOTP 2FA, recovery codes and account protection messages. The project is also a teaching book: every extra technology must be taught and maintained by one developer.

## Decision Drivers
- One UI stack to build, test and teach.
- Good UX for passkey and MFA flows, which need client-side logic (WebAuthn browser API).
- Shared components, theme and i18n (zh-TW first) between the SPA and the login UI.

## Considered Options
1. React + TypeScript + MUI for every UI, including the auth-server login UI (chosen).
2. React for the SPA, Thymeleaf server-rendered pages for the login UI.

## Decision
Use option 1.
- Every UI uses React, TypeScript and MUI with the same tooling (Vite, Vitest, React Testing Library, Playwright).
- There are two bundles: the main SPA, served by the static `web` container, and the login UI, built into and served by `auth-server`.
- How the login UI is served and secured is decided in [ADR-IDENTITY-0008](../../identity/adr/0008-react-login-ui-served-by-auth-server.md).

Rejected option:
- Thymeleaf for the login UI: passkey and MFA flows need substantial JavaScript anyway, which mixes server templates with scripts; it adds a second UI stack to teach, test and theme.

## Consequences
### Positive
- One stack, one component library and one theme for all screens.
- Rich, consistent passkey and MFA UX.
### Negative / Trade-offs
- The login UI needs a frontend build inside the `auth-server` build.
- The login UI must handle CSRF and form login against Spring Security as a JavaScript client, which is less documented than server-rendered pages.
- Frontend versions are not fixed yet ([ADR-SHARED-0004](0004-runtime-framework-and-build-versions.md), Proposed part).
### Follow-up actions
- Decide shared frontend packages between `web/` and the login UI (theme, i18n, UI components).
- Verify Spring Security 7 support for a custom JavaScript login page and WebAuthn endpoints against current docs.

## Compliance / Verification
Review rule: no server-side template engine dependency in any deployable; Playwright tests cover login, passkey and TOTP flows.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Shared architecture: §1.2, §4, §6
- ADRs: [ADR-SHARED-0004](0004-runtime-framework-and-build-versions.md), [ADR-IDENTITY-0008](../../identity/adr/0008-react-login-ui-served-by-auth-server.md)
