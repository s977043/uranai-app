# Closed Loop Operational Pilot

Tracking: #30

## Purpose

Closed Learning LoopのContractが「設計として正しい」だけでなく、**実際の運用handoffとして回るか**を検証する。

Controlled Autonomyへ進む前に、Synthetic rehearsalと低リスクManual Pilotを分離して評価する。

## Phase A — Synthetic rehearsal

目的はProduct learningではなくWorkflow検証。

### 必須ケース

1. Positive / guardrail stable
2. Failure path: `safety_blocked` または `inconclusive`

### 確認項目

- Experiment ProposalからHuman Approvalまで追跡可能
- Result RecordにMetric Registry ref / Evidence refがある
- Evaluatorがexecution statusとvalidityを分離できる
- Learning Candidateに`candidate_maker_id` / `source_evaluation_refs`がある
- ReviewerがCandidate Makerと独立
- Human Decisionを通らず`accepted_learning`にならない
- Synthetic結果をProduct Accepted Learningとして保存しない

## Phase B — Real pilot readiness

実ユーザーに影響するPilotは、以下をすべて満たした場合のみ実施可能。

```yaml
risk: low
reversible: true
pricing_or_charge_change: false
high_stakes_reading: false
vulnerability_targeting: false
target_metric_registered: true
guardrail_metric_registered: true
evidence_source_defined: true
human_owner_defined: true
stop_conditions_defined: true
rollback_defined: true
privacy_reviewed: true
```

### Evidence source

実Pilot前に明示する。

- どのEvent /集約値を使うか
- identity requirement
- retention / deletion方針
- PIIを含まないこと
-欠損時の扱い

Evidence sourceが未定義ならPilotを開始しない。

## Phase C — Manual real pilot

Automationを増やさない。

```text
Human approves
  ↓
Human/manual execution
  ↓
Evidence collection
  ↓
Experiment Result Record
  ↓
AI evaluation
  ↓
Independent Learning Review
  ↓
Human learning decision
```

Human Gate:

- Start
- Stop
- External publish / send
- Accepted Learning

## Pilot observations

実験結果だけでなく、運用自体も観測する。

- Human decision wait time
- Evidence準備の手作業
- Contractの欠損/曖昧さ
- Reviewer handoffの摩擦
- Stop / rollbackの実行容易性
- Accepted LearningをMLPへ戻す手間

## Autonomy candidate classification

Pilot後、各ステップを分類する。

### Candidate for autonomy

条件:

- low risk
- deterministic / contract-driven
- reversible
-監査可能
- failure時に停止可能
- Human判断を必要としない

例候補:

- 定期集計
- Contract validation
- report formatting
- fixture regression
- Evidence ref existence check

### Keep human-controlled

- Experiment start / stop
- External publish / send
- price / charge
- High-stakes content
- Accepted Learning
- Safety Policy変更

## Controlled Autonomy entry gate

Iteration 5へ進むには:

- Synthetic positive path完了
- Synthetic failure path完了
- Manual real pilot完了、またはblocking dependencyを明文化
- Evidence / Metric / provenance欠損なし
- Safety / Privacy incident 0
- Human bottleneckを観測・記録
- LearningがMLP Polish / Next Hypothesisへ接続
- 7視点reviewで自律化候補を限定

実Pilotが未実施なら、Controlled Autonomyは「契約上可能」でも「運用上検証済み」と扱わない。
