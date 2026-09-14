# Closed Loop Operational Pilot

Tracking: #30  
Telemetry unblocker: #31  
Deployment / test surface decision: #15

## Purpose

Closed Learning LoopのContractが「設計として正しい」だけでなく、**実際の運用handoffとして回るか**を検証する。

Controlled Autonomyへ進む前に、Synthetic rehearsalと低リスクManual Pilotを分離して評価する。

## Plan review — updated

当初計画をレビューし、以下を更新した。

1. **Metric definitionとObservabilityを分離する**
   - `status: active` はMetric定義が有効という意味に限定する。
   - Real Pilotでは `observability_status: observable` を追加条件にする。
2. **Synthetic rehearsalを文章だけで完了扱いにしない**
   - `closed-loop-pilot-synthetic.json` を正本とし、CIでpositive / safety-blocked pathを機械検証する。
3. **Real Pilotができない場合を失敗扱いしない**
   - Evidence sourceや実行surfaceが未整備なら、`blocked`を正しいReadiness結果として記録する。
4. **Controlled Autonomyへ先行しない**
   - Synthetic通過だけでは「運用上安定」とみなさない。
5. **最初のTelemetryはsession-levelへ限定する**
   - Cross-session identityはPilot unblocker #31のScope外とし、まず低リスクなsession metricを実測可能にする。

## Phase A — Synthetic rehearsal ✅ implemented

目的はProduct learningではなくWorkflow検証。

### 必須ケース

1. Positive / guardrail stable
2. Failure path: `safety_blocked`

Machine-readable source:

- [`closed-loop-pilot-synthetic.json`](../../ai/workflows/examples/closed-loop-pilot-synthetic.json)
- [`validate-pilot-rehearsal.mjs`](../../ai/evals/validate-pilot-rehearsal.mjs)

### 確認項目

- Experiment ProposalからHuman Approvalまで追跡可能
- Result RecordにMetric Registry ref / Evidence refがある
- Evaluatorがexecution statusとvalidityを分離できる
- Learning Candidateに`candidate_maker_id` / `source_evaluation_refs`がある
- ReviewerがCandidate Makerと独立
- Human Decisionを通らず`accepted_learning`にならない
- Safety-blocked resultからCandidateを作らない
- Synthetic結果をProduct Accepted Learningとして保存しない

Syntheticでは実イベント計測能力を証明しない。Metricが`uninstrumented`でもWorkflow rehearsalは可能。

## Phase B — Manual real pilot readiness

実ユーザーに影響するPilotは、以下をすべて満たした場合のみ実施可能。

```yaml
risk: low
reversible: true
pricing_or_charge_change: false
high_stakes_reading: false
vulnerability_targeting: false
target_metric_definition_active: true
guardrail_metric_definition_active: true
target_metric_observable: true
guardrail_metric_observable: true
evidence_source_operational: true
execution_surface_available: true
human_owner_defined: true
sample_or_duration_rule_defined: true
stop_conditions_defined: true
rollback_defined: true
privacy_reviewed: true
```

### Metric definition vs observability

Metric Registryでは別々に扱う。

```yaml
status: active | provisional
observability_status: uninstrumented | partial | observable
```

`status: active`だけではReal Pilotを開始しない。

### Evidence source

実Pilot前に明示する。

- どのEvent / 集約値を使うか
- identity requirement
- Evidenceの取得方法
- retention / deletion方針
- PIIを含まないこと
- 欠損時の扱い

Evidence sourceが未定義・未実装ならPilotを開始しない。

## Current readiness assessment

2026-09-15時点では **Manual Real Pilot = blocked**。

理由:

1. Event Taxonomyは論理契約までで、Analytics event sender / ingestion実装が確認できない。
2. Metric Registry上の対象Metricは定義済みだが、`observability_status: uninstrumented`。
3. Real Pilot用のEvidence source refが未設定。
4. Production / shared test surfaceはIssue #15で判断待ち。

対応:

- #31 でprivacy-safeなsession-level telemetryを最小実装する。
- #15 のdeployment / test surface判断を確認する。
- 最初のReal Pilotは`metric:reading_flow_completion`を中心に、observableなGuardrailを1つ以上用意してから実施する。

このBlocked判定は、Contract不足を隠して擬似的な「実Pilot完了」を作るより正しい。

## Phase C — Manual real pilot ⛔ blocked by #31 / #15

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

Real Pilot開始条件が満たされるまで、このPhaseを完了扱いにしない。

## Pilot observations

実験結果だけでなく、運用自体も観測する。

- Human decision wait time
- Evidence準備の手作業
- Contractの欠損/曖昧さ
- Reviewer handoffの摩擦
- Stop / rollbackの実行容易性
- Accepted LearningをMLPへ戻す手間

Synthetic rehearsalではHuman待ち時間や実Evidence準備コストは評価対象外。

## Autonomy candidate classification

### Candidate for future autonomy

現時点でContract上の候補に留める。

- Contract validation
- Metric ref resolution
- fixture / regression execution
- report formatting
- Evidence ref existence check

Real Pilotで運用コストを確認するまで「自律化してよい」とは判定しない。

### Keep human-controlled

- Experiment start / stop
- External publish / send
- price / charge
- High-stakes content
- Accepted Learning
- Safety Policy変更

## Controlled Autonomy entry gate

Iteration 5へ進むには:

- [x] Synthetic positive pathをContractとして表現
- [x] Synthetic safety-blocked pathをContractとして表現
- [x] Machine-readable rehearsal / validator追加
- [x] Manual real pilotのblocking dependencyを明文化
- [x] Metric definition / observabilityを分離
- [ ] Manual real pilotを1サイクル完了
- [ ] Evidence / Metric / provenance欠損なしを実データで確認
- [ ] Safety / Privacy incident 0を実運用で確認
- [ ] Human bottleneckを観測・記録
- [ ] Accepted LearningがMLP Polish / Next Hypothesisへ戻ったことを実運用で確認
- [ ] 7視点reviewで自律化候補を限定

**現時点ではIteration 5へ進まない。**

## Completion rule for Iteration 4.5

Iteration 4.5の目的は「Real Pilotを無理に成功させること」ではなく、Operational Readinessを検証すること。

以下を満たせばIssue #30自体は完了可能とする。

- Synthetic positive / failure pathがCIで検証される
- Runbook / Templateが利用可能
- Real Pilot readinessを判定できる
- Blocking dependencyがIssueへ分離されている
- Controlled Autonomyへ進めない理由と、将来自律化候補が明確
- タスク完了前に7視点レビュー済み

Real Pilotそのものは#31 / #15の条件成立後に別途実行し、その結果をIteration 5 entry gateとして使う。
