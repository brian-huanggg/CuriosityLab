# CuriosityLab — Engineering Docs

Internal engineering documentation (English, not published). The public tutorial book lives in `site/` (VitePress, Traditional Chinese first) and is mirrored read-only to HackMD. See [ADR-SHARED-0002](shared/adr/0002-separate-engineering-docs-and-public-book.md).

## Layout

Docs are split **by deployable or module**. There is no platform-wide PRD or architecture document; cross-cutting conventions are owned by `shared`.

| Folder | Scope | Deployable |
|---|---|---|
| [`shared/`](shared/) | Shared kernel and conventions every module and deployable follows: module rules, data, tenancy, events, deployment, observability | all |
| [`identity/`](identity/) | Accounts, credentials, MFA, passkeys, OIDC provider | `auth-server` |
| [`bff/`](bff/) | Browser session, token handling, routing, edge protection | `bff` |
| `member/` | Users in a tenant, departments, groups, RBAC/ABAC, data scope | `platform` (planned) |
| `tenant/` | Workspace lifecycle | `platform` (planned) |
| `audit/` | Append-only audit records | `platform` (planned) |
| `storage/` | S3 abstraction, upload, quotas | `platform` (planned) |
| `notification/` | In-app and email notifications | `platform` (planned) |
| `todo/` | Tasks and projects | `platform` (planned) |

Each folder contains, when relevant:

```
<module>/
├── prd.md            # What the module does (requirement IDs, e.g. IDN-AUTH-005)
├── architecture.md   # How it is built
└── adr/              # Why: numbered decisions, one file each
```

API reference is not hand-written: `openapi.json` is generated at build time per deployable.

## ADR identifiers

ADRs are numbered **per folder**. Refer to them across folders with a prefix:

| Prefix | Folder |
|---|---|
| `ADR-SHARED-NNNN` | `shared/adr/` |
| `ADR-IDENTITY-NNNN` | `identity/adr/` |
| `ADR-BFF-NNNN` | `bff/adr/` |

The process is defined once in [ADR-SHARED-0001](shared/adr/0001-record-architecture-decisions.md).

## Status values

- `Accepted`: confirmed by the Owner.
- `Proposed`: recommended by the architect, awaiting confirmation.
- `Proposed (deferred)`: planned for a later phase.
- Mixed statuses mean different parts of the decision are at different stages.
