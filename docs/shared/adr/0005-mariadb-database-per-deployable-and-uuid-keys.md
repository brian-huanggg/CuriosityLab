# ADR-SHARED-0005: MariaDB 11.8, database per deployable, UUID keys

- Status: Accepted (MariaDB, UUID) / Proposed (UUIDv7, database per deployable)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The lab already runs a MariaDB 12.3 instance in namespace `databases` with backup CronJobs. CuriosityLab needs a supported, stable database line for a tutorial that will be read for years, native UUID storage, and vector types for the later `ai` module. Two deployables (`auth-server`, `platform`) own persistent data and must not read each other's tables.

## Decision Drivers
- Long-term support for a tutorial.
- Native `UUID` and `VECTOR` types, vector index.
- IDs that can be generated before insert and do not reveal counts.
- Isolation between deployables at the database level.

## Considered Options
1. MariaDB 11.8 LTS, one database and user per deployable, application-generated UUIDv7 keys.
2. PostgreSQL.
3. Auto-increment integer keys.
4. One database with a schema per module.

## Decision
Use option 1.

- MariaDB 11.8 LTS replaces the 12.3 instance in the lab for this tutorial, in namespace `databases`, keeping the existing backup CronJobs (Accepted).
- Primary keys are stored as MariaDB `UUID` (Accepted). Values are UUIDv7, generated in the application (Proposed).
- One database per deployable with its own user and rights only on that database: `cl_auth` for `auth-server`, `cl_platform` for `platform` (Proposed).
- The `VECTOR` type and vector index are reserved for the later `ai` module.

Rejected: PostgreSQL (the Owner chose MariaDB); auto-increment IDs (not known before insert, guessable, expose counts); schema-per-module (in MariaDB a schema is a database, so it gives many databases inside `platform` and cross-module joins that the module rules forbid anyway; module ownership is enforced by table prefixes and Modulith instead).

## Consequences
### Positive
- Supported LTS line; native UUID and vector types without extensions.
- UUIDv7 keys are time-ordered, so inserts stay index-friendly.
- A compromised deployable cannot read the other deployable's data.
### Negative / Trade-offs
- Moving from 12.3 to 11.8 is a downgrade; existing lab data must be dumped and reloaded, not upgraded in place.
- UUIDs use more space than integers; IDs are long in URLs and logs.
### Follow-up actions
- Plan the 12.3 → 11.8 replacement and the backup job changes for `cl_auth` and `cl_platform`.
- Choose a UUIDv7 generator and verify Hibernate 7 mapping of MariaDB `UUID` against current docs.

## Compliance / Verification
Flyway migrations use `UUID` primary keys; review rejects auto-increment keys. Integration tests run on Testcontainers MariaDB 11.8; a test confirms each database user cannot access the other database.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §1.2, §7.1, §7.2, §13
- ADRs: ADR-SHARED-0006, ADR-SHARED-0007, ADR-IDENTITY-0004
