# ADR-IDENTITY-0009: Email verification and lab mail with Mailpit

- Status: Proposed
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
Self-registration uses email as the login identifier, so the address must be proven before the account is active, and password reset depends on it. In the lab, GCP blocks outbound port 25, so mail cannot be delivered directly to the internet. Mailpit runs in namespace `curiositylab` and captures all outbound mail ([ADR-SHARED-0011](../../shared/adr/0011-kubernetes-namespaces.md)).

## Decision Drivers
- Only verified emails can log in or receive reset links.
- Tokens in links must not be usable if `cl_auth` leaks.
- Working mail flow in the lab without an external provider.

## Considered Options
1. Single-use random token in a link, stored hashed; SMTP to Mailpit in the lab; outbound relay deferred.
2. Six-digit code typed into the UI.
3. Outbound relay through a mail provider on port 587 from the start.

## Decision
Use option 1.

- Token: 256-bit random, URL-safe; only the SHA-256 hash is stored in `account_email_token` with purpose, expiry (24 h for verification, 30 min for reset) and `used_at`.
- Accounts stay `PENDING` until verified; a resend invalidates earlier tokens and is rate-limited.
- Registration with an existing email returns the same response and sends a "you already have an account" email instead (no enumeration).
- auth-server sends mail itself over SMTP (Spring Boot mail starter) after the transaction commits; it does not use the platform `notification` module.
- Lab: SMTP host is Mailpit; its UI is reachable only inside the cluster or through port-forward.
- Real delivery through a relay on a submission port is deferred.

Rejected: typed codes (short codes need stricter rate limiting; links are simpler for the book); relay now (external account and cost not needed for the lab).

## Consequences
### Positive
- Full flow is testable in the lab; a database leak does not expose usable links.
### Negative / Trade-offs
- No real users can register until a relay exists.
- Mail sending is in-process; a failed send must be retried or resent by the user.
### Follow-up actions
- Choose an outbound relay and port (OI-IDN-07).

## Compliance / Verification
Integration test with the Mailpit API: token works once, expires, and is invalid after resend; identical responses for new and existing emails.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Identity architecture: §6.1, §6.8; Shared architecture: §2
- ADRs: [ADR-IDENTITY-0005](0005-password-hashing-and-account-protection.md), [ADR-SHARED-0011](../../shared/adr/0011-kubernetes-namespaces.md)
