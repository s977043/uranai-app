# AI-Native Fortune Business OS

このディレクトリは、`uranai-app` を単なる「AI機能付き占いアプリ」ではなく、**AIが日常Executionを進め、人間が世界観・ユーザー価値・倫理・重要判断に集中する事業OS**として育てるための設計正本です。

## 位置づけ

- 開発作業のルール正本: [`AGENTS.md`](../../AGENTS.md)
- プロダクト開発の基本形: [`docs/product-development.md`](../product-development.md)
- プロダクトの世界観・ブランド正本: [`docs/concept-board.md`](../concept-board.md)
- AI-Native事業運用の設計正本: 本ディレクトリ

互いに競合した場合は、実装手順は `AGENTS.md`、ユーザー体験・表現方針は `concept-board.md`、プロダクト開発プロセスは `product-development.md` を優先し、AI-Native設計を修正します。

## North Star

> AIが日常的なExecutionを自律的に進め、人間は世界観・ユーザー価値・倫理・重要判断に集中する占い事業OSを作る。

「AIをたくさん動かす」「人間をゼロにする」こと自体は目的ではありません。

## 基本ループ

```text
Acquire
  ↓
Experience
  ↓
Reading
  ↓
Retain
  ↓
Monetize
  ↓
VoC / Behavior
  ↓
Analyze
  ↓
Hypothesis
  ↓
Experiment
  └────────→ Product / Growth / Reading
```

AI-Native化の価値は各作業の自動化ではなく、**この学習ループを短く、検証可能にすること**にあります。

プロダクト開発側では、この事業学習ループを [`product-development.md`](../product-development.md) の `Experience Hypothesis → Vertical Slice → Lovability Review → User Observation → Polish Loop → MLP Release → Retention Validation` に接続します。AI-Native運用で得たEvidenceを次のExperience Hypothesisへ戻し、単なる機能追加ではなくLovabilityとRetentionの改善へ使います。

## 設計原則

1. **Deterministic facts / AI interpretation**
   - カード抽選、正逆、数秘等の占術上の事実は決定論的ロジックで扱う。
   - AIは解釈、言語化、分析、提案を担当する。

2. **Execution / Judgment separation**
   - AIは調査、分類、分析、下書き、テスト、レポートを担当する。
   - 人間はPurpose、Strategy、世界観、倫理、高リスク判断、Go/No-Goを担当する。

3. **Maker / Checker separation**
   - 生成したAgent自身に最終評価・承認をさせない。

4. **Evidence-first learning**
   - 観測や仮説をそのままKnowledge化しない。

5. **Controlled autonomy**
   - 自律化は低リスクで可逆な操作から段階的に広げる。

## Core documents

- [Product Development — MLP First](../product-development.md)
- [North Star](./north-star.md)
- [Operating Model](./operating-model.md)
- [Execution Plan](./execution-plan.md)
- [Foundation Review](./review-record.md)
- [Observe Review](./observe-review-record.md)
- [Safety Policy](./safety-policy.md)
- [Metrics & Evals](./metrics-and-evals.md)

## Observe contracts — Iteration 2

実データ接続より前に分析の入力・評価境界を固定しています。

- [Event Taxonomy](./event-taxonomy.md)
- [Funnel Metrics](./funnel-metrics.md)
- [`ai/evals/`](../../ai/evals/README.md) — regression fixture / review rubric / validator
- [`weekly-learning-report.md`](../../ai/workflows/templates/weekly-learning-report.md) — 週次Learningの標準テンプレート

## Assist contracts — Iteration 3

ユーザー向けExecutionは、まず**Draft-only**で扱います。

### Agents

- [`Content Agent`](../../ai/agents/content.md) — Content Draft Maker
- [`Growth Agent`](../../ai/agents/growth.md) — Experiment / Draft Maker
- [`Reading Quality Agent`](../../ai/agents/reading-quality.md) — Reviewer only

### Skills

- [`draft-content`](../../ai/skills/draft-content/SKILL.md)
- [`design-growth-experiment`](../../ai/skills/design-growth-experiment/SKILL.md)
- [`review-reading-quality`](../../ai/skills/review-reading-quality/SKILL.md)

### Workflow

- [`Draft → Review → Human Gate`](../../ai/workflows/draft-review-publish.md)

標準境界:

```text
Maker
  ↓
Draft / Proposal
  ↓
Deterministic Message Guardrail
  ↓
Independent Review
  ↓
Human Gate
```

Message Guardrailは既知NG表現を検出する**一層**であり、包括Safety保証ではありません。Contextual ReviewとHuman Gateを置き換えません。

Iteration 3で自動化しないもの:

- SNS公開 / scheduling
- LINE / メール / Push送信
- 価格変更 / 課金操作
- 鑑定生成Agent
- Human Gate解除
- Orchestrator

## Iteration status

- Iteration 1 Foundation: Issue #18 / PR #19 — 完了
- Iteration 2 Observe: Issue #20 / PR #21 — 完了
- Deterministic Message Guardrail: PR #22 — 完了（旧PR #17を置換）
- MLP First: PR #24 — 完了
- Iteration 3 Assist: Issue #23 — 実装・評価中

## 関連

- 数秘術ドメイン: PR #16
