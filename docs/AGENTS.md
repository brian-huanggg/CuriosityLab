# AGENTS.md — docs/

Rules for agents writing or editing the engineering docs in `docs/`. Read [`README.md`](README.md) for the layout first. The process for decisions is defined in [ADR-SHARED-0001](shared/adr/0001-record-architecture-decisions.md).

## Scope and language

- `docs/` holds internal engineering docs (PRD, architecture, ADRs). They are written in **English** and are not published.
- The public tutorial book lives in `site/` (VitePress, Traditional Chinese). Do not put book content in `docs/` or engineering detail in `site/`. See [ADR-SHARED-0002](shared/adr/0002-separate-engineering-docs-and-public-book.md).
- Docs are split by module or deployable. Cross-cutting conventions belong in `shared/`. There is no platform-wide PRD or architecture document.
- Do not hand-write API reference. `openapi.json` is generated at build time per deployable.

## Folder layout

```
<module>/
├── prd.md            # What: requirement IDs, e.g. IDN-AUTH-005
├── architecture.md   # How: includes an ADR index section
└── adr/
    ├── README.md     # Rules and ADR index for this folder
    └── NNNN-kebab-case-title.md
```

A new module folder needs its own ADR prefix, added to the prefix table in [`README.md`](README.md).

## ADRs

- Number sequentially **within the folder**, and never reuse a number.
- File name: `NNNN-kebab-case-title.md`. Title line: `# ADR-<PREFIX>-NNNN: Title`, e.g. `# ADR-IDENTITY-0007: Passkeys with Spring Security WebAuthn`.
- Header bullets: `Status`, `Date` (YYYY-MM-DD), `Deciders`, `Supersedes / Superseded by` (`—` when none).
- Sections, in this order: `Context`, `Decision Drivers`, `Considered Options`, `Decision`, `Consequences` (`Positive`, `Negative / Trade-offs`, `Follow-up actions`), `Compliance / Verification`, `Related`.
- Status values: `Accepted` (confirmed by the Owner), `Proposed` (architect's recommendation awaiting the Owner), `Proposed (deferred)` (planned for a later phase). Mixed statuses are allowed when parts of a decision are at different stages, e.g. `Accepted (BFF holds tokens) / Proposed (token lifetimes)`.
- **Do not edit an `Accepted` ADR's decision.** Write a new ADR that supersedes it and update the `Supersedes / Superseded by` line in both files.
- Agents must not mark an ADR `Accepted`. Only the Owner confirms decisions; write new ADRs as `Proposed`.
- Cross-folder references always use the prefix (`ADR-SHARED-NNNN`, `ADR-IDENTITY-NNNN`, `ADR-BFF-NNNN`), because numbers are only unique per folder. Link to the file with a relative path.
- When you add or change an ADR, update in the same change:
  - the index table in that folder's `adr/README.md`;
  - the ADR index section in that module's `architecture.md`.

## Mermaid diagrams

Diagrams are written as fenced ` ```mermaid ` blocks. The same blocks are rendered by VitePress in `site/`, so they must parse.

1. **Do not write `;` inside diagram text.** Mermaid treats `;` as a statement separator, so the rest of the line is parsed as a new statement and the diagram fails to render. Use `:` or `,` instead, or the entity `#59;` if a literal semicolon is required. The `;` that ends an entity code (`#59;`, `&lt;`) is fine.

   Bad:

   ```mermaid
   sequenceDiagram
       participant A as auth-server
       participant DB as cl_auth
       A->>DB: Update signature count, last used; event LOGIN_SUCCEEDED (PASSKEY)
   ```

   Good:

   ```mermaid
   sequenceDiagram
       participant A as auth-server
       participant DB as cl_auth
       A->>DB: Update signature count, last used: event LOGIN_SUCCEEDED (PASSKEY)
   ```
