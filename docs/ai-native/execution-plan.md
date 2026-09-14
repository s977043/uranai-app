# AI-Native Execution Plan

Tracking: #18, #20, #23

## Objective

`uranai-app` にAI-Nativeな事業運用を段階的に導入する。自動化率ではなく、**User Value / 責務境界 / Evidence / Safety / Eval / Learning Loop**を先に成立させる。

プロダクト開発は [`docs/product-development.md`](../product-development.md) の **MLP First** と接続し、`Experience Hypothesis → Vertical Slice → MLP → Retention` の学習をAI-Native運用へ戻す。

## Current state

- Foundation: PR #19 merge済み
- Observe: PR #21 merge済み / Issue #20 close済み
- Deterministic message guardrail: PR #22 merge済み（旧PR #17を置換）
- MLP First: PR #24 merge済み
- Iteration 3 Assist: Issue #23 / PR #25 — 実装・7視点レビュー・CI完了、merge ready
- PR #16 数秘術ドメインは別系統で進行中

# Iteration 1 — Foundation ✅

- [x] North Star / Non-goals
- [x] Deterministic / AI / Human責務分離
- [x] Autonomy levels
- [x] Safety / Human Gate / Data safety
- [x] Metrics / Evidence / Regression policy
- [x] Analyst / VoC Analyst
- [x] analyze-voc / analyze-funnel
- [x] Weekly Learning Loop / Accepted Learning Gate
- [x] 複数視点レビュー / CI / merge

# Iteration 2 — Observe ✅

Tracking: #20 / PR #21

- [x] Event taxonomy
- [x] Funnel metric definitions
- [x] privacy-safe cross-session identity contract
- [x] First Reading Completion / Reading Flow Completion分離
- [x] VoC / Funnel regression fixtures
- [x] Fixture contract validator
- [x] Human review rubric
- [x] Weekly Learning Report template / synthetic example
- [x] 7視点レビュー
- [x] CI Green / merge / Issue close

Intentional scope out: Analytics SDK / DB migration / 実ユーザーデータ接続 / identifier lifecycle実装。

# Iteration 3 — Assist ✅ merge ready

Tracking: #23 / PR #25

## Goal

ユーザー向けExecutionを**Draft-only**でAI化し、Maker / Reviewer / Human Gateを成立させる。

```text
Evidence / Brand / Objective
  ↓
Maker Agent
  ↓
Draft / Proposal
  ↓
Deterministic Message Guardrail
  ↓
Independent Review (reviewer != maker)
  ↓
Human Gate
  ↓
Manual execution only
```

## Plan review / changes

1. Reading Quality Agentは鑑定生成を行わずReviewer-only
2. Deterministic guardrailを包括SafetyとみなさずContextual Review + Human Gateを維持
3. Product ReleaseはMLP FirstのCore Experience / Lovability / Retentionと接続
4. 外部API・SNS自動投稿・CRM送信・価格変更は実装しない
5. Model Harness未確定のためfixture contract validation + Human rubricを先行
6. Growth target/guardrail metricは`metric_definition_ref`でObserve Contractへ追跡
7. `reviewer != maker` をWorkflow Contract化

## Entry criteria

- [x] Foundation / Observe merge済み
- [x] PR #22 message guardrail merge済み
- [x] Guardrail責務をSafety全体から分離
- [x] MLP First（PR #24）merge済み

## Deliverables

### Agent contracts
- [x] Content Agent — Draft Maker
- [x] Growth Agent — Experiment / Draft Maker
- [x] Reading Quality Agent — Reviewer only

### Skills
- [x] `draft-content`
- [x] `design-growth-experiment`
- [x] `review-reading-quality`

### Workflow
- [x] `Draft → Guardrail → Independent Review → Human Gate`
- [x] reviewer != maker

### Regression / Eval
- [x] Content fixture >= 5
- [x] Growth fixture >= 5
- [x] Reading Quality fixture >= 6
- [x] Fixture validatorをAssistへ拡張
- [x] Human review rubricをAssistへ拡張
- [x] Growth Metric Contract refをmachine validation

### Repository integration / validation
- [x] Eval framework更新
- [x] AI-Native README更新
- [x] Execution Plan更新
- [x] Assist review record
- [x] Issue #23進捗更新
- [x] PR #25作成
- [x] CI Green
- [x] 最終差分レビュー
- [x] タスク完了前の7視点レビュー
- [x] Review blocker反映
- [ ] PR #25 merge / Issue #23 close

## CI result

- [x] npm ci
- [x] lint
- [x] typecheck
- [x] test
- [x] AI eval contracts
- [x] build

## Scope out

- 鑑定生成Agent
- 自動SNS投稿
- CRM自動送信
- 自動価格変更 / 実課金
- Orchestrator
- Human Gate解除

# Iteration 4 — Closed Workflow

```text
VoC / Behavior
  ↓
Analysis
  ↓
Hypothesis
  ↓
Experiment proposal
  ↓
Human approval
  ↓
Experiment
  ↓
Evaluation
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

Entry条件:

- AssistのMaker/Reviewer/Evalが安定
- 実行結果を追跡できる
- Accepted Learningへ昇格するEvidence Contractが実運用可能

# Iteration 5 — Controlled Autonomy

Candidate: 定期集計 / レポート / 分類 / Regression eval / Knowledge候補 / 異常検知。

Human Gate維持: 本番投稿 / CRM送信 / 価格・課金 / 高額商品方針 / High-stakes reading / Safety Policy変更。

# Iteration 6 — Orchestration

Entry criteria: 主要Agent Contract安定 / Skill Eval / Decision Queue実運用 / 自律レベル / 監査ログ / Stop condition。

Orchestratorは `Signal → Priority → Agent/Skill Routing` に限定する。

## Dependency map

```text
Foundation → Observe → Assist → Closed Workflow → Controlled Autonomy → Orchestration
```

後段から先に導入しない。

## Rollback strategy

- Agent / Skill / Eval / Workflow単位でrevert可能
- 外部サービス接続前は本番副作用なし
- 自律化単位ごとに停止可能
