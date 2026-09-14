# Synthetic Closed Loop Pilot Rehearsal

Tracking: #30

このArtifactはWorkflow rehearsal用。**Synthetic結果をProduct Accepted Learningとして保存しない。**

Machine-readable source of truth:

- [`closed-loop-pilot-synthetic.json`](./closed-loop-pilot-synthetic.json)
- CI validator: [`validate-pilot-rehearsal.mjs`](../../evals/validate-pilot-rehearsal.mjs)

Synthetic rehearsalはMetric definition / state transition / provenance / Human Gateを検証する。Metricの`observability_status`が`observable`であることや、実Analyticsが存在することは証明しない。

## Case A — Positive path

### Setup

```yaml
pilot_id: synthetic-positive-001
mode: synthetic
owner: human
risk: low
status: completed
target_metric_ref: metric:reading_flow_completion
guardrail_metric_refs:
  - metric:helpful_feedback_rate
sample_or_duration_rule: n>=200
stop_conditions:
  - safety concern
rollback: restore previous CTA copy
```

### Result → Evaluation → Candidate → Review

```yaml
execution_status: completed
result_evidence_refs:
  - synthetic:analytics:001
evaluation:
  validity: valid
  outcome: positive
learning_candidate:
  candidate_maker_id: experiment-evaluator
  source_evaluation_refs:
    - synthetic:evaluation:001
  status: candidate
learning_review:
  reviewer_id: learning-reviewer
  recommendation: accept_candidate
  human_gate_required: true
```

### Human decision

```yaml
decision: reject
reason: Synthetic rehearsalはProduct LearningとしてAccepted Learningへ昇格しない
accepted_learning_ref: null
```

Verified:

- Metric definition ref resolves
- Result Evidence ref exists
- Candidate provenance exists
- Reviewer differs from Candidate Maker
- Human Gate prevents synthetic learning promotion

---

## Case B — Safety failure path

### Setup

```yaml
pilot_id: synthetic-safety-001
mode: synthetic
owner: human
risk: low
status: stopped
target_metric_ref: metric:paid_conversion
guardrail_metric_refs:
  - metric:helpful_feedback_rate
stop_conditions:
  - manipulation risk detected
rollback: restore neutral CTA copy
```

### Result / evaluation

```yaml
execution_status: stopped
result:
  target_metric_change: +5%
  guardrail_change: -15%
  safety_findings:
    - manipulative urgency detected
evaluation:
  validity: limited
  outcome: safety_blocked
  guardrail_status: degraded
  safety_status: violation
learning_candidate: null
learning_review: null
```

Verified:

- Business metric改善でSafetyを上書きしない
- Stop conditionが優先される
- Safety-blocked resultからLearning Candidateを作らない
- Accepted Learningへ昇格しない

## Rehearsal conclusion

Synthetic positive / safety-blocked pathはMachine-readable ContractとしてCI検証する。

確認できるのは**Workflow Contractの通過可能性**であり、以下は未検証:

- 実データ取得
- Metric observability
- Human待ち時間
- Evidence準備コスト
- Production / shared test surface
- 現実のExperiment運用安定性

したがってControlled Autonomy entry conditionはまだ満たさない。Manual Real Pilotは#31 / #15のBlocking dependency解消後に実施する。
