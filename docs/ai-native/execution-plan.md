# AI-Native Execution Plan

Tracking: #18, #20, #23, #26

## Objective

`uranai-app` にAI-Nativeな事業運用を段階的に導入する。自動化率ではなく、**User Value / 責務境界 / Evidence / Safety / Eval / Learning Loop**を先に成立させる。

プロダクト開発は [`docs/product-development.md`](../product-development.md) の **MLP First** と接続し、`Experience Hypothesis → Vertical Slice → MLP → Retention` の学習をAI-Native運用へ戻す。

## Current state

- Foundation: PR #19 — 完了
- Observe: PR #21 — 完了
- Deterministic Message Guardrail: PR #22 — 完了
- MLP First: PR #24 — 完了
- Assist: PR #25 / Issue #23 — 完了
- Closed Learning Loop: Issue #26 — 実装中
- PR #16 数秘術ドメインは別系統で進行中

# Iteration 1 — Foundation ✅

North Star、責務分離、Safety、Evidence、Analyst / VoC Analyst、Learning Gateを確立。

# Iteration 2 — Observe ✅

Event / Metric / identity / regression fixture / Weekly Learning Reportの契約を確立。

# Iteration 3 — Assist ✅

Draft Maker / Reviewer / Human Gateを確立。

- Content Agent — Draft Maker
- Growth Agent — Experiment / Draft Maker
- Reading Quality Agent — Reviewer only
- `reviewer != maker`
- Growth metric / guardrailは`metric_definition_ref`で追跡
- Content 5 / Growth 5 / Reading Quality 6 regression fixtures
- PR #25 merge / Issue #23 close

Scope out継続: auto publish / CRM send / price / charge / reading generator / Orchestrator。

# Iteration 4 — Closed Learning Loop 🚧

Tracking: #26

## Goal

AIに本番Experimentを実行させず、**Humanが承認・実行したExperimentをEvidence付きで評価し、Accepted Learning候補まで閉じる**。

```text
Proposal
  ↓
Human Approval
  ↓
Manual Execution Receipt
  ↓
Observation / Evidence
  ↓
Independent Evaluation
  ↓
Learning Candidate
  ↓
Human / Independent Acceptance Gate
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

## Plan review / changes

当初のClosed Workflowから次を明確化した。

1. **Execution Receipt**を追加し、予定と実際の変更を分離
2. EvaluatorはProposal Makerと別主体 (`evaluator != maker`)
3. target / guardrailはMetric Contract ref必須
4. target改善 + guardrail悪化ではadopt禁止
5. negative / inconclusive / stoppedもLearning Evidenceとして保持
6. AIはLearning Candidateまで。Accepted Learning自己昇格禁止
7. 実行結果をMLPのExperience Hypothesis / Polish / Retentionへ戻す
8. Production actionはHuman-onlyを維持

## Deliverables

### Contract
- [x] `experiment-contract.md`

### Skills
- [x] `evaluate-experiment`
- [x] `prepare-learning-candidate`

### Workflow
- [x] `closed-learning-loop.md`

### Regression / Eval
- [x] Experiment fixture 7 cases
- [x] positive / negative / inconclusive / stopped
- [x] target up + guardrail down
- [x] causal overclaim / confounder
- [x] evaluator independence / Execution Receipt contract
- [x] fixture validator拡張
- [x] Human review rubric拡張

### Repository integration / validation
- [x] Eval framework更新
- [x] Execution Plan更新
- [ ] AI-Native README更新
- [ ] Closed Loop review record
- [ ] Issue #26進捗更新
- [ ] PR作成
- [ ] CI Green
- [ ] 最終差分レビュー
- [ ] 7視点レビュー
- [ ] Review blocker反映
- [ ] merge / Issue close

## Exit criteria

- [x] Proposal → Human Approval → Receipt → Evaluation → CandidateのContract
- [x] Human execution / acceptance境界
- [x] evaluator != maker
- [x] Metric Contract ref必須
- [x] Guardrail悪化時adopt禁止
- [x] Negative / inconclusive / stoppedを保持
- [x] AI自己昇格禁止
- [x] fixture validator拡張
- [ ] CI Green
- [ ] 7視点レビュー済み
- [ ] Blocker 0、または全反映済み

## Scope out

- AIによる本番Experiment開始
- SNS / CRM自動配信
- price / charge操作
- Analytics SDK / DB migration / 実ユーザーデータ接続
- Orchestrator

# Iteration 5 — Controlled Autonomy

Candidate: 定期集計 / レポート / 分類 / Regression eval / Knowledge候補 / 異常検知。

Human Gate維持: 本番投稿 / CRM送信 / 価格・課金 / 高額商品方針 / High-stakes reading / Safety Policy変更。

# Iteration 6 — Orchestration

Entry criteria: 主要Agent Contract安定 / Skill Eval / Decision Queue実運用 / 自律レベル / 監査ログ / Stop condition。

Orchestratorは `Signal → Priority → Agent/Skill Routing` に限定する。

## Dependency map

```text
Foundation → Observe → Assist → Closed Learning Loop → Controlled Autonomy → Orchestration
```

後段から先に導入しない。

## Rollback strategy

- Agent / Skill / Eval / Workflow単位でrevert可能
- 外部サービス接続前は本番副作用なし
- 自律化単位ごとに停止可能
