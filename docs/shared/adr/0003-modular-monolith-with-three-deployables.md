# ADR-SHARED-0003: Modular monolith with three deployables

- Status: Accepted
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab will contain many products (identity, members, storage, drive, docs, mail client, todo, comms, AI). One developer builds and operates it on a single 4 vCPU / 16 GB node. Product modules need clear, enforced boundaries, but a distributed system for every product would cost too much to run and to teach. Identity and the browser edge have very different security configurations from the business modules.

## Decision Drivers
- One developer; limited CPU and memory on one node.
- Enforced module boundaries that the book can demonstrate.
- A realistic extraction path for modules with different runtime needs (comms, ai).
- Clean, separate Spring Security configurations for the Authorization Server, the browser edge and the resource server.

## Considered Options
1. Spring Modulith monolith `platform` plus separate `auth-server` and `bff` deployables, and a static `web` container.
2. Microservices from the start (one service per product).
3. One single deployable containing the Authorization Server, the edge and all modules.

## Decision
Use option 1.

- `platform`: one Spring Boot application with Spring Modulith; one application module per product. `ApplicationModules.verify()` runs in the test suite.
- `auth-server`: Spring Authorization Server, accounts, credentials, MFA, passkeys and the login UI.
- `bff`: browser session, token storage and routing; no business logic.
- `web`: static container that serves the React SPA.
- Cross-module reactions use events ([ADR-SHARED-0008](0008-event-driven-integration-with-jdbc-event-publication-registry.md)). Modules that later need their own runtime (e.g. `comms` for WebSockets, `ai` for long-running work) can be extracted; their events are then externalized to a broker.

Rejected: microservices first (operational cost, distributed transactions and many pipelines on one small node); a single deployable including the Authorization Server (the authorization server, OAuth2 client and resource server filter chains tangle in one application, and a defect in business code would share the process with credential handling).

## Consequences
### Positive
- Three Spring Boot processes instead of one per product.
- Module boundaries fail the build when violated; module diagrams can be generated.
- Each deployable has one clear security role.
### Negative / Trade-offs
- All business modules in `platform` scale and deploy together.
- Calls between deployables need tokens, timeouts and their own tests.
### Follow-up actions
- Write the extraction criteria for a module (separate runtime need, scaling, team) before extracting `comms` or `ai`.
- Generate Modulith documentation into the platform architecture.

## Compliance / Verification
`ApplicationModules.of(PlatformApplication.class).verify()` in CI; ArchUnit rule that `bff` contains no persistence or business code.

## Related
- PRD: — (module PRD not written yet)
- Shared architecture: §1.3, §3, §5
- ADRs: ADR-SHARED-0008, ADR-IDENTITY-0001, ADR-BFF-0001
