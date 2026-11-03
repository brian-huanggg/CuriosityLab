# ADR-IDENTITY-0004: Account and member data ownership

- Status: Proposed (JIT provisioning)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
Two deployables hold data about the same person: `auth-server` (database `cl_auth`) proves who they are, and `platform` (database `cl_platform`) knows what they are in each workspace. Without a clear owner for each field, email and names are copied in both directions and drift. Databases are separate per deployable ([ADR-SHARED-0005](../../shared/adr/0005-mariadb-database-per-deployable-and-uuid-keys.md)), so no join is possible.

## Decision Drivers
- One owner per piece of data.
- No synchronous dependency from login on platform being available.
- Simple linking key that survives email changes.

## Considered Options
1. Account (identity) vs member (platform), linked by `account_id` = OIDC `sub`; platform JIT-provisions its member profile on the first authenticated request.
2. Identity pushes an `AccountCreated` event to platform, which creates the member.
3. One shared user table read by both deployables.

## Decision
Use option 1.

| Owned by identity (`account`) | Owned by platform (`member`) |
|---|---|
| Account id, email, email verified, display name, credentials, MFA, passkeys, status | Member profile, workspace memberships, roles, groups, departments, ABAC attributes |

- `account.id` (UUIDv7) is the OIDC `sub` and the only identifier platform stores.
- On a request with an unknown `sub`, platform calls UserInfo with the same access token, creates the member profile with a copy of `email` and `name`, and continues. Creation is idempotent (unique `account_id`).
- Platform refreshes its copy from UserInfo when stale (e.g. at most daily); identity is the source of truth.
- Workspace membership is created by platform (invitation, workspace creation), never by identity.

Rejected: event push (needs a cross-deployable event channel that does not exist yet, and a member without any workspace would be created for every registration); shared table (breaks database per deployable).

## Consequences
### Positive
- Login never depends on platform; identity holds no business data.
- Email change does not break the link.
### Negative / Trade-offs
- Profile copies in platform can be stale for up to the refresh interval.
- Account deletion needs a later cross-deployable signal to clean up members.
### Follow-up actions
- Define account deletion and disable propagation together with OI-IDN-03.

## Compliance / Verification
Integration test: first request with a new `sub` creates exactly one member, also under concurrent requests.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §1.2, §6.7
- ADRs: [ADR-IDENTITY-0003](0003-permissions-resolved-by-platform-not-in-jwt.md), [ADR-SHARED-0005](../../shared/adr/0005-mariadb-database-per-deployable-and-uuid-keys.md)
