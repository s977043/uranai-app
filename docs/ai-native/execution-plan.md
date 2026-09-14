# AI-Native Execution Plan

Tracking: #18, #20, #23, #27

## Objective

`uranai-app` にAI-Nativeな事業運用を段階的に導入する。自動化率ではなく、**User Value / 責務境界 / Evidence / Safety / Eval / Learning Loop**を先に成立させる。

プロダクト開発は [`docs/product-development.md`](../product-development.md) の **MLP First** と接続し、`Experience Hypothesis → Vertical Slice → MLP → Retention` の学習をAI-Native運用へ戻す。

## Current state

- Foundation: PR #19 merge済み
- Observe: PR #21 merge済み / Issue #20 close済み
- Deterministic message guardrail: PR #22 merge済み
- MLP First: PR #24 merge済み
- Assist: PR #25 merge済み / Issue #23 close済み
- Iteration 4 Closed Learning Loop: Issue #27 / PR #28 — 実装・7視点レビュー完了、latest CI確認中
- PR #16 数秘術ドメインは別系統で進行中

# Iteration 1 — Foundation ✅

- [x] North Star / Non-goals
- [x] Deterministic / AI / Human責務分離
- [x] Safety / Human Gate / Data safety
- [x] Metrics / Evidence / Regression policy
- [x] Analyst / VoC Analyst
- [x] Weekly Learning Loop / Accepted Learning Gate
- [x] 複数視点レビュー / CI / merge

# Iteration 2 — Observe ✅

Tracking: #20 / PR #21

- [x] Event taxonomy / Funnel metric definitions
- [x] privacy-safe identity contract
- [x] VoC / Funnel regression fixtures
- [x] Fixture validator / Human review rubric
- [x] Weekly Learning Report template
- [x] 7視点レビュー / CI / merge

# Iteration 3 — Assist ✅

Tracking: #23 / PR #25

- [x] Content Agent — Draft Maker
- [x] Growth Agent — Experiment / Draft Maker
- [x] Reading Quality Agent — Reviewer only
- [x] `draft-content` / `design-growth-experiment` / `review-reading-quality`
- [x] Draft → Guardrail → Independent Review → Human Gate
- [x] `reviewer != maker`
- [x] Content/Growth/Reading regression fixtures
- [x] Growth `metric_definition_ref`
- [x] 7視点レビュー / CI / merge / Issue close

Intentional scope out:

- 鑑定生成Agent
- 自動SNS / CRM
- 自動Price / Charge
- Human Gate解除

# Iteration 4 — Closed Learning Loop 🚧 final validation

Tracking: #27 / PR #28

## Goal

Humanが承認・実行したExperimentをEvidence付きで評価し、独立Reviewを経てAccepted Learningへ昇格し、次のExperience Hypothesis / MLP Polishへ戻す。

```text
Evidence / Accepted Learning
  ↓
Hypothesis
  ↓
Experiment Proposal
  ↓
Human Approval
  ↓
Manual / external execution
  ↓
Experiment Result Record
  ↓
Evaluation
  ↓
Learning Candidate + provenance
  ↓
Independent Learning Review
  ↓
Human Accept / Reject
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

## Plan review / changes

当初のClosed Workflowから以下を変更した。

1. 自動Experiment実行はしない。外部副作用は引き続きHuman Gate。
2. Experiment Result Recordを正本化し、Metric / sample / guardrail / limitationを保持する。
3. EvaluatorとLearning Reviewerを分離する。
4. Learning Reviewerは推薦まで。Accepted Learning確定はHumanのみ。
5. Accepted LearningをKnowledge蓄積で終わらせず、次のExperience Hypothesis / MLP Polishへ戻す。
6. Model Harness未確定のため、output runnerよりfixture contract / Human rubricを先行する。
7. Markdown anchorではなくMachine-readable Metric Registryのstable IDを導入する。
8. Learning Candidateに`candidate_maker_id` / `source_evaluation_refs`を残し、Reviewer独立性を監査可能にする。
9. Experiment execution statusとevaluation validityを分離する。

## Entry criteria

- [x] Foundation / Observe / Assist merge済み
- [x] Growth Metric Contract refが追跡可能
- [x] reviewer != maker / Human Gate成立
- [x] Accepted Learning自己昇格禁止がFoundationで定義済み

## Deliverables

### Contracts / templates

- [x] `experiment-result.md`
- [x] `learning-candidate.md`
- [x] Experiment state machine
- [x] Learning state machine
- [x] Candidate provenance contract
- [x] Stable Metric Registry

### Skills / Agent

- [x] `evaluate-experiment`
- [x] `review-learning-candidate`
- [x] Learning Reviewer Agent — Reviewer only

### Workflow

- [x] `closed-learning-loop.md`
- [x] evaluator / learning reviewer / Human decision ownerを分離
- [x] Accepted Learning → Experience Hypothesis / MLP PolishへのReturn path
- [x] execution status / evaluation validityを分離

### Regression / Eval

- [x] Experiment evaluation fixture >= 6
- [x] Learning review fixture >= 6
- [x] Fixture validator拡張
- [x] Metric Registry validator追加
- [x] Result Evidence / Candidate provenance検証
- [x] Human review rubric拡張
- [x] Eval README更新

### Repository integration / validation

- [x] AI-Native README更新
- [x] Execution Plan更新
- [x] Closed Loop review record
- [ ] Issue #27最終進捗更新
- [x] PR #28作成
- [ ] Latest CI Green
- [x] タスク完了前の7視点レビュー
- [x] Review blocker反映
- [ ] Final diff / unresolved thread確認
- [ ] merge / Issue close

## Multi-perspective review findings resolved

1. **Metric参照がMarkdown anchor依存 / 未定義KPI参照**
   - `ai/contracts/metric-registry.json` と `metric:<stable-id>` を導入
   - Registry専用validatorでfixture参照をCI検証
2. **Learning Reviewの`maker_id`が曖昧**
   - `candidate_maker_id`へ変更しCandidate provenanceを必須化
3. **Experiment statusと分析validityの混同**
   - `completed|stopped|invalid` と `valid|limited|invalid` を分離
   - Sample不足は隠さず`limited / inconclusive`へ反映

## Safety / Learning rules

- Safety/Trust悪化をBusiness metric改善で上書きしない
- Registryで解決できないMetricを通常評価に使わない
- invalid ExperimentからAccepted Learningを作らない
- insufficient sampleをhigh confidenceで一般化しない
- conflicting evidenceを隠さない
- `reviewer_id != candidate_maker_id`
- Human decision無しで`accepted_learning`へ遷移しない
- Raw PII / consultation textをResult/Learningへ保存しない

## Scope out

- 自動Experiment開始
- SNS / CRM自動実行
- 自動価格変更 / 実課金
- 実Analytics SDK / 実ユーザーデータ ingestion
- AgentによるAccepted Learning自動確定
- Orchestrator

# Iteration 5 — Controlled Autonomy

Entry条件はClosed LoopのExperiment Result / Learning Reviewが実運用で安定していること。

Candidate:

- 定期集計
- レポート生成
- 分類
- Regression eval
- Knowledge candidate生成
- 異常検知

Human Gate維持:

- 本番投稿 / CRM送信
- 価格 / 課金変更
- 高額商品方針
- High-stakes reading
- Safety Policy変更

# Iteration 6 — Orchestration

Entry criteria:

- 主要Agent Contract安定
- Skill Eval存在
- Decision Queue / Closed Learning Loop実運用
- 自律レベル定義済み
- 監査ログ
- Stop condition検証済み

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
