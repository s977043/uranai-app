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
- Closed Learning Loop: PR #29 / Issue #26 — 実装・7視点レビュー・CI完了、merge ready
- PR #16 数秘術ドメインは別系統で進行中

# Iteration 1 — Foundation ✅
North Star、責務分離、Safety、Evidence、Analyst / VoC Analyst、Learning Gateを確立。

# Iteration 2 — Observe ✅
Event / Metric / identity / regression fixture / Weekly Learning Reportの契約を確立。

# Iteration 3 — Assist ✅
Draft Maker / Reviewer / Human Gateを確立。`reviewer != maker`、Metric Contract追跡、Draft-onlyを固定。

# Iteration 4 — Closed Learning Loop ✅ merge ready

Tracking: #26 / PR #29

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

1. Execution Receiptで予定と実際の変更を分離
2. `evaluator != maker` をSkill / fixture / validatorで強制
3. target / guardrailはMetric Contract ref必須
4. target改善 + guardrail悪化ではadopt禁止
5. negative / inconclusive / stoppedもEvidenceとして保持
6. `prepare-learning-candidate`をEvaluator OutputのEvidence Contractへ整合
7. AIはLearning Candidateまで。Accepted Learning自己昇格禁止
8. Accepted LearningをMLPのExperience Hypothesis / Polish / Retentionへ戻す
9. Production actionはHuman-only

## Deliverables

- [x] `experiment-contract.md`
- [x] `evaluate-experiment`
- [x] `prepare-learning-candidate`
- [x] `closed-learning-loop.md`
- [x] Experiment fixture 7 cases
- [x] positive / negative / inconclusive / stopped coverage
- [x] guardrail regression / Safety stop / causal overclaim fixture
- [x] evaluator independence / Execution Receipt validation
- [x] fixture validator拡張
- [x] Human review rubric拡張
- [x] AI-Native README更新
- [x] Execution Plan更新
- [x] Closed Loop review record
- [x] Issue #26進捗更新
- [x] PR #29作成
- [x] CI Green
- [x] 最終差分レビュー
- [x] 7視点レビュー
- [x] Review blocker反映
- [ ] PR #29 merge / Issue #26 close

## CI result

- [x] npm ci
- [x] lint
- [x] typecheck
- [x] test
- [x] AI eval contracts
- [x] build

## Scope out

- AIによる本番Experiment開始
- SNS / CRM自動配信
- price / charge操作
- Analytics SDK / DB migration / 実ユーザーデータ接続
- Orchestrator

# Iteration 5 — Controlled Autonomy

Candidate: 定期集計 / レポート / 分類 / Regression eval / Knowledge候補 / 異常検知。

Human Gate維持: 本番投稿 / CRM送信 / 価格・課金 / 高額商品方針 / High-stakes reading / Safety Policy変更。

Entry条件:

- Closed Learning Loopが実運用可能
- audit trailが一貫して追跡可能
- output assertion runnerまたは同等の回帰検証がある
- rollback / stop conditionを操作単位で定義可能

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
