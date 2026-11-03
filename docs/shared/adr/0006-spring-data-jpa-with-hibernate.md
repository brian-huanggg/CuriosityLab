# ADR-SHARED-0006: Spring Data JPA with Hibernate 7

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
Every module in `platform` and the `auth-server` need persistence on MariaDB. The platform uses shared-schema multi-tenancy, so tenant filtering must be applied consistently and cannot depend on each query remembering it. Many readers come from RuoYi-style projects that use MyBatis-Plus, so the book must explain the choice.

## Decision Drivers
- Automatic, hard-to-forget tenant filtering.
- Data scope (department, own records) expressed once and reused.
- Optimistic locking and auditing columns without boilerplate.
- First-class support in Spring Boot, Spring Modulith and Spring Authorization Server.

## Considered Options
1. Spring Data JPA with Hibernate 7.
2. MyBatis-Plus (RuoYi style), SQL in mappers with a tenant plugin.
3. jOOQ, type-safe SQL generated from the schema.

## Decision
Use option 1.

- Repositories use Spring Data JPA; Hibernate 7 is the provider.
- Tenant-scoped entities map `tenant_id` with Hibernate `@TenantId`, so Hibernate adds the tenant to reads and writes ([ADR-SHARED-0007](0007-shared-schema-multi-tenancy.md)).
- Data scope rules (department, group, own records) are JPA Specifications built by the `member` module and combined with other criteria.
- `@Version` for optimistic locking; Spring Data auditing fills `created_*` and `updated_*`.
- Native SQL is allowed for reporting or vector queries, reviewed for tenant filtering.

Rejected: MyBatis-Plus (tenant and data scope rely on SQL rewriting plugins, and hand-written SQL makes it easy to skip a filter; also less integrated with the Spring Data ecosystem); jOOQ (excellent SQL control, but tenant filtering is not built in and the code generation step adds build work; may still be used for complex reports later).

## Consequences
### Positive
- Tenant filtering is enforced by the ORM, not by each query.
- Specifications give a single, testable implementation of data scope.
- Spring Modulith event registry and Authorization Server JPA samples fit directly.
### Negative / Trade-offs
- JPA hides SQL: N+1 queries and lazy-loading errors must be watched.
- Readers used to MyBatis must learn entity state and the persistence context.
### Follow-up actions
- Verify `@TenantId` behaviour in Hibernate 7 (native queries, bulk updates) against current docs.
- Enable SQL logging and query-count assertions in integration tests.

## Compliance / Verification
Tenant isolation test suite; review rule that every native query includes `tenant_id`; Hibernate statistics checks in integration tests for N+1.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §4, §7.2, §7.3
- ADRs: ADR-SHARED-0005, ADR-SHARED-0007
