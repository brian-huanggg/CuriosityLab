# ADR-SHARED-0010: Secrets with External Secrets Operator

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
Each deployable needs secrets: database passwords, the bff OAuth2 client secret, signing keys, MinIO credentials, encryption keys for TOTP secrets. The lab keeps all secrets in Vault on a separate VM. External Secrets Operator (ESO) is already installed in namespace `external-secrets`. Deployments go through Argo CD from Git ([ADR-SHARED-0009](0009-gitops-with-argo-cd.md)), so secret values must never be in Git.

## Decision Drivers
- No plaintext secrets in Git, images, Helm values or env files.
- Vault stays the single source of truth; rotation happens in Vault.
- Applications stay unaware of Vault, which keeps them simple and portable.
- One mechanism for every Pod, with low resource cost.

## Considered Options
1. Vault → External Secrets Operator → Kubernetes Secret, mounted as a Spring config tree (chosen).
2. Vault Agent Injector (sidecar per Pod).
3. Spring Cloud Vault in each application.
4. Sealed Secrets (encrypted values in Git).

## Decision
Use option 1.
- Every Pod secret comes from Vault through an `ExternalSecret` that ESO turns into a Kubernetes `Secret`.
- The Secret is mounted as files and read with `spring.config.import=configtree:`. Secrets are not passed as environment variables.
- `ExternalSecret` and `SecretStore` manifests live in Git; values never do.
- Each deployable reads only its own Vault paths.

Rejected options:
- Vault Agent Injector: a sidecar per Pod costs memory on a small node and adds a second mechanism.
- Spring Cloud Vault: every app needs Vault auth and Vault-specific code; non-Spring Pods (MinIO, web) need another path.
- Sealed Secrets: a second source of truth beside Vault; encrypted copies in Git must be re-sealed on rotation.

## Consequences
### Positive
- One path for all Pods; apps only read files.
- Rotation in Vault reaches the cluster on the next refresh.
### Negative / Trade-offs
- Secrets exist as Kubernetes Secrets in etcd; access to Secrets must be restricted.
- A rotated value needs a reload or restart of the Pod to take effect.
- ESO and Vault become a dependency for every rollout.
### Follow-up actions
- Define the Vault role and policy per deployable (lab infra, approved by the Owner).
- Decide refresh interval and restart-on-change approach; verify against current ESO docs.

## Compliance / Verification
CI secret scan; review rule: no secret values in `deploy/`, Dockerfiles or `values-*.yaml`; every Secret in `curiositylab` is owned by an `ExternalSecret`.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Shared architecture: §2, §9, §11
- ADRs: [ADR-SHARED-0009](0009-gitops-with-argo-cd.md), [ADR-SHARED-0011](0011-kubernetes-namespaces.md)
