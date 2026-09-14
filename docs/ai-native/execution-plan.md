# AI-Native Execution Plan

Tracking: #18, #20

## Objective

`uranai-app` に、AI-Nativeな事業運用を段階的に導入する。自動化率ではなく、**責務境界・Evidence・Safety・Eval・Learning Loop**を先に成立させる。

## Current state

- Next.js / TypeScript / Vitest / CI は整備済み
- `AGENTS.md` にAI-TDDとドメイン境界がある
- `docs/concept-board.md` にブランド・NG表現がある
- PR #19 の AI-Native Foundation はレビュー・CI Green後にマージ済み
- PR #16 で数秘術ドメイン実装が進行中
- PR #17 で文言ガードレールが進行中
- Iteration 2 Observe を Issue #20 で実施中

---

# Iteration 1 — Foundation ✅

## Goal

Agentを増やす前に、AI-Native運用の「契約」を作る。

## Completed

- [x] North Star / Non-goals
- [x] Deterministic / AI / Human責務分離
- [x] Autonomy levels
- [x] Safety / Human Gate / Data safety / Stop conditions
- [x] Metrics / Evals / Evidence traceability / Regression policy
- [x] Analyst Agent / VoC Analyst Agent
- [x] analyze-voc / analyze-funnel
- [x] Weekly Learning Loop / Accepted Learning Gate / Decision Queue
- [x] `AGENTS.md` からAI-Native正本への導線
- [x] 複数視点レビュー
- [x] CI Green
- [x] PR #19 merge

---

# Iteration 2 — Observe

Tracking: #20

## Goal

実データを直接Agentへ接続する前に、**何を観測し、どう計算し、どう評価するか**を再現可能なContractとして固定する。

## Plan review / update

当初は「Weekly Learning Reportを実運用」まで想定していたが、本番Analytics/Event収集基盤が未導入なため順序を変更した。

### Updated sequence

1. 論理Event taxonomy
2. Funnel metric definitions
3. Synthetic regression fixtures
4. Fixture contractのmachine validation
5. Human review rubric
6. Weekly Learning Report template + synthetic example
7. 実データ接続は別Iteration

この順序により、計測SDKやDB実装都合でKPI定義が歪むことを避ける。

## Deliverables

### Analytics contract

- [x] `event-taxonomy.md`
- [x] `funnel-metrics.md`

### Regression / Eval

- [x] `ai/evals/README.md`
- [x] VoC fixture 6ケース
- [x] Funnel fixture 6ケース
- [x] Human review rubric
- [x] fixture contract validator
- [x] `npm run eval:contracts`
- [x] CIへAI eval contract validationを追加

### Weekly learning

- [x] Weekly Learning Report template
- [x] Synthetic example

### Repository integration

- [x] AI-Native README更新
- [x] Execution Plan更新
- [ ] PR作成
- [ ] CI確認
- [ ] 実装差分レビュー
- [ ] タスク完了前の複数視点レビュー
- [ ] Review指摘反映
- [ ] Issue #20更新

## Event taxonomy principles

- 行動事実をEventとして記録し、価値判断をevent nameへ埋め込まない
- PII / consultation raw textをanalytics payloadへ入れない
- Product eventとAI/Safety internal eventを分ける
- schema versionを持つ
- over-collectionを避ける

## Metric principles

- numerator / denominator / window / exclusions / guardrailsを定義
- sample size必須
- 利用増加 = ユーザー価値増加とみなさない
- Revenue / RetentionはHelpfulness / Safetyと同時評価
- 分母を定義できない率は無理にKPI化しない

## Fixture coverage

### VoC

- [x] supported pattern
- [x] single source
- [x] conflicting evidence
- [x] PII redaction
- [x] high-risk request
- [x] segment difference

### Funnel

- [x] clear drop-off
- [x] small sample
- [x] no comparison period
- [x] missing metric definition
- [x] conversion up / helpfulness down
- [x] correlation != causation

## Exit criteria

- [x] Event名・意味・allowed/forbidden payloadが明文化
- [x] KPIのnumerator / denominator / window / guardrailが定義
- [x] 2 Skill向けfixtureが6ケースずつ存在
- [x] Machine / Human eval境界が定義
- [x] PII / Safety failure fixtureが存在
- [x] Weekly Report template / synthetic exampleが存在
- [x] Fixture構造をCIでmachine validation可能
- [ ] Foundation原則との整合を複数視点レビューで再確認
- [ ] CI Green
- [ ] Blocker指摘0、または指摘反映済み

## Scope out

- Analytics SDK
- 実ユーザーデータ
- DB migration
- CRM / SNS連携
- Growth / Content / CRM Agent
- Orchestrator
- 自動Knowledge昇格

---

# Iteration 3 — Assist

## Entry criteria

Iteration 2のEvent / Metric / Eval contractがレビュー済みであること。

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

---

# Iteration 5 — Controlled autonomy

Candidate:

- 定期集計
- レポート生成
- 分類
- Regression eval
- Knowledge候補生成
- 異常検知

Keep Human Gate:

- 本番投稿
- LINE / メール / Push
- 価格変更
- 課金変更
- 高額商品の販売方針
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

Orchestratorは Signal → Priority → Agent/Skill Routing に限定する。

---

# Dependency map

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

# Rollback strategy

- Agent/Skill/Analytics contractを独立してrevert可能に保つ
- 外部サービス接続前は本番副作用を持たせない
- 後続Iterationでも自律化単位ごとに停止可能にする
