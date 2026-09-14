# Skill: evaluate-experiment

## Goal

Humanが実行したExperimentのExecution Receiptと観測結果を、Metric Contract / Guardrail / Evidenceに基づいて**Makerとは独立して**評価する。

## Preconditions

- approved proposalがある
- Human Decisionが`approve`
- Manual Execution Receiptがある
- EvaluatorがProposal Makerと別主体
- target metric / guardrailの`metric_definition_ref`がある
- Observation window / sample / evidence refsがある

不足時は`inconclusive`または`needs_context`を返す。

## Input contract

```yaml
experiment_id: string
proposal_ref: string
maker: string
evaluator: string
human_decision:
  decision: approve
  decided_by: string
  decided_at: ISO-8601
  rationale: string
execution_receipt:
  executed_by: string
  executed_at: ISO-8601
  execution_scope: string
  implementation_ref: string
  actual_change: string
  deviations_from_proposal: []
  stop_condition_triggered: boolean
  stop_reason: string | null
observation:
  window: string
  sample_size: number | null
  target_metric:
    name: string
    metric_definition_ref: string | null
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
2. `evaluator != maker`を確認
3. Execution Scope / implementation ref / actual change / Deviationを確認
4. Metric Contract ref確認
5. target metricの差分をFactとして記録
6. guardrailの差分を記録
7. stop condition / Safety incident確認
8. sample / window / missing dataを確認
9. causal claim可能性を判定
10. recommendationとLearning Candidate可否を返す

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
evaluated_by: string
maker: string
reviewer_is_independent: true
```

## Rules

- `evaluator == maker`なら評価を完了しない
- target改善 + guardrail悪化なら`adopt`禁止
- Safety incident / stop condition triggerは`stopped`を優先
- baseline / metric definition / sample / window欠落時に推測しない
- correlationだけでcausal claimを許可しない
- negative / inconclusiveも保存対象
- Execution Receiptを書き換えない
- ReceiptのDeviationを隠さない
- Proposal MakerとEvaluatorの分離を維持

## Review checklist

- [ ] human approval存在
- [ ] execution receipt存在
- [ ] execution_scope / implementation_refあり
- [ ] evaluator != maker
- [ ] target metric definition refあり（欠落時はinconclusive）
- [ ] guardrail definition refあり
- [ ] sample/window確認
- [ ] deviation確認
- [ ] guardrail悪化時adopt禁止
- [ ] causal boundary明示

## Stop conditions

- Human approval無し
- Execution Receipt無し
- evaluator == maker
- execution scope / implementation ref無し
- Evidence ref無し
- Safety incident情報が矛盾
