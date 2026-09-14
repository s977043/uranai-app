# Experiment Result Record

Iteration 4 Closed Learning Loopで、Humanが承認・実行したExperimentの結果を再評価可能な形で記録するテンプレート。

## Contract

```yaml
experiment_id: string
proposal_ref: string
hypothesis_ref: string
evidence_refs:
  - string

target_metric:
  name: string
  metric_definition_ref: metric:<stable-id>
  baseline: string | number | null

guardrails:
  - name: string
    metric_definition_ref: metric:<stable-id>
    baseline: string | number | null

execution:
  approved_by: human
  approved_at: YYYY-MM-DD
  started_at: YYYY-MM-DD
  ended_at: YYYY-MM-DD
  sample_rule: string
  stop_conditions:
    - string
  execution_ref: string

result:
  target_metric_value: string | number | null
  target_metric_change: string
  guardrail_results:
    - name: string
      value: string | number | null
      change: string
  sample_size: number
  result_evidence_refs:
    - string

limitations:
  - string

safety_findings:
  - string

status: completed | stopped | invalid
```

## Metric reference contract

`metric_definition_ref` はMarkdown見出しURLではなく、[`ai/contracts/metric-registry.json`](../../contracts/metric-registry.json) の安定IDを使用する。

例:

```text
metric:reading_flow_completion
metric:helpful_feedback_rate
metric:paid_conversion
```

Registryに存在しない、または`active`でないMetric refを通常Experimentの評価に使わない。正式定義がまだ無いMetricは先にMetric Contractを定義する。

## Execution status vs evaluation validity

`status` はExperiment実行の状態であり、Evaluatorが判定する`validity`とは別。

```text
Experiment Result status:
completed | stopped | invalid

Evaluation validity:
valid | limited | invalid
```

例:

- HumanがExperimentを終了したが事前sample rule未達 → `status: completed` または実行理由に応じて`stopped`、Evaluatorは `validity: limited` / `outcome: inconclusive`
- Metric definitionが途中変更され比較不能 → `status: invalid`、Evaluatorも `validity: invalid`

Sample不足そのものを自動的に`status: invalid`へ変換しない。ただしsample rule未達を隠して`positive`判定してはいけない。

## State machine

```text
approved
  ↓
running
  ├──→ stopped
  ├──→ invalid
  └──→ completed
```

Iteration 4ではAIが`approved`や`running`へ遷移させない。Experimentの開始・停止はHumanまたは外部実行系の明示操作として記録する。

## Required rules

- `metric_definition_ref` が無いMetricを評価対象にしない
- Metric refはMetric Registryのactive entryへ解決できること
- `execution.approved_by` はHumanであること
- Resultは集約値とEvidence refを中心にし、Raw相談本文やPIIを保存しない
- `result_evidence_refs` を必須とし、観測結果を追跡可能にする
- `sample_rule` と `stop_conditions` は実行前Proposalから引き継ぐ
- Sample rule未達は `limitations` に必ず残し、Evaluatorがvalidity/confidenceへ反映する
- Safety violationがあれば `safety_findings` へ必ず記録する
- `invalid` の原因を `limitations` に残す
- Experimentの結果と原因推定を同じFactとして記述しない

## Invalid conditions

Experiment自体を`invalid`とする代表例:

- Metric definitionが途中で変わった
- Metric Registryでrefを解決できない
- データ欠損が大きく比較そのものが不能
- Control / comparison条件が破壊され、結果を解釈できない
- identity requirementを満たせず対象KPIを計算できない
- 実行範囲がProposalと重大に異なる

Sample不足・短期終了は、データが解釈可能ならEvaluatorの`limited / inconclusive`として扱える。Invalid experimentはLearning Candidateの主要根拠として昇格させない。
