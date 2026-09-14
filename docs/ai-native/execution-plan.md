# AI-Native Execution Plan

Tracking: #18

## Objective

`uranai-app` に、AI-Nativeな事業運用を段階的に導入する。初期段階では自動化率ではなく、**責務境界・Evidence・Safety・Eval・Learning Loop**を先に成立させる。

## Current state

- Next.js / TypeScript / Vitest / CI は整備済み
- `AGENTS.md` にAI-TDDとドメイン境界がある
- `docs/concept-board.md` にブランド・NG表現がある
- PR #16 で数秘術ドメイン実装が進行中
- PR #17 で文言ガードレールが進行中

既存アプリコードとの競合を避けるため、Iteration 1は `docs/` と `ai/` を中心にする。

---

# Iteration 1 — Foundation

## Goal

Agentを増やす前に、AI-Native運用の「契約」を作る。

## Deliverables

### 1. North Star / boundaries

- [x] North Star
- [x] Non-goals
- [x] Deterministic / AI / Human責務分離
- [x] Autonomy levels

### 2. Safety

- [x] Hard block
- [x] Human Gate対象
- [x] Data safety
- [x] Stop conditions
- [x] PR #17との統合方針

### 3. Metrics / Evals

- [x] Product / AI operation metrics
- [x] Guardrail metrics
- [x] Eval dimensions
- [x] Evidence traceability
- [x] Regression policy
- [x] Promotion criteria

### 4. Agents

- [x] Analyst Agent
- [x] VoC Analyst Agent

このIterationでは以下を実装しない。

- Growth Agent
- Content Agent
- CRM Agent
- Product Agent
- Reading Quality Agent
- Safety JudgeのLLM実装
- Orchestrator

### 5. Skills

- [x] analyze-voc
- [x] analyze-funnel

### 6. Learning workflow

- [x] Weekly Learning Loop
- [x] Accepted Learning Gate
- [x] Decision Queue

### 7. Repository integration

- [ ] docs index更新
- [ ] Pull Request作成
- [ ] 差分レビュー
- [ ] CI / build確認
- [ ] Issue #18の進捗更新

## Exit criteria

Iteration 1を完了とみなす条件:

1. `AGENTS.md` / `concept-board.md` と矛盾しない
2. Analyst / VoC AgentのI/Oと禁止操作が明確
3. Fact / Hypothesis / Accepted Learningが別状態
4. Evidence参照が必須
5. Raw VoC / PIIのGit保存が禁止
6. SafetyがGrowth/Revenueより上位制約
7. 外部公開・配信・価格変更はHuman Gate
8. Skill/Prompt/Model変更時のRegression方針がある
9. PR #16 / #17と競合しない
10. 既存の `npm run verify` / `npm run build` を壊さない

---

# Iteration 2 — Observe

## Goal

実データを直接自動実行へ接続せず、分析品質を確認する。

## Work

- Event taxonomyを定義
- Funnel metric definitionsを固定
- 匿名化VoC fixtureを用意
- `analyze-voc` eval fixtureを作る
- `analyze-funnel` eval fixtureを作る
- Weekly Learning Reportテンプレートを実運用

## Exit criteria

- Evidence traceability: 100%
- Fact / hypothesis混同の重大エラー: 0
- PII leakage: 0
- Human reviewで継続利用可能と判断

数値閾値はfixtureを回した実測後に固定する。最初から根拠のない精度目標を置かない。

---

# Iteration 3 — Assist

## Goal

ユーザー向けExecutionの下書きをAI化する。

候補:

- Content Agent
- Growth Agent
- Reading Quality Agent

## Constraint

全てDraft-onlyから開始。

```text
AI Draft
  ↓
Independent Review
  ↓
Human Approval
  ↓
Publish
```

Reading領域はPR #17のDeterministic Guardrailを統合してから進める。

---

# Iteration 4 — Closed workflow

## Goal

分析→仮説→実験→評価→学習を閉ループ化する。

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
```

Product / CRMへの接続はこの段階で検討する。

---

# Iteration 5 — Controlled autonomy

## Candidate autonomous tasks

- 定期集計
- レポート生成
- 分類
- Regression eval
- Knowledge候補生成
- 異常検知

## Keep Human Gate

- 本番投稿
- LINE / メール / Push
- 価格変更
- 課金変更
- 高額商品の販売方針
- High-stakes reading
- Safety Policy変更

Human Gateを外す場合は個別にRisk / Eval / Rollbackをレビューする。

---

# Iteration 6 — Orchestration

## Entry criteria

以下を満たしてからOrchestratorを導入する。

- 主要AgentのContractが安定
- 各SkillにEvalが存在
- Decision Queueが実運用されている
- 自律レベルがAgent単位で定義済み
- 監査ログが取れる
- Stop conditionが機能

Orchestratorの責務は「全部やる」ではなく、Signal→Priority→適切なAgent/SkillへのRoutingに限定する。

---

# Dependency map

```text
Foundation
  ├─ Safety
  ├─ Metrics/Evals
  ├─ Agent Contracts
  └─ Skill Contracts
       ↓
Observe
       ↓
Assist
       ↓
Closed Workflow
       ↓
Controlled Autonomy
       ↓
Orchestration
```

後段から先に導入しない。

# Rollback strategy

Iteration 1はアプリ実行コードを変更せず、`docs/` / `ai/` の追加を中心とする。

- 問題時はPR全体をrevert可能
- 既存の占いロジック・UI・DBへ副作用を持たせない
- 後続IterationもAgent/Skill単位で無効化可能な設計を維持する
