# ADR-SHARED-0002: Separate engineering docs and public book

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab produces two kinds of writing. Engineering documents (PRDs, architecture, ADRs) are precise, English and internal. The tutorial book explains the platform to readers, is written in Traditional Chinese first, and is public. The two have different audiences, languages and change rhythms. The owner also wants the book readable on HackMD.

## Decision Drivers
- Different audiences: the developer versus public readers.
- One source of truth in Git, reviewed with the code.
- Engineering docs must stay small and scoped to one module or deployable.
- Readers should be able to read the book on HackMD without it becoming a second source.

## Considered Options
1. `docs/` for internal engineering docs per module, `site/` for the public book (VitePress), HackMD as a read-only mirror pushed by CI.
2. HackMD as the source of the book, copied into the repository.
3. A single platform-wide PRD and architecture document with the book generated from it.

## Decision
Use option 1.

- `docs/` is internal and English. It is split per module or deployable; each folder holds `prd.md`, `architecture.md` and `adr/` when relevant. Cross-cutting conventions live in `docs/shared/`. There is no platform-wide PRD or architecture document.
- `site/` is the public book, built with VitePress. Traditional Chinese (zh-TW) first; English later.
- CI pushes the book to HackMD as a read-only mirror. Edits on HackMD are not accepted back.
- The book links to ADRs by identifier (`ADR-SHARED-NNNN`) instead of copying their content.

Rejected: HackMD as the source (edits are not reviewed with the code, and two-way sync creates conflicts); a single platform-wide document (grows into one large file that every module change touches, and mixes concerns of unrelated products).

## Consequences
### Positive
- Each audience gets a fitting format and language.
- Git stays the only source; HackMD can be rebuilt at any time.
- Module docs stay small and owned by the module.
### Negative / Trade-offs
- The same topic is written twice: precise in `docs/`, explanatory in `site/`.
- Comments made on HackMD must be carried back by hand.
- CI needs a HackMD token, which comes from Vault.
### Follow-up actions
- Add the CI job that publishes `site/` to HackMD; verify the HackMD API limits against current docs.
- Mark mirrored notes as read-only and link back to the repository.

## Compliance / Verification
Review rule: no book content in `docs/`, no internal decision text in `site/` without an ADR link. The HackMD job runs only from the default branch.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §14
- ADRs: ADR-SHARED-0001
