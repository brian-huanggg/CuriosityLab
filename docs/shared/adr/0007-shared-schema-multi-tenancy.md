# ADR-SHARED-0007: Shared-schema multi-tenancy

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab hosts many workspaces (tenants) on one MariaDB instance on a single small node. Tenants must never see each other's data, and isolation must be provable for the book. The number of tenants is unknown and creating a tenant should be a normal application action, not an infrastructure task.

## Decision Drivers
- Strong, testable tenant isolation.
- Low cost per tenant on a 4 vCPU / 16 GB node.
- Tenant creation without schema or database provisioning.
- One Flyway migration path for all tenants.

## Considered Options
1. Shared schema with a `tenant_id` discriminator column.
2. Schema per tenant.
3. Database per tenant.

## Decision
Use option 1.

- Every tenant-scoped table has `tenant_id UUID NOT NULL`, mapped with Hibernate `@TenantId` ([ADR-SHARED-0006](0006-spring-data-jpa-with-hibernate.md)).
- The tenant is taken from the `X-Tenant-Id` header set by the bff from the session ([ADR-BFF-0004](../../bff/adr/0004-active-workspace-in-session.md)). Platform verifies the caller's membership on every request (cached); a forged header returns 403 and writes an audit event.
- The verified tenant is stored in a request-scoped context read by `CurrentTenantIdentifierResolver`. The tenant never comes from the URL, the body or the JWT.
- Every tenant-scoped unique or lookup index starts with `tenant_id`.
- Non-tenant tables (e.g. `tenant_tenant`, framework tables) are listed explicitly and reviewed.

Rejected: schema-per-tenant (in MariaDB a new database per tenant, migrations run N times, connection pools per tenant); database-per-tenant (strongest isolation but too much operational cost and memory for one node and one developer).

## Consequences
### Positive
- Creating a tenant is an insert; one migration serves all tenants.
- Isolation is enforced by the ORM and proven by tests.
### Negative / Trade-offs
- One missing filter leaks data across tenants; native SQL needs extra review.
- Per-tenant backup or restore needs filtered exports.
- A noisy tenant affects all tenants.
### Follow-up actions
- Build the tenant isolation test suite (tenant A cannot read or change tenant B's rows through any endpoint).
- Verify `@TenantId` handling of native queries and bulk operations against current docs.

## Compliance / Verification
Tenant isolation suite in the CI `test` stage; schema check that every non-listed table has `tenant_id` and tenant-first indexes.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §5.6, §7.2, §7.3, §9
- ADRs: ADR-SHARED-0005, ADR-SHARED-0006, ADR-BFF-0004, ADR-IDENTITY-0003
