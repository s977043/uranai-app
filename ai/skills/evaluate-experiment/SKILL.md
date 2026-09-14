# Skill: evaluate-experiment

## Goal

Humanが実行したExperimentのExecution Receiptと観測結果を、Metric Contract / Guardrail / Evidenceに基づいて評価する。

## Preconditions

- approved proposalがある
- Human Decisionが`approve`
- Manual Execution Receiptがある
- target metric / guardrailの`metric_definition_ref`がある
- Observation window / sample / evidence refsがある

不足時は`inconclusive`または`needs_context`を返す。

## Input contract

```yaml
experiment_id: string
proposal_ref: string
maker: string
human_decision:
  decision: approve
  decided_by: string
execution_receipt:
  executed_by: string
  actual_change: string
  deviations_from_proposal: []
  stop_condition_triggered: boolean
observation:
  window: string
  sample_size: number | null
  target_metric:
    name: string
    metric_definition_ref: string
    baseline: number | null
    result: number | null
  guardrails:
    - name: string
      metric_definition_ref: string
      baseline: number | null
      result: number | null
  evidence_refs: []
```

## Process

1. Proposal / Human Decision / Receiptの整合確認
2. Metric Contract ref確認
3. 実行Deviation確認
4. target metricの差分をFactとして記録
5. guardrailの差分を記録
6. stop condition / Safety incident確認
7. sample / window / missing dataを確認
8. causal claim可能性を判定
9. recommendationとLearning Candidate可否を返す

## Output contract

```yaml
experiment_id: string
result: positive | negative | inconclusive | stopped
facts:
  - statement: string
    evidence_refs: []
target_result: improved | worsened | unchanged | unknown
guardrail_results:
  - metric: string
    result: improved | worsened | unchanged | unknown
causal_claim_allowed: boolean
limitations: []
recommendation: adopt | reject | iterate | gather_more_evidence
learning_candidate_allowed: boolean
evaluated_by: analyst
```

## Rules

- target改善 + guardrail悪化なら`adopt`禁止
- Safety incident / stop condition triggerは`stopped`を優先
- baseline / metric definition / sample / window欠落時に推測しない
- correlationだけでcausal claimを許可しない
- negative / inconclusiveも保存対象
- Execution Receiptを書き換えない
- Proposal MakerとEvaluatorの論理的分離を維持

## Review checklist

- [ ] human approval存在
- [ ] execution receipt存在
- [ ] target metric definition refあり
- [ ] guardrail definition refあり
- [ ] sample/window確認
- [ ] deviation確認
- [ ] guardrail悪化時adopt禁止
- [ ] causal boundary明示

## Stop conditions

- Human approval無し
- Execution Receipt無し
- Metric Contract不明
- Evidence ref無し
- Safety incident情報が矛盾
