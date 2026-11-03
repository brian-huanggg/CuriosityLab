# ADR-BFF-0002: Spring Cloud Gateway Server WebFlux

- Status: Proposed
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The bff ([ADR-BFF-0001](0001-backend-for-frontend-tokens-stay-server-side.md)) must proxy REST calls to `platform` and attach the access token. Later products need more than request/response: `comms` needs WebSocket connections and `ai` streams chat answers with Server-Sent Events (SSE). Spring Cloud Gateway is offered in two server flavours, WebFlux (reactive, Netty) and Server MVC (servlet). According to its documentation at the time of writing, Gateway Server MVC does not proxy WebSockets.

## Decision Drivers
- WebSocket proxying for `comms` and long-lived SSE for `ai`, without a later rewrite.
- Built-in `TokenRelay` integration with Spring Security's OAuth2 client.
- Redis-backed rate limiting and request size limits available as filters.
- Small memory footprint (target 256–384 MB, [Shared architecture: §10.3](../../shared/architecture.md#103-resource-budget)).
- Teachable configuration with little custom code.

## Considered Options
1. Spring Cloud Gateway Server **WebFlux**.
2. Spring Cloud Gateway Server **MVC** (servlet stack, blocking or virtual threads).
3. A hand-written proxy in Spring MVC (`RestClient` / `WebClient` controllers).
4. Traefik middleware only, with an auth sidecar (for example oauth2-proxy).

## Decision
Use option 1. The bff is a reactive Spring Boot application on Spring Cloud Gateway Server WebFlux, with Spring Security reactive `oauth2Login` / `oauth2Client` and Spring Session Data Redis reactive. Routes are defined in Java and use `TokenRelay`, header filters, `RequestRateLimiter` and `RequestSize`.

Option 2 is rejected because it reportedly lacks WebSocket proxying, which `comms` needs. Option 3 is rejected because it re-implements proxying, streaming and header handling that the gateway already provides, and adds code to maintain. Option 4 is rejected because oauth2-proxy and Traefik do not give the session-held active workspace, CSRF and refresh behaviour this design needs without extra glue, and the book wants the BFF in Spring.

## Consequences
### Positive
- One stack covers REST, WebSocket and SSE.
- Most behaviour is configuration (routes and filters), not code.
- Non-blocking I/O keeps memory low with many open streaming connections.
### Negative / Trade-offs
- The bff is reactive while `platform` and `auth-server` are servlet-based: two programming models in one repository.
- Reactive Spring Security and Spring Session APIs differ from the servlet ones (`ServerHttpSecurity`, `WebSession`).
- Debugging reactive stacks is harder; stack traces are less readable.
### Follow-up actions
- Verify against current Spring Cloud Gateway docs that Server MVC still lacks WebSocket proxying and that WebFlux supports WebSocket and SSE with `TokenRelay` in the Spring Boot 4.x line in use.
- Keep custom reactive code in the bff to a minimum; document the reactive parts in the book.

## Compliance / Verification
Integration tests with `WebTestClient` for a REST route, an SSE route and a WebSocket upgrade through the gateway against a stub upstream; ArchUnit forbids `spring-webmvc` on the bff classpath.

## Related
- PRD: — (module PRD not written yet)
- Architecture: bff architecture §3, §7; Shared architecture: §4
- ADRs: ADR-BFF-0001, ADR-BFF-0006, [ADR-SHARED-0004](../../shared/adr/0004-runtime-framework-and-build-versions.md)
