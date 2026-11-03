# ADR-SHARED-0009: GitOps with Argo CD

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab is built and operated by one person and deployed to the single-node lab cluster `k3s-node`. Argo CD (v3.x) is already installed in namespace `argocd`. The cluster state must be reproducible, reviewable and recoverable from Git, and CI should not hold cluster credentials.

## Decision Drivers
- Git is the single source of truth for what runs in the cluster.
- No cluster credentials in GitLab CI.
- Drift is visible and corrected automatically.
- Rollback is a Git revert.
- Teachable: the book shows a standard GitOps flow.

## Considered Options
1. GitOps with Argo CD syncing Helm charts from Git (chosen).
2. Push-based deploy from CI (`helm upgrade` / `kubectl apply` in a pipeline job).
3. Manually applied YAML.

## Decision
Use option 1.
- One Helm chart per deployable in `deploy/charts/<deployable>/`, lab values in `deploy/envs/lab/values-*.yaml`, Argo CD `Application` manifests in `deploy/argocd/`.
- CI only builds images, pushes them to `harbor.pf.internal/lab` and updates the image digests in Git (`deploy` stage).
- CI never runs `helm upgrade` or `kubectl apply`. Argo CD is the only actor that changes CuriosityLab resources.
- Images are referenced by digest, built once per commit and promoted by digest.
- Open item OI-03: manifests stay in the monorepo (`deploy/`) or move to a separate deployment repo.

Rejected options:
- Push-based deploy from CI: CI needs cluster credentials, and the cluster state is not described in Git.
- Manual YAML: not reproducible, not reviewed, drifts silently.

## Consequences
### Positive
- Every change to the cluster is a reviewed commit; rollback is a revert.
- No kubeconfig in CI; drift is shown in Argo CD.
### Negative / Trade-offs
- CI must write commits to the manifests, which needs a scoped Git credential and avoids CI loops.
- Debugging spans CI, Git and Argo CD.
- Manifests in the monorepo mix app and deploy history until OI-03 is decided.
### Follow-up actions
- Decide OI-03 before the first Application is created.
- Define sync policy (automated sync, prune, self-heal) per Application; verify options against current Argo CD 3.x docs.

## Compliance / Verification
CI configuration review: no `helm upgrade`, `helm install` or `kubectl apply` in `.gitlab-ci.yml`; Argo CD shows every CuriosityLab Application `Synced` and `Healthy`.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Shared architecture: §10, §11, §14, §17 (OI-03)
- ADRs: [ADR-SHARED-0010](0010-secrets-with-external-secrets-operator.md), [ADR-SHARED-0011](0011-kubernetes-namespaces.md)
