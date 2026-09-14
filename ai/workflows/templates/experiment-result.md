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
  executed_at: ISO-8601
  execution_scope: string
  implementation_ref: string
  actual_change: string
  deviations_from_proposal:
    - string
  stop_condition_triggered: boolean
  stop_reason: string | null
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

## Execution receipt contract

`execution` は「計画したExperiment」ではなく、**Humanが実際に何を実行したか**のReceiptでもある。

最低限、次を分離して記録する。

- `execution_scope`: 実際に変更を適用した範囲
- `implementation_ref`: PR / commit / config / campaign等、実行内容を追跡できる参照
- `actual_change`: 実際に適用した変更の要約
- `deviations_from_proposal`: Proposalとの差分。差分無しでも空配列を明示
- `stop_condition_triggered`: 事前Stop conditionが発火したか
- `stop_reason`: 停止した場合の理由。事前Stop condition以外のHuman判断による停止も記録する

Rules:

- Proposalの記述をReceiptへコピーして「実行した事実」と見なさない
- 実行内容を確認できない場合は推測せず、Evidence不足として扱う
- `deviations_from_proposal` を隠さない
- material deviationはEvaluatorが`validity` / `limitations` / scopeへ反映する
- `status: stopped` の場合は理由を必ず残す。`stop_condition_triggered=false`でもHuman判断・Data Quality等で停止できる
- `stop_condition_triggered=true` なら `status: stopped` とする
- ReceiptへRaw相談本文、PII、secretを保存しない
- Evaluator / ReviewerはReceiptを書き換えず、矛盾があればFindingとして残す

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
- HumanがData Quality異常を見つけ事前Stop condition外で停止 → `status: stopped`, `stop_condition_triggered: false`, `stop_reason`必須
- Metric definitionが途中変更され比較不能 → `status: invalid`、Evaluatorも `validity: invalid`
- Proposalと実施内容に差分があるが結果は一部解釈可能 → `status: completed`、Evaluatorは差分の影響に応じて `validity: limited`
- 実施差分により比較条件そのものが壊れた → `status: invalid` またはEvaluator `validity: invalid`

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
- `approved_at <= started_at <= ended_at` を満たすこと
- `execution_scope` / `implementation_ref` / `actual_change` を必須とする
- `deviations_from_proposal` は差分無しでも空配列を必須とする
- `status: stopped` の場合は `stop_reason` を必須とする
- `stop_condition_triggered=true` の場合は `status: stopped` と `stop_reason` を必須とする
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
- 実際の変更内容またはimplementation refを確認できず、Experiment実施事実を再現できない

Sample不足・短期終了は、データが解釈可能ならEvaluatorの`limited / inconclusive`として扱える。Invalid experimentはLearning Candidateの主要根拠として昇格させない。
