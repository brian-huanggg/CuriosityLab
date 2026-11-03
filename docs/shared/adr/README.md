# Architecture Decision Records — shared

Cross-cutting decisions for CuriosityLab, one file per decision (`NNNN-kebab-case-title.md`, MADR-style, English). Referenced from other folders as `ADR-SHARED-NNNN`. See [ADR-SHARED-0001](0001-record-architecture-decisions.md) for the process.

## Rules

- Numbers are sequential within this folder and never reused.
- An accepted ADR is immutable. To change a decision, add a new ADR that supersedes the old one and update the `Supersedes / Superseded by` lines in both.
- When a decision changes, update [`../architecture.md`](../architecture.md) (§15 index) to match.
- Status values: `Accepted` (confirmed by the Owner), `Proposed` (recommended by the architect, awaiting confirmation), `Proposed (deferred)` (planned for a later phase). Mixed statuses mean different parts of the decision are at different stages.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-separate-engineering-docs-and-public-book.md) | Separate engineering docs and public book | Accepted |
| [0003](0003-modular-monolith-with-three-deployables.md) | Modular monolith with three deployables | Accepted |
| [0004](0004-runtime-framework-and-build-versions.md) | Runtime, framework and build versions | Accepted / Proposed (frontend versions) |
| [0005](0005-mariadb-database-per-deployable-and-uuid-keys.md) | MariaDB 11.8, database per deployable, UUID keys | Accepted (MariaDB, UUID) / Proposed (UUIDv7, database per deployable) |
| [0006](0006-spring-data-jpa-with-hibernate.md) | Spring Data JPA with Hibernate 7 | Accepted |
| [0007](0007-shared-schema-multi-tenancy.md) | Shared-schema multi-tenancy | Accepted |
| [0008](0008-event-driven-integration-with-jdbc-event-publication-registry.md) | Event-driven integration with JDBC Event Publication Registry | Accepted |
| [0009](0009-gitops-with-argo-cd.md) | GitOps with Argo CD | Accepted |
| [0010](0010-secrets-with-external-secrets-operator.md) | Secrets with External Secrets Operator | Accepted |
| [0011](0011-kubernetes-namespaces.md) | Kubernetes namespaces | Accepted |
| [0012](0012-observability-with-grafana-stack.md) | Observability with the Grafana stack | Accepted (Grafana stack) / Proposed (components) |
| [0013](0013-react-for-all-user-interfaces.md) | React for all user interfaces | Accepted |

## Related documents

- [Shared architecture](../architecture.md)
- [Identity ADRs](../../identity/adr/README.md)
- [BFF ADRs](../../bff/adr/README.md)
