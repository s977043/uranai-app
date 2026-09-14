# Synthetic Closed Loop Pilot Rehearsal

Tracking: #30

このArtifactはWorkflow rehearsal用。**Synthetic結果をProduct Accepted Learningとして保存しない。**

## Case A — Positive path

### 1. Pilot setup

```yaml
pilot_id: synthetic-positive-001
mode: synthetic
owner: human
risk: low
status: completed
experiment_proposal_ref: synthetic-proposal-001
hypothesis_ref: synthetic-hypothesis-001
target_metric_ref: metric:reading_flow_completion
guardrail_metric_refs:
  - metric:helpful_feedback_rate
evidence_source_refs:
  - synthetic-evidence-baseline-001
sample_or_duration_rule: n>=200
stop_conditions:
  - safety concern
rollback: restore previous CTA copy
```

### 2. Human approval

```yaml
start_decision: approve
start_decided_by: human
start_reason: low-risk reversible synthetic rehearsal
```

### 3. Synthetic result

```yaml
experiment_result_ref: synthetic-result-001
execution_status: completed
sample_size: 240
target_metric_change: +8%
guardrail_change: +1%
safety_findings: []
result_evidence_refs:
  - synthetic-analytics-001
```

### 4. Evaluation

```yaml
evaluation_ref: synthetic-evaluation-001
validity: valid
outcome: positive
guardrail_status: stable
safety_status: clear
learning_candidate_created: true
```

### 5. Learning Candidate

```yaml
learning_candidate_ref: synthetic-candidate-001
candidate_maker_id: experiment-evaluator
source_evaluation_refs:
  - synthetic-evaluation-001
statement: "Synthetic条件ではCTA明確化とReading Flow Completion改善が同時に観測された"
scope: synthetic rehearsal only
confidence: low
status: candidate
```

### 6. Independent review

```yaml
learning_review_ref: synthetic-review-001
reviewer_id: learning-reviewer
recommendation: accept_candidate
human_gate_required: true
```

### 7. Human decision

```yaml
human_learning_decision: reject
reason: Synthetic rehearsalはProduct LearningとしてAccepted Learningへ昇格しない
accepted_learning_ref: null
next_experience_hypothesis_ref: null
mlp_polish_ref: null
```

### Operational observation

```yaml
verified:
  - Metric Registry refs resolve
  - Result evidence is present
  - Candidate provenance is present
  - Reviewer differs from candidate maker
  - Human Gate prevents synthetic learning promotion
autonomy_candidates:
  - contract validation
  - report formatting
keep_human_controlled:
  - experiment start
  - accepted learning decision
```

---

## Case B — Safety failure path

### 1. Pilot setup

```yaml
pilot_id: synthetic-safety-001
mode: synthetic
owner: human
risk: low
status: stopped
experiment_proposal_ref: synthetic-proposal-002
hypothesis_ref: synthetic-hypothesis-002
target_metric_ref: metric:paid_conversion
guardrail_metric_refs:
  - metric:helpful_feedback_rate
evidence_source_refs:
  - synthetic-evidence-baseline-002
sample_or_duration_rule: n>=300
stop_conditions:
  - manipulation risk detected
rollback: restore neutral CTA copy
```

### 2. Synthetic result

```yaml
experiment_result_ref: synthetic-result-002
execution_status: stopped
sample_size: 95
target_metric_change: +5%
guardrail_change: -15%
safety_findings:
  - manipulative urgency detected
result_evidence_refs:
  - synthetic-analytics-002
```

### 3. Evaluation

```yaml
evaluation_ref: synthetic-evaluation-002
validity: limited
outcome: safety_blocked
guardrail_status: degraded
safety_status: violation
learning_candidate_created: false
```

### 4. Human decision

```yaml
human_learning_decision: not_applicable
accepted_learning_ref: null
```

### Operational observation

```yaml
verified:
  - business metric improvement did not override safety
  - stop condition wins
  - no Learning Candidate generated from safety-blocked result
  - no Accepted Learning promotion
```

## Rehearsal conclusion

Synthetic positive / failure pathの状態遷移はContract上矛盾なく表現できる。

ただし確認できたのは**Workflow Contractの通過可能性**であり、実データ取得・Human待ち時間・Evidence準備コスト・現実のExperiment運用安定性ではない。

Controlled Autonomy entry conditionはまだ満たさない。次はManual real pilot readinessを評価する。
