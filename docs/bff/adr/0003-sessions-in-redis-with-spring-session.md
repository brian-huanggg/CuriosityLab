# ADR-BFF-0003: Sessions in Redis with Spring Session

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The bff keeps the user's tokens and active workspace in a server-side session ([ADR-BFF-0001](0001-backend-for-frontend-tokens-stay-server-side.md)). Every API request reads the session, and a token refresh writes it. The session must survive a bff Pod restart or rollout and must be shared if the bff runs more than one replica. The bff has no database of its own.

## Decision Drivers
- Availability: a bff restart or rollout must not log users out.
- Shared state across replicas without sticky sessions.
- Low latency: one session read per request.
- Server-side TTL for the idle timeout and immediate invalidation.
- Redis is already needed for platform caches and rate-limit counters.

## Considered Options
1. Spring Session Data Redis (reactive).
2. Spring Session JDBC on MariaDB.
3. In-memory `WebSession` with sticky sessions at Traefik.

## Decision
Use option 1. Sessions are stored in Redis (namespace `databases`) through Spring Session Data Redis with the reactive repository.

- Idle timeout through the Redis TTL (max inactive interval); absolute timeout through a custom `WebFilter` using a `createdAt` attribute.
- Session ID rotated at login.
- Session keys use a CuriosityLab-specific prefix so the instance can be shared (shared OI-06).
- Redis is **not backed up**. Sessions are disposable: if Redis data is lost, users log in again ([Shared architecture: §13](../../shared/architecture.md#13-backup-and-recovery)).
- Use the indexed repository variant if it is needed to find all sessions of a principal for "log out on all devices" ([ADR-BFF-0007](0007-logout-and-session-termination.md)).

Option 2 is rejected because the bff would need its own database, migrations and a cleanup job, and a database round trip on every request adds latency. Option 3 is rejected because a Pod restart or rollout logs out every user on that Pod and load is uneven.

## Consequences
### Positive
- bff Pods are stateless and can be restarted or scaled freely.
- Session expiry is handled by Redis TTL; no cleanup job.
### Negative / Trade-offs
- Redis becomes a hard dependency: if it is down, nobody is logged in.
- Tokens are at rest in Redis; Redis access must be restricted by `NetworkPolicy` and a password from ESO.
- Absolute timeout needs custom code.
### Follow-up actions
- Verify against current Spring Session docs which reactive Redis repository supports find-by-principal and session events.
- Decide shared OI-06 (dedicated or shared Redis).

## Compliance / Verification
Testcontainers (Redis) integration tests: session survives bff restart, idle and absolute expiry, ID rotation at login, invalidation. `NetworkPolicy` test: only bff, platform and auth-server reach Redis.

## Related
- PRD: — (module PRD not written yet)
- Architecture: bff architecture §5; Shared architecture: §3, §13
- ADRs: ADR-BFF-0001, ADR-BFF-0007, [ADR-SHARED-0011](../../shared/adr/0011-kubernetes-namespaces.md)
