# ADR-BFF-0006: Edge rate limiting and security headers

- Status: Proposed
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
The bff is the only entry point for browser API traffic. It is the natural place to reject abusive request rates and oversized requests before they reach `platform`, and to set security headers on its responses. Credential-specific protections (lockout, backoff) belong to `auth-server` ([ADR-IDENTITY-0005](../../identity/adr/0005-password-hashing-and-account-protection.md)).

## Decision Drivers
- Protect `platform` and the single node from request floods.
- Limits must be shared across bff replicas.
- Limit per client before login and per session after login.
- Standard security headers on every response ([Shared architecture: §9](../../shared/architecture.md#9-security-architecture)).
- Configuration over custom code.

## Considered Options
1. Spring Cloud Gateway `RequestRateLimiter` with `RedisRateLimiter`, keyed by IP and by session; `RequestSize` filter; Spring Security headers.
2. Traefik rate-limit middleware only.
3. In-memory rate limiting in the bff (Bucket4j without a shared store).
4. No edge rate limiting.

## Decision
Use option 1.

- Token-bucket limits in Redis: per client IP on all routes and tighter on `/bff/login` and the OAuth2 callback; per (hashed) session ID on `/api/**` and on new WebSocket connections. Values are in bff architecture §11.1.
- Client IP from `X-Forwarded-For` only as set by Traefik (trusted proxies).
- Rejections return `429` with `Retry-After` and a Problem Details body.
- Size limits: request body 1 MB on `/api/**`, headers 16 KB, WebSocket frame 64 KB. Files go to MinIO through presigned URLs, not through the bff.
- Headers on bff responses: HSTS, `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Cache-Control: no-store`. The document CSP for the SPA is set where the HTML is served (bff OI-BFF-02).

Option 2 is rejected because Traefik has no notion of the session, so per-user limits are impossible. Option 3 is rejected because limits would not be shared across replicas. Option 4 is rejected because one runaway client could exhaust the single node.

## Consequences
### Positive
- Abuse is rejected before reaching `platform` or the database.
- Limits are per user after login, so users behind one NAT are not punished together.
### Negative / Trade-offs
- One more Redis call per request.
- Limits need tuning; too low breaks bursty SPA screens.
- If Redis is down, the rate limiter must fail open or closed (decided: fail open, logged).
### Follow-up actions
- Verify against current Spring Cloud Gateway docs the `RedisRateLimiter` behaviour on Redis errors and the `RequestSize` filter for streaming bodies.
- Tune limits after load tests with realistic SPA screens.

## Compliance / Verification
Integration tests for `429` per IP and per session and `413` on oversized bodies; ZAP header checks; dashboard of rate-limit rejections.

## Related
- PRD: — (module PRD not written yet)
- Architecture: bff architecture §11; Shared architecture: §9
- ADRs: ADR-BFF-0002, ADR-BFF-0003, [ADR-IDENTITY-0005](../../identity/adr/0005-password-hashing-and-account-protection.md)
