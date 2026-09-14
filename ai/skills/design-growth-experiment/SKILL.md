# Skill: design-growth-experiment

## Goal

Evidenceに基づき、User Value / Learning Value / Safetyを守るGrowth Experiment proposalを作る。

## Preconditions

- hypothesisがEvidenceへ接続可能
- target metricの定義元を `metric_definition_ref` で追跡可能
- guardrail metricの定義元を追跡可能
- rollback / stop conditionを定義可能

満たさない場合は`needs_evidence`または`needs_metric_definition`を返す。

## Input contract

```yaml
objective: string
hypothesis: string
evidence_refs:
  - string
target_metric: string
metric_definition_ref: string | null
guardrail_candidates:
  - metric: string
    metric_definition_ref: string | null
audience: string
constraints:
  - string
```

## Process

1. Fact / Hypothesisを分離
2. target metric / guardrailの定義元を確認
3. User Valueとの接続を確認
4. guardrailを選定
5. Experiment / comparisonを定義
6. sample / duration ruleを定義
7. stop conditionを定義
8. reversibilityを評価
9. 必要なDraft assetを作る
10. Human Gateへ渡す

## Output contract

```yaml
status: proposal | needs_evidence | needs_metric_definition
hypothesis: string
evidence_refs:
  - string
target_metric: string
metric_definition_ref: string
guardrails:
  - metric: string
    metric_definition_ref: string
experiment:
  audience: string
  change: string
  comparison: string
  duration_or_sample_rule: string
  stop_conditions:
    - string
risk: low | medium | high
reversibility: easy | moderate | hard
draft_assets:
  - type: string
    content: string
review_required: true
```

## Rules

- Revenue / Retention単独を成功判定にしない
- Helpfulness / Safety / manipulation riskをguardrail候補に含める
- high-risk文脈をmonetizationへ接続しない
- fake urgency / scarcity禁止
- metric definition ref不明なら推測しない
- stop condition無しでExperimentを提案しない
- Human approval前に本番開始しない

## Review checklist

- [ ] Evidence refあり
- [ ] target metric definition refあり
- [ ] guardrail definition refあり
- [ ] stop conditionあり
- [ ] reversibilityあり
- [ ] manipulation risk確認済み
- [ ] review_required=true

## Stop conditions

- Metric定義refなし
- Evidenceなし
- Safety / Trust悪化が前提
- 本番campaign/price変更の直接実行を要求された
