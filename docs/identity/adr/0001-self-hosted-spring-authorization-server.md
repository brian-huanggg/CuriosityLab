# ADR-IDENTITY-0001: Self-hosted Spring Authorization Server

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab needs an OpenID Connect provider for the bff and, later, other clients. The platform is a teaching project: the book must explain how login, MFA, passkeys and tokens actually work. The lab node (4 vCPU / 16 GB) is shared with other workloads, and the stack is already Spring Boot 4 / Spring Security 7.

## Decision Drivers
- Teaching value: every step of the authentication and OIDC flow is visible in our own code and configuration.
- Resource budget on a single shared node.
- Same language, framework and tooling as the rest of the backend.
- No dependency on an external SaaS account or its pricing.

## Considered Options
1. Self-hosted Spring Authorization Server in an own `auth-server` deployable.
2. Keycloak.
3. SaaS identity provider (Auth0, Okta, Entra ID and similar).
4. Authentication inside `platform` without an OIDC provider.

## Decision
Build `auth-server` on Spring Authorization Server (the line aligned with Spring Security 7), with accounts, credentials, MFA and passkeys in our own code and database `cl_auth`.

- Exposes standard OIDC endpoints: discovery, authorize, token, JWKS, UserInfo, revocation, RP-initiated logout.
- Clients are registered in the JDBC `RegisteredClientRepository`; the first client is the `bff` (confidential, authorization code + PKCE).
- Login, registration and MFA screens are our own React UI ([ADR-IDENTITY-0008](0008-react-login-ui-served-by-auth-server.md)).

Rejected: Keycloak (hides the mechanics behind an admin console, which lowers teaching value; a heavy JVM with its own database and upgrade cycle on a small shared node; theming the login UI in React is awkward). SaaS (external dependency and cost, data outside the lab, nothing to teach about the provider side). Authentication inside platform (mixes identity with business modules and prevents SSO for later clients).

## Consequences
### Positive
- Full control and visibility of every flow; each one maps to a book chapter.
- One technology stack; lower memory use than Keycloak.
### Negative / Trade-offs
- We own the security of the identity provider, including features a product would give for free (admin UI, brute-force protection, key rotation).
- New Spring Security 7 features (MFA, WebAuthn) may change between minor versions.
### Follow-up actions
- Verify against current docs how Authorization Server is packaged and configured in the Spring Security 7 line.
- Run the OpenID Foundation conformance suite (basic OP profile) once the flows work.

## Compliance / Verification
Integration tests for each OIDC endpoint; OIDC discovery document checked in CI; ZAP scan of the auth host.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §1, §3, §4
- ADRs: [ADR-SHARED-0003](../../shared/adr/0003-modular-monolith-with-three-deployables.md), [ADR-SHARED-0004](../../shared/adr/0004-runtime-framework-and-build-versions.md), [ADR-IDENTITY-0002](0002-session-for-login-tokens-for-services.md), [ADR-BFF-0001](../../bff/adr/0001-backend-for-frontend-tokens-stay-server-side.md)
