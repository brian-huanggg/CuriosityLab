# ADR-SHARED-0008: Event-driven integration with JDBC Event Publication Registry

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
`platform` is a Spring Modulith modular monolith with one module per product ([ADR-SHARED-0003](0003-modular-monolith-with-three-deployables.md)). Many changes trigger reactions in other modules: audit records, notifications, cache eviction of permissions. `audit` and `notification` must stay listeners only, and audit records must never be lost. Modules must also stay extractable into their own deployable later without rewriting their callers. Everything runs on one 4 vCPU / 16 GB node.

## Decision Drivers
- No lost audit records, notifications or cache evictions when a business change commits.
- Decoupled modules, no dependency cycles, boundaries verified by tests.
- A path to extract a module later.
- No extra infrastructure on a single, shared node.

## Considered Options
1. Spring application events with the Spring Modulith JDBC Event Publication Registry on MariaDB (chosen).
2. Direct synchronous calls between modules for reactions.
3. A message broker now (Kafka, RabbitMQ).

## Decision
Use option 1.
- Modules publish Spring application events inside the business transaction. Published event types live in the module's `events/` named interface.
- The JDBC Event Publication Registry stores each publication in `cl_platform` in the same transaction (transactional outbox).
- Listeners are `@ApplicationModuleListener` (asynchronous, after commit, own transaction).
- Incomplete publications are resubmitted on startup and by a scheduled job.
- Every listener is idempotent: a publication may be delivered more than once.
- A synchronous audit call is allowed only where no business transaction exists (e.g. a rejected request).
- Events are externalized to a broker only when a module is extracted into its own deployable. That is a later ADR.

Rejected options:
- Direct synchronous calls: create coupling and cycles, and a failing reaction would roll back or block the business change.
- A message broker now: extra memory, CPU and operations on one shared node for no gain inside a single deployable.

## Consequences
### Positive
- Reactions are not lost once the business change commits; no dual-write problem.
- Modules depend only on published event types, which keeps extraction possible.
### Negative / Trade-offs
- Reactions are eventually consistent (normally seconds).
- Listeners must be written and tested for idempotency.
- The publication table grows and incomplete publications must be monitored.
- Events between deployables (for example `auth-server` → `platform`) are not covered by this registry.
### Follow-up actions
- Configure resubmission and completed-publication cleanup; verify property names against current Spring Modulith docs.
- Metric and alert for incomplete publications.
- Decide how `auth-server` events reach `audit` in `platform` (later ADR).

## Compliance / Verification
`ApplicationModules.verify()` in the build; Modulith `Scenario` tests for each published event; alert when incomplete publications stay above 0 for 30 minutes.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Shared architecture: §5.3, §5.5, §12
- ADRs: [ADR-SHARED-0003](0003-modular-monolith-with-three-deployables.md), [ADR-SHARED-0005](0005-mariadb-database-per-deployable-and-uuid-keys.md), [ADR-IDENTITY-0003](../../identity/adr/0003-permissions-resolved-by-platform-not-in-jwt.md)
