# Persona → Observation → Polish loop template

> Status: TEMPLATE ONLY. A simulated persona review is not human VoC or user-observation evidence.
> MLP reference: [Product Development](../product-development.md).
> Tracking: [Issue #59](https://github.com/s977043/uranai-app/issues/59)

## Record
- Review date (JST):
- Repository, exact commit SHA, screen/flow:
- Reviewer (role) and method: `SIMULATED_PERSONA` | `STATIC_CODE_REVIEW` | `ACTUAL_USER_OBSERVATION` | `ANALYTICS`
- Evidence source (file path / approved anonymized observation ID):
- Actual participant count: `null` if not conducted
- User consent / retention approved: `no` until authorized

## Friction hypothesis
- Scenario and user job:
- Expected outcome:
- Observation (FACT, or `NOT_OBSERVED`):
- Simulated comment (only if method=`SIMULATED_PERSONA`; **never** quote as actual customer):
- Interpretation (HYPOTHESIS):
- Counter-hypothesis:
- Safety / privacy impact:
- Priority / reason (do not rank by invented frequency):

## Experiment contract
- Single change proposed:
- Alternative/current control:
- Task users can attempt without disclosing private problems:
- Primary observation (how measured, denominator/window if quantitative):
- Usability/clarity question, asked without leading:
- Early stop and rollback:
- Shared-surface / runtime / billing / Human gate:
- Related Issue / PR:

## Decision / traceability
- Actual run: `NOT_RUN` | `RUN`
- Review of source / observation:
- Verdict: `CONTINUE_RESEARCH` | `PROPOSE_POLISH` | `HOLD` | `REJECT`
- Human decision, dated:
- Revised artifact revision:
- After-change observation:
- What remains unknown:

Do not promote synthetic reviews to `Accepted Learning`. Avoid raw private consultation text, names, dates of birth, logs, recordings, and psychological/customer-level segmentation in Git.
