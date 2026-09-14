# Closed Loop Pilot Run

## Metadata

```yaml
pilot_id: string
mode: synthetic | manual_real
owner: human
risk: low | medium | high
status: planned | approved | running | completed | stopped | blocked
readiness_status: ready | blocked
```

## Readiness

```yaml
experiment_proposal_ref: string
hypothesis_ref: string
target_metric_ref: metric:<stable-id>
guardrail_metric_refs:
  - metric:<stable-id>
metric_observability:
  target: uninstrumented | partial | observable
  guardrails:
    - ref: metric:<stable-id>
      status: uninstrumented | partial | observable
evidence_source_refs:
  - string
evidence_source_operational: true | false
deployment_or_test_surface_ref: string | null
sample_or_duration_rule: string
stop_conditions:
  - string
rollback: string
privacy_notes:
  - string
safety_notes:
  - string
blocking_dependencies:
  - string
```

## Readiness decision rules

`mode: manual_real` は次をすべて満たす場合だけ `readiness_status: ready` にできる。

- risk = low
- target / guardrail Metricのdefinitionがactive
- target / guardrail Metricの`observability_status = observable`
- Evidence sourceが運用可能である
- 実行対象surfaceが存在する
- sample / duration ruleが事前定義済み
- stop condition / rollbackが実行可能
- Privacy / Safety reviewが完了
- Human ownerがstart / stopできる

1つでも欠ける場合は`status: blocked` / `readiness_status: blocked`とし、**Blocked dependencyを明文化すること自体をPilot readinessの有効な結果**として扱う。

`mode: synthetic` はMetricが`uninstrumented`でもWorkflow Contract rehearsalとして実行可能。ただし実測可能性を証明したことにはしない。

## Human approvals

```yaml
start_decision: approve | reject | need_evidence
start_decided_by: human
start_reason: string
```

## Execution

```yaml
execution_ref: string
started_at: string | null
ended_at: string | null
manual_actions:
  - string
unexpected_events:
  - string
```

## Closed Loop artifacts

```yaml
experiment_result_ref: string | null
evaluation_ref: string | null
learning_candidate_ref: string | null
learning_review_ref: string | null
human_learning_decision: accept | reject | need_more_evidence | not_applicable
accepted_learning_ref: string | null
next_experience_hypothesis_ref: string | null
mlp_polish_ref: string | null
```

## Operational observations

```yaml
human_decision_points:
  - step: string
    necessary: true | false
    notes: string
manual_evidence_work:
  - string
handoff_friction:
  - string
contract_gaps:
  - string
autonomy_candidates:
  - string
keep_human_controlled:
  - string
```

## Rules

- `mode: synthetic` の結果をProduct Accepted Learningとして扱わない
- `mode: manual_real`でもHuman start / stop / learning decisionを維持する
- Metric refはactiveなMetric Registry definitionへ解決できること
- Real Pilotでは、定義済みだけでなく`observability_status: observable`を要求する
- Raw consultation / PIIをArtifactへコピーしない
- Safety findingが出たらstop conditionを優先する
- `accepted_learning_ref`はHuman Accept後のみ設定する
- Pilotの目的はAI稼働率最大化ではなく、handoff / Evidence / state transitionの検証
