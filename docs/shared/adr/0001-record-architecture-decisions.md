# ADR-SHARED-0001: Record architecture decisions

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab is a multi-product platform built by one developer as a teaching project. Technical decisions are often made in conversations and are then lost. The project also has a public tutorial book that must explain *why* each choice was made, so every decision needs a traceable, reviewable record. Docs are split per module and deployable, so a single global ADR list would mix unrelated decisions.

## Decision Drivers
- Single developer: decisions must not live only in memory or chat.
- Every book chapter must be traceable to a recorded decision.
- The record must be reviewed and versioned together with the code.
- Decisions belong to the module or deployable that owns them.

## Considered Options
1. MADR-style ADRs in the repository, one `adr/` folder per docs folder, with cross-folder prefixes.
2. One global ADR folder for the whole platform.
3. Wiki pages.
4. No formal record.

## Decision
Use option 1.

- Each docs folder (`shared/`, `identity/`, `bff/`, later each module) has its own `adr/` folder with sequential numbers.
- File names: `NNNN-kebab-case-title.md`. Titles: `# ADR-<PREFIX>-NNNN: Title`.
- Cross-folder references use a prefix: `ADR-SHARED-NNNN`, `ADR-IDENTITY-NNNN`, `ADR-BFF-NNNN`. New folders add a prefix in `docs/README.md`.
- Status values: `Accepted`, `Proposed`, `Proposed (deferred)`; mixed statuses are allowed when parts of a decision are at different stages.
- Accepted ADRs are immutable. A change is made by a new ADR that supersedes the old one; both `Supersedes / Superseded by` lines are updated.
- Language: English. ADRs, PRDs and architecture documents are internal engineering docs. The public book is separate ([ADR-SHARED-0002](0002-separate-engineering-docs-and-public-book.md)).

Rejected: one global ADR folder (mixes unrelated decisions and grows without structure); wiki pages (drift from the code and are not reviewed with it); no record (decisions are lost and the book cannot cite them).

## Consequences
### Positive
- Decisions are versioned, reviewed and traceable from the book and the architecture documents.
- Each module's decisions stay next to its PRD and architecture.
### Negative / Trade-offs
- Numbers are not globally unique; references across folders always need the prefix.
- Every significant technical change needs an ADR, which adds writing effort.
### Follow-up actions
- Keep the ADR index in each folder's `adr/README.md` and the architecture ADR index in sync.
- Add an "ADR needed?" item to the merge request checklist.

## Compliance / Verification
Merge request checklist item "ADR needed?"; review that every new ADR appears in its folder index.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §15
- ADRs: ADR-SHARED-0002
