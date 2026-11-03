# ADR-SHARED-0011: Kubernetes namespaces

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab runs on `k3s-node`, a single node shared with other lab workloads. Namespaces `databases` (MariaDB with backup CronJobs), `argocd` and `external-secrets` already exist. The platform adds application Pods, MinIO, Mailpit, Redis and an observability stack. The namespace layout sets the boundaries for NetworkPolicy, ResourceQuota, RBAC and Argo CD Applications.

## Decision Drivers
- Clear security and resource boundaries on a shared node.
- Reuse existing namespaces and their backup jobs.
- Few namespaces, so policies stay simple for one operator and easy to teach.

## Considered Options
1. Namespaces by role: `curiositylab`, `databases`, `observability`, plus existing `argocd` and `external-secrets` (chosen).
2. One namespace per deployable.
3. Everything in one namespace.

## Decision
Use option 1.

| Namespace | Content |
|---|---|
| `curiositylab` | web, bff, auth-server, platform, MinIO, Mailpit |
| `databases` | MariaDB 11.8, Redis (existing namespace) |
| `observability` | Grafana, Prometheus, Loki, Tempo, Alloy |
| `argocd`, `external-secrets` | Existing platform components |

- `curiositylab` has a default-deny `NetworkPolicy`; only listed flows are allowed (ingress from Traefik, flows to `databases`, scraping and telemetry to `observability`).
- `curiositylab` has a `ResourceQuota`; every Pod sets requests and limits.

Rejected options:
- Namespace per deployable: more policies, quotas and secret stores for no real isolation gain inside one product.
- Everything in one namespace: databases and observability would share policies and quota with apps, and the existing `databases` namespace and its backups would be duplicated.

## Consequences
### Positive
- Simple, explainable boundaries; existing backups cover `cl_auth` and `cl_platform`.
- Quota protects other lab workloads from CuriosityLab.
### Negative / Trade-offs
- Cross-namespace flows must be listed explicitly in NetworkPolicy.
- Pods within `curiositylab` need further policies to separate them from each other.
### Follow-up actions
- Write the NetworkPolicy flow list per Pod.
- Size the `ResourceQuota` from the budget in Shared architecture §10.3.
- OI-06: Redis dedicated or shared with other lab workloads.

## Compliance / Verification
Helm lint and review of `NetworkPolicy` and `ResourceQuota` manifests; a connectivity test proves that a non-listed flow is blocked.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Shared architecture: §3, §9, §10.1, §10.3, §16
- ADRs: [ADR-SHARED-0009](0009-gitops-with-argo-cd.md), [ADR-SHARED-0012](0012-observability-with-grafana-stack.md)
