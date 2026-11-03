# ADR-IDENTITY-0005: Password hashing and account protection

- Status: Proposed (Argon2id)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
`auth-server` stores password credentials and faces credential stuffing, brute force and account enumeration on a public login page. Per-account lockout alone lets an attacker lock other people out. Hashing cost competes for CPU on a shared 4 vCPU node.

## Decision Drivers
- Resistance to offline cracking if `cl_auth` leaks.
- Resistance to online guessing without enabling malicious lockout.
- No disclosure of whether an email is registered.
- Bounded CPU cost per login.

## Considered Options
1. Argon2id via `Argon2PasswordEncoder` in a `DelegatingPasswordEncoder`, with per-account backoff, temporary lockout and Redis rate limiting.
2. bcrypt with the same protections.
3. PBKDF2.

## Decision
- Hash with Argon2id. Start from the Spring Security defaults (`Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8()`, reportedly 16 MiB memory, 2 iterations, parallelism 1) and raise memory/iterations by benchmark until one hash takes roughly 100–300 ms on the auth-server Pod.
- Store the encoded hash with its `{argon2}` prefix so parameters can be upgraded on next login.
- Policy: minimum 12 characters, maximum 128; check against a breached/common password list; no composition rules.
- Backoff after 3 failures per account; temporary lock (15 min) after 10; reset on success.
- Rate limits in Redis per IP and per account, checked before hashing.
- Generic messages in login, registration and reset; dummy hash verification for unknown emails to equalize timing.

Rejected: bcrypt (kept as the alternative; weaker against GPU attacks and 72-byte input limit); PBKDF2 (weaker per unit of cost).

## Consequences
### Positive
- Layered protection; hashes can be upgraded transparently.
### Negative / Trade-offs
- Argon2id needs Bouncy Castle on the classpath and memory per concurrent login.
- Counters in Redis are lost on Redis restart (acceptable).
### Follow-up actions
- Verify the Spring Security 7 `Argon2PasswordEncoder` defaults against current docs; benchmark and record final parameters.
- Include login in the load test.

## Compliance / Verification
Unit tests for policy; tests assert identical status and body for known and unknown emails; test that a rehash happens when parameters change.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §8.1, §8.2
- ADRs: [ADR-IDENTITY-0006](0006-totp-two-factor-with-recovery-codes.md), [ADR-BFF-0006](../../bff/adr/0006-edge-rate-limiting-and-security-headers.md)
