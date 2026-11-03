# ADR-IDENTITY-0003: Permissions resolved by platform, not in the JWT

- Status: Proposed
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab uses RBAC plus ABAC with data scope, and a person can be a member of several workspaces with different roles in each. A common design puts roles or permissions into the access token. With many workspaces, fine-grained permissions and role changes by tenant admins, such tokens become large, workspace-specific and stale until they expire.

## Decision Drivers
- Permissions differ per workspace; the active workspace is chosen in the bff session ([ADR-BFF-0004](../../bff/adr/0004-active-workspace-in-session.md)).
- Role changes must take effect within seconds, not at the next token refresh.
- Identity must not depend on platform's member data.
- Authorization checks must stay cheap on every request.

## Considered Options
1. JWT carries `sub` and scopes only; platform resolves roles, permissions and ABAC attributes, cached in Redis and evicted by events.
2. Roles and permissions as JWT claims, added by a token customizer that calls platform.
3. One token per workspace with permissions embedded.

## Decision
Use option 1.

- The access token contains `sub`, standard claims and coarse API scopes. No roles, permissions or tenant id.
- Platform's `member` module resolves membership, roles, permissions and ABAC attributes for (`sub`, tenant) and caches them in Redis.
- Events such as `MemberRoleChanged` and `MemberRemoved` evict the cache entries after commit.
- The SPA fetches its effective permissions from platform to hide UI; platform always enforces.

Rejected: permissions in the JWT (stale for up to the token lifetime, token size, identity would call platform during token issuance and couple the deployables); per-workspace tokens (token churn on every workspace switch, still stale).

## Consequences
### Positive
- Role changes apply on the next request after eviction.
- auth-server stays free of business data; tokens stay small.
### Negative / Trade-offs
- Platform needs a cache and an eviction path; a missed eviction means stale permissions until TTL.
- Other future resource servers must also call `member` (or its API) for permissions.
### Follow-up actions
- Define the cache key, TTL safety net and eviction events in the member architecture.

## Compliance / Verification
Test that the issued JWT contains no role, permission or tenant claim; integration test that a role change is effective on the next request.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §7.1; Shared architecture: §8.1, §9
- ADRs: [ADR-IDENTITY-0004](0004-account-and-member-data-ownership.md), [ADR-SHARED-0008](../../shared/adr/0008-event-driven-integration-with-jdbc-event-publication-registry.md), [ADR-BFF-0004](../../bff/adr/0004-active-workspace-in-session.md)
