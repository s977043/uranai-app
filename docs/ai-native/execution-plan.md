# AI-Native Execution Plan

Tracking: #18, #20, #23

## Objective

`uranai-app` に、AI-Nativeな事業運用を段階的に導入する。自動化率ではなく、**User Value / 責務境界 / Evidence / Safety / Eval / Learning Loop**を先に成立させる。

プロダクト開発は [`docs/product-development.md`](../product-development.md) の **MLP First** と接続し、`Experience Hypothesis → Vertical Slice → MLP → Retention` の学習をAI-Native運用へ戻す。

## Current state

- Foundation: PR #19 merge済み
- Observe: PR #21 merge済み / Issue #20 close済み
- Deterministic message guardrail: PR #22 merge済み（旧PR #17を置換）
- MLP First: PR #24 merge済み
- Iteration 3 Assist: Issue #23 / `feature/ai-native-assist` で実装中
- PR #16 数秘術ドメインは別系統で進行中

---

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

---

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

Intentional scope out:

- Analytics SDK / DB migration
- 実ユーザーデータ接続
- identifier lifecycle実装

---

# Iteration 3 — Assist 🚧

Tracking: #23

## Goal

ユーザー向けExecutionを**Draft-only**でAI化し、Maker / Reviewer / Human Gateを成立させる。

```text
Evidence / Brand / Objective
  ↓
Maker Agent
  ↓
Draft / Proposal
  ↓
Deterministic Message Guardrail（該当テキスト）
  ↓
Independent Review
  ↓
Human Gate
  ↓
Manual execution only
```

## Plan review / changes

当初案から次を修正した。

1. `Reading Quality Agent` は鑑定生成を行わず **Reviewer-only**
2. Deterministic guardrailを包括Safetyとみなさず、Contextual Review + Human Gateを維持
3. Product ReleaseはMVPではなくMLP FirstのCore Experience / Lovability / Retentionと接続
4. 本Iterationでは外部API・SNS自動投稿・CRM送信・価格変更を実装しない
5. モデルHarness未確定のため、fixture contract validation + Human rubricを先に成熟させる

## Entry criteria

- [x] Foundation / Observe merge済み
- [x] PR #22 deterministic message guardrail merge済み
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

### Regression fixtures

- [x] Content >= 5
- [x] Growth >= 5
- [x] Reading Quality >= 6
- [x] Fixture validatorをAssistへ拡張
- [x] Human review rubricをAssistへ拡張

### Repository integration / validation

- [x] Eval framework更新
- [ ] AI-Native README更新
- [x] Execution Plan更新
- [ ] Assist review record
- [ ] Issue #23進捗更新
- [ ] PR作成
- [ ] CI Green
- [ ] 最終差分レビュー
- [ ] タスク完了前の7視点レビュー
- [ ] Review blocker反映
- [ ] merge / Issue close

## Agent boundaries

### Content

Allowed: research from approved knowledge, outline, draft, CTA proposal.  
Forbidden: publish/send, fake testimonial, invented metric, Raw VoC/PII, fear-based CTA.

### Growth

Allowed: evidence-backed experiment proposal, metric/guardrail/stop condition, draft assets.  
Forbidden: launch campaign, price change, fake scarcity, vulnerability targeting, production change.

### Reading Quality

Reviewer only。  
Forbidden: fortune fact変更、final reading生成、自己修正→自己承認、Human Gate迂回。

## Exit criteria

- [x] 3 Agentの責務と権限が明確
- [x] Maker / Reviewer分離
- [x] 3 SkillがEvidence / Safety / Human Gateを要求
- [x] external publish/send/change_priceは禁止
- [x] deterministic guardrailの責務を過大評価しない
- [x] Content/Growth/Reading regression fixture
- [x] validatorが新fixturesを検証可能
- [ ] CI Green
- [ ] 7視点レビュー済み
- [ ] Blocker 0、または全反映済み

## Scope out

- 鑑定生成Agent
- 自動SNS投稿
- CRM自動送信
- 自動価格変更 / 実課金
- Orchestrator
- Human Gate解除

---

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

Entry条件は、AssistのMaker/Reviewer/Evalが安定し、実行結果を追跡できること。

---

# Iteration 5 — Controlled Autonomy

Candidate:

- 定期集計
- レポート生成
- 分類
- Regression eval
- Knowledge候補生成
- 異常検知

Keep Human Gate:

- 本番投稿 / CRM送信
- 価格 / 課金変更
- 高額商品方針
- High-stakes reading
- Safety Policy変更

---

# Iteration 6 — Orchestration

Entry criteria:

- 主要Agent Contract安定
- Skill Eval存在
- Decision Queue実運用
- 自律レベル定義済み
- 監査ログ
- Stop condition検証済み

Orchestratorは `Signal → Priority → Agent/Skill Routing` に限定する。

## Dependency map

```text
Foundation
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

## Rollback strategy

- Agent / Skill / Eval / Workflow単位でrevert可能にする
- 外部サービス接続前は本番副作用を持たせない
- 自律化単位ごとに停止可能にする
