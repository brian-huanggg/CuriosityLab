# ADR-SHARED-0004: Runtime, framework and build versions

- Status: Accepted / Proposed (frontend versions)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The book teaches a current Spring stack, and every chapter depends on fixed major versions. The backend has several deployables (`auth-server`, `bff`, `platform`) plus a small shared library, so the build must share versions and conventions across projects. Frontend versions have not been confirmed by the Owner yet.

## Decision Drivers
- Current major versions so the book stays relevant.
- Spring Authorization Server must match the Spring Security line.
- One place for dependency versions across all deployables.
- The book should be able to compare build tools.

## Considered Options
1. Java 17, Spring Boot 4.x, Gradle Kotlin DSL multi-project with a version catalog.
2. Java 17, Spring Boot 4.x, Maven multi-module with a parent POM and BOM.
3. Java 21 or 25 LTS instead of 17.

## Decision
Use option 1 (Accepted).

- Java 17 for all backend deployables. Moving to Java 21 or 25 LTS is open item OI-07 (Virtual Threads are final from Java 21).
- Spring Boot 4.x with Spring Framework 7, Spring Security 7, Spring Modulith and Spring Authorization Server on the line that matches Spring Security 7.
- Gradle with Kotlin DSL, one multi-project build under `backend/`, versions in `gradle/libs.versions.toml`. Shared conventions in build logic, not copied per project.
- Major versions change only through a new ADR; patch versions are pinned in the catalog.
- Frontend (Proposed): TypeScript, React, MUI and Vite on their current major versions, pinned in `web/package.json`; confirmed in a later revision.

Rejected: Maven (works well, but a version catalog and Kotlin DSL make sharing versions across many projects simpler; the book still compares both); Java 21/25 now (deferred to OI-07, not rejected).

## Consequences
### Positive
- One version source for every deployable; upgrades are one change.
- The stack matches what the book teaches.
### Negative / Trade-offs
- Spring Boot 4 is a new major line; some libraries may lag behind.
- Java 17 gives up Virtual Threads and newer language features until OI-07 is decided.
- Gradle build logic is harder to read than a Maven POM for beginners.
### Follow-up actions
- Verify compatibility of springdoc-openapi, Testcontainers and Spring Cloud Gateway with Spring Boot 4.x against current docs.
- Verify that Spring Boot 4.x supports Java 17 as its baseline against current docs.
- Decide OI-07 and the frontend versions.

## Compliance / Verification
Build fails if a dependency version is declared outside the version catalog; CI uses a Java 17 toolchain.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §1.2, §4, §14, §17 (OI-07)
- ADRs: ADR-SHARED-0003, ADR-SHARED-0013
