# Telemetry Ingress Guard — Three-Cycle Review

Tracking: #49 / PR #51. Phase C.5.
Scope: anonymous request budget + shared-runtime activation fence; **no production rollout or paid actions**.

## Review methodology
This review applies seven independently framed *review perspectives* within this session:
Product/MLP, Architecture, Privacy, Safety, Analytics/Evidence, QA/Eval, Delivery/Cost.
There was **no independent subagent runtime** available in the connected toolset. These are not claims of seven separate model runs or Human approval. GitHub Actions are independent execution evidence for code/tests/DB integration.

## Cycle 1 — verify → review → fix → re-review
- Initial CI `github-actions:run/39758435723`: all seven verification steps green (including PostgreSQL 16 integration).
- Architecture/Delivery finding: an unknown runtime with neither `NODE_ENV` nor `VERCEL_ENV` could be classified like local use.
- Fix: only explicit `NODE_ENV=development|test` without a shared `VERCEL_ENV` is considered local; every unknown/production/preview execution needs explicit shared approval.
- Regression: unknown environment and preview-with-development overrides.
- Re-review: fail-closed on unknown runtime; Product remains unchanged.

## Cycle 2 — verify → review → fix → re-review
- CI `github-actions:run/39758702787`: npm ci, lint, typecheck, test, PostgreSQL integration, AI contract and build all green.
- QA/Privacy finding: invalid HTTP requests consuming the fixed-window budget was not explicitly tested; a test could leak modified `DATABASE_URL` into sibling tests.
- Reliability finding: system clock rollback could emit an arbitrarily large Retry-After value.
- Fix: test malformed traffic causing eventual 429 without DB acquisition; restore all mutated environment variables; cap rollback Retry-After at one configured window.
- Re-review: bounded denial response; no durable identity or request metadata.

## Cycle 3 — verify → review → fix → re-review
- Subsequent run `github-actions:run/39758891325` verifies Cycle 2 head (CI status must be checked before final merge).
- QA/Delivery finding: clock provider throwing an exception or providing unsafe numeric timestamp could cause HTTP failure instead of a deliberate denial.
- Fix: rate limiter catches clock errors, checks safe integer timestamps, returns fail-closed short Retry-After. Add unit regressions for throwing/unsafe clocks.
- Final re-review: intentionally limited process-local enforcement, no new personal identity, server-only DB, metrics still partial; final head CI is required after this document.

## Seven perspective verdicts (conditional on final HEAD CI)

| Perspective | Conclusion | Evidence / residual |
| --- | --- | --- |
| Product / MLP | PASS | Reading UX not changed; telemetry errors never block reading |
| Architecture | PASS | pure activation gate; injectable limiter; no storage/provider SDK changes |
| Privacy | PASS | no IP, UA, cookie, cross-session key, consultation text persisted |
| Safety | PASS | no fortunetelling claims/upsell/identity collection |
| Analytics | PASS | event and metric contracts unchanged; partial/blocked retained |
| QA / Eval | PASS after 3 fixes | unknown runtime, clock, 429, malformed requests, no DB while disabled |
| Delivery / Cost | PASS within scope | per-instance 60/min guard only; shared rollout remains blocked |

## Residual blockers: do NOT promote readiness

- The fixed window is **per process**, not global; cold starts and horizontal scaling bypass a global cap. A malicious actor can exhaust legitimate traffic's local budget. This is a defense-in-depth only, not production DoS prevention.
- The `TELEMETRY_SHARED_INGRESS_APPROVED` boolean is an explicit operator switch, **not an evidence-backed assertion** that abuse/cost controls have been independently verified.
- External edge throttle, project-level spend alert/limits, provider security/access logs, production TLS/certificate handling and shared E2E are not implemented/verified.
- Live central network sink and actual user observation are absent.
- `operational_gate.status = blocked`; `abuse_control_verified = false`; target/guardrail metrics stay `partial`.
- License #14 and paid-resource/provider choice #15 are human-owned decisions.

## Final merge criteria
- Latest PR head (after this review record) passes npm ci, lint, typecheck, unit tests, PostgreSQL 16 integration, AI contract validators, build.
- No unresolved review thread; PR mergeable; head SHA fixed at merge.
- Issue #49 closes only on successful merge. Issues #15/#39 remain open.
