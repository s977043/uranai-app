# Reading Vertical Slice — Post-merge Deep Review

Tracking: Issue #36  
Original: Issue #33 / PR #35

## Why this follow-up exists

PR #35 was merged while a deeper review was still in progress. The merged Vertical Slice remains valid, but two additional findings were discovered after the merge and therefore require a focused follow-up from latest `main`.

This follow-up does **not** expand product scope. It hardens telemetry correctness and user-facing trust semantics.

## Plan review

Original plan after #35:

```text
Reading Vertical Slice
  ↓
Shared / production test surface + operational Evidence source
  ↓
User Observation
  ↓
Polish Loop
  ↓
Manual Real Pilot
```

Updated plan:

```text
Reading Vertical Slice (#35 merged)
  ↓
Post-merge interaction / trust hardening (#36)
  ↓
Shared / production test surface + operational Evidence source
  ↓
User Observation
  ↓
Polish Loop
  ↓
Manual Real Pilot
```

Controlled Autonomy remains blocked.

## Findings

### Finding 1 — duplicate telemetry from rapid interaction

React state updates are not a synchronous interaction lock. Before a render commits, rapid repeated interaction could produce:

- multiple `reading_started` events / flow IDs from repeated theme selection
- duplicate `reading_completed` for the same flow
- duplicate `reading_feedback_submitted` for the same flow

The metric layer can detect duplicates, but avoidable Product-side duplication should not be treated as normal Evidence.

### Fix

Use `useRef` as synchronous transient guards:

- `activeFlowRef` — one active flow until reset
- `completedFlowRef` — at most one completion per flow
- `feedbackFlowRef` — at most one feedback submission per flow

These refs do not create cross-session identity and are reset with the Reading UI state.

## Finding 2 — feedback copy exceeded actual persistence semantics

Merged copy:

> ありがとう。次の改善の参考にします。

Current implementation stores feedback only in browser `sessionStorage`; no central Evidence source receives it. The copy therefore implied a use that the system does not yet perform.

An intermediate wording that claimed the answer was recorded in the browser session would also be too strong when browser storage itself fails.

### Fix

Use a failure-safe statement:

> ありがとう。現在、この回答はこの端末から外部へ送信されません。

Telemetry write failure is reported separately and does not stop the Reading experience.

## Multi-perspective review

### Product

- User Value path is unchanged.
- Preventing duplicate state transitions improves experience integrity.
- No new feature or engagement optimization is introduced.

Conclusion: **Approve.**

### UX / Lovability

- Interaction guards are invisible in the normal path.
- Trust copy now matches current behavior.
- Actual Lovability remains unproven until real user observation.

Conclusion: **Approve; real observation still required.**

### Architecture / React

- `useRef` is appropriate for transient synchronous interaction guards that do not affect rendering.
- No new dependency or global state is introduced.
- Browser interaction E2E infrastructure is intentionally not added in this small follow-up.

Conclusion: **Approve.**

### Privacy

- No new data is collected.
- No new persistence destination is introduced.
- Copy explicitly avoids implying central collection.

Conclusion: **Approve.**

### Safety / Trust

- Reading content and Safety boundaries are unchanged.
- Copy no longer implies an unsupported operational behavior.

Conclusion: **Approve.**

### Analytics / Evidence

- Duplicate `started`, `completed`, and `feedback` events are prevented at the interaction boundary.
- Existing duplicate detection remains useful as a defense-in-depth Data Quality signal.
- `partial != observable` remains unchanged.

Conclusion: **Approve.**

### QA / Delivery

- Scope is a single UI file plus this review record.
- Existing unit / contract / build CI must remain Green.
- Browser interaction E2E / real-device verification remains a later shared-surface gate.

Conclusion: **Approve subject to final-head CI / mergeability / unresolved-thread check.**

## Boundary

This follow-up proves only:

- synchronous UI interaction hardening
- trust-copy consistency with current local-only telemetry

It does not prove:

- actual Lovability
- production telemetry observability
- central Evidence operation
- Retention
- Manual Real Pilot readiness
- Controlled Autonomy readiness

## Completion conditions

- [x] duplicate interaction guards implemented
- [x] feedback trust copy corrected
- [x] plan reviewed and updated through Issue #36 / this record
- [ ] full CI Green on final head
- [ ] mergeable
- [ ] unresolved review threads = 0
- [ ] final review recorded
- [ ] follow-up PR merged
