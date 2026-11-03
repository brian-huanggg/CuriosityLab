# ADR-SHARED-0014: Changelogs per deployable with git-cliff

- Status: Accepted (git-cliff per deployable) / Proposed (tag scheme, commit linting)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The monorepo holds several things that are released separately: three Spring Boot deployables (`auth-server`, `bff`, `platform`) and the React SPA (`web`), next to an internal library (`backend/libs/commons`), the internal docs and the public book ([ADR-SHARED-0003](0003-modular-monolith-with-three-deployables.md)). The repository mixes Gradle and npm ([ADR-SHARED-0004](0004-runtime-framework-and-build-versions.md)) and is hosted on GitLab. Deployments are recorded by Argo CD in Git ([ADR-SHARED-0009](0009-gitops-with-argo-cd.md)), but nothing yet records *what changed* in a version of a deployable. Commits already use Conventional Commits with a scope (`docs(bff): …`).

## Decision Drivers
- One developer: producing a changelog must cost almost nothing per change.
- Works for Gradle and npm projects alike, and on GitLab.
- One changelog per deployable; a change to `bff` must not appear in the `auth-server` changelog.
- A standard format readers and tools recognise.
- The book can show and explain the process.

## Considered Options
1. **git-cliff**, generating each deployable's changelog from Conventional Commits, filtered by path and tag.
2. **Changesets**: a change file per merge request, combined at release.
3. **changie**: change files like Changesets, independent of the language.
4. **release-please** or **semantic-release**: version bump, changelog and release from commits.
5. A hand-written `CHANGELOG.md`.

## Decision
Use option 1.

- **Format:** [Keep a Changelog 1.1](https://keepachangelog.com/en/1.1.0/) with [SemVer 2.0](https://semver.org/spec/v2.0.0.html). Sections: Added, Changed, Deprecated, Removed, Fixed, Security.
- **One `CHANGELOG.md` per deployable**, next to its code: `backend/auth-server/`, `backend/bff/`, `backend/platform/`, `web/`. There is no root changelog.
- **No changelog** for `backend/libs/commons` or the version catalog: they ship inside the backend deployables, so their commits are listed in each backend deployable's changelog. `docs/` and `site/` have none either.
- **Configuration:** one `cliff.toml` at the repository root. `scripts/changelog.sh <deployable> [next|release|notes]` adds the deployable's `--include-path` and `--tag-pattern`; running `git cliff` directly is not supported.
- **Commit types → sections:** `feat` → Added; `fix` → Fixed; `perf`, `refactor`, `revert` → Changed; `build`, `ci`, `chore`, `docs`, `style`, `test` are left out. A breaking change (`!` or `BREAKING CHANGE:`) is always listed and marked **BREAKING**. A `Changelog:` trailer (GitLab's convention) overrides the type: `security`, `deprecated`, `removed` or `ignore`.
- **Versions and tags (Proposed):** each deployable has its own SemVer version, tagged `<deployable>/v<semver>` (e.g. `bff/v1.2.0`). The first release is `0.1.0`. Before 1.0.0 a breaking change bumps the minor version. The container image in Harbor is tagged with the same version; Argo CD still deploys by digest.
- **Release steps:** `tag=$(scripts/changelog.sh <deployable> release)`, then commit `chore(release): $tag` and create the annotated tag. `scripts/changelog.sh <deployable> notes` gives the body of the GitLab Release. The script never commits, tags or pushes.
- **Commit linting (Proposed):** commitlint in the merge request pipeline checks the type and the scope (`auth-server`, `bff`, `platform`, `web`, `commons`, `docs`, `site`, `deploy`, `ci`).
- **Tool version:** git-cliff 2.14.x, pinned in CI.

Rejected: Changesets (needs a `package.json` per package and is built for npm publishing; most units here are Gradle projects); changie (better wording for users, but one more file per merge request is not worth it for one developer; it remains the upgrade path, see Consequences); release-please (GitHub-first, GitLab is not supported well); semantic-release (weak monorepo support and publishes on its own); hand-written (drifts and causes merge conflicts).

## Consequences
### Positive
- No extra file per change: the commit message is the changelog entry.
- The same tool and configuration for Gradle and npm deployables.
- Scoped tags make it clear from `git tag` which deployable a version belongs to.
- The changelog, the GitLab Release and the image tag use the same version.
### Negative / Trade-offs
- Entries are only as good as the commit messages; a careless commit becomes a careless entry. Squash merges must use a good title.
- A commit that touches several deployables appears in each of their changelogs.
- `CHANGELOG.md` is generated: hand edits are overwritten on the next run.
### Follow-up actions
- Add the commitlint job and a `release` job (pinned git-cliff 2.14.x) to `.gitlab-ci.yml` once the pipeline exists.
- Add a "commit message is changelog-ready" item to the merge request checklist.
- Revisit with change files (changie) if other contributors join or the book needs notes written for readers.

## Compliance / Verification
commitlint passes on every merge request; each release tag matches `^(auth-server|bff|platform|web)/v\d+\.\d+\.\d+$`; the release commit changes the deployable's `CHANGELOG.md`.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §14, §15
- ADRs: ADR-SHARED-0003, ADR-SHARED-0004, ADR-SHARED-0009
