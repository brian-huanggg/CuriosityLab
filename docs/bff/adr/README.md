# Architecture Decision Records — bff

Decisions for the `bff` deployable (browser session, token handling, routing, edge protection), one file per decision (`NNNN-kebab-case-title.md`, MADR-style, English). Referenced from other folders as `ADR-BFF-NNNN`. See [ADR-SHARED-0001](../../shared/adr/0001-record-architecture-decisions.md) for the process.

## Rules

- Numbers are sequential within this folder and never reused.
- An accepted ADR is immutable. To change a decision, add a new ADR that supersedes the old one and update the `Supersedes / Superseded by` lines in both.
- When a decision changes, update [`../architecture.md`](../architecture.md) (§15 index) to match.
- Status values: `Accepted` (confirmed by the Owner), `Proposed` (recommended by the architect, awaiting confirmation), `Proposed (deferred)` (planned for a later phase). Mixed statuses mean different parts of the decision are at different stages.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-backend-for-frontend-tokens-stay-server-side.md) | Backend for Frontend, tokens stay server-side | Accepted |
| [0002](0002-spring-cloud-gateway-webflux.md) | Spring Cloud Gateway Server WebFlux | Proposed |
| [0003](0003-sessions-in-redis-with-spring-session.md) | Sessions in Redis with Spring Session | Accepted |
| [0004](0004-active-workspace-in-session.md) | Active workspace in the session | Proposed |
| [0005](0005-csrf-and-same-origin-spa-hosting.md) | CSRF protection and same-origin SPA hosting | Proposed |
| [0006](0006-edge-rate-limiting-and-security-headers.md) | Edge rate limiting and security headers | Proposed |
| [0007](0007-logout-and-session-termination.md) | Logout and session termination | Proposed |

## Related documents

- [bff architecture](../architecture.md)
- [Shared ADRs](../../shared/adr/README.md)
- [Identity ADRs](../../identity/adr/README.md)
