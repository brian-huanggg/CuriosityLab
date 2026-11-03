# ADR-BFF-0004: Active workspace in the session

- Status: Proposed
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: — (supersedes the earlier, unrecorded idea of a `tenant_id` claim in the JWT)

## Context
A user can be a member of several workspaces (tenants). Every tenant-scoped request in `platform` needs to know which workspace it acts in ([ADR-SHARED-0007](../../shared/adr/0007-shared-schema-multi-tenancy.md)). An early idea was to put `tenant_id` in the access token. That ties the token to one workspace, forces a new token on every switch, and moves membership knowledge into `auth-server`, which does not own members ([ADR-IDENTITY-0004](../../identity/adr/0004-account-and-member-data-ownership.md)).

## Decision Drivers
- Switching workspaces must be instant and must not require a new login or token.
- Membership is owned and verified by `platform`, not `auth-server`.
- The tenant must never come from the URL or body ([Shared architecture: §5.6](../../shared/architecture.md#56-api-conventions)).
- A forged tenant value must be detected and audited.

## Considered Options
1. Active workspace stored in the bff session, forwarded as `X-Tenant-Id`, verified by platform per request.
2. `tenant_id` claim in the JWT, new token on each switch.
3. Tenant in the URL path (`/api/v1/t/{tenantId}/...`).
4. Tenant chosen by the SPA and sent as a header directly.

## Decision
Use option 1.

- `POST /bff/workspace { workspaceId }` checks membership with one platform call and, on success, stores `activeWorkspaceId` in the session.
- On every proxied request the bff removes any browser-supplied `X-Tenant-Id` and sets it from the session. No active workspace means no header.
- `platform` verifies on **every** request that the token's `sub` is a member of `X-Tenant-Id` (membership cached in Redis, evicted by events). A non-member value returns `403` and produces an audit event.
- The JWT carries only `sub` and scopes ([ADR-IDENTITY-0003](../../identity/adr/0003-permissions-resolved-by-platform-not-in-jwt.md)).

Option 2 is rejected (see Context). Option 3 is rejected because the tenant leaks into URLs, logs and bookmarks, and every route needs it. Option 4 is rejected because the header would be under the control of browser JavaScript; the session value is controlled by the bff.

## Consequences
### Positive
- Instant switching; tokens stay workspace-independent.
- Defense in depth: bff sets the value, platform verifies it.
### Negative / Trade-offs
- One membership lookup per request (mitigated by the cache).
- Multiple browser tabs share one session, so switching in one tab changes the workspace for all tabs.
- Background requests in flight during a switch may run in the new workspace.
### Follow-up actions
- Define the platform membership-check endpoint in the `tenant`/`member` PRD.
- Decide whether the SPA detects a workspace change in another tab (for example via `/bff/me` on focus).

## Compliance / Verification
Tenant isolation test suite with forged `X-Tenant-Id` (expects `403` and an audit record); bff test that a browser-supplied `X-Tenant-Id` is replaced.

## Related
- PRD: — (module PRD not written yet)
- Architecture: bff architecture §8.4, §9.3; Shared architecture: §5.6, §7.3
- ADRs: [ADR-SHARED-0007](../../shared/adr/0007-shared-schema-multi-tenancy.md), [ADR-IDENTITY-0003](../../identity/adr/0003-permissions-resolved-by-platform-not-in-jwt.md), [ADR-IDENTITY-0004](../../identity/adr/0004-account-and-member-data-ownership.md)
