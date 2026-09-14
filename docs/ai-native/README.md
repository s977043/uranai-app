# AI-Native Fortune Business OS

このディレクトリは、`uranai-app` を単なる「AI機能付き占いアプリ」ではなく、**AIが日常Executionを進め、人間が世界観・ユーザー価値・倫理・重要判断に集中する事業OS**として育てるための設計正本です。

## 位置づけ

- 開発作業のルール正本: [`AGENTS.md`](../../AGENTS.md)
- プロダクトの世界観・ブランド正本: [`docs/concept-board.md`](../concept-board.md)
- AI-Native事業運用の設計正本: 本ディレクトリ

互いに競合した場合は、実装手順は `AGENTS.md`、ユーザー体験・表現方針は `concept-board.md` を優先し、AI-Native設計を修正します。

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

- [North Star](./north-star.md)
- [Operating Model](./operating-model.md)
- [Execution Plan](./execution-plan.md)
- [Multi-perspective Review](./review-record.md)
- [Safety Policy](./safety-policy.md)
- [Metrics & Evals](./metrics-and-evals.md)

## Observe contracts

Iteration 2では、実データ接続より前に分析の入力・評価境界を固定します。

- [Event Taxonomy](./event-taxonomy.md)
- [Funnel Metrics](./funnel-metrics.md)
- [`ai/evals/`](../../ai/evals/README.md) — regression fixture / review rubric / validator
- [`weekly-learning-report.md`](../../ai/workflows/templates/weekly-learning-report.md) — 週次Learningの標準テンプレート

### Why contracts first

Analytics SDKや外部サービスを先に入れると、計測項目が実装都合で固定されやすくなります。先に論理Event / KPI / Evalを定義し、後で任意の計測基盤へマッピングします。

## Iteration 1 — Foundation

PR #19で完了・マージ済み。

- AI/Human/Deterministic の責務境界
- Analyst / VoC Analyst のAgent Contract
- `analyze-voc` / `analyze-funnel` Skill Contract
- Weekly Learning Loop
- Safety / Metrics / Eval / Knowledge更新規則

## Iteration 2 — Observe

対象:

- Event taxonomy
- Funnel metric definitions
- Synthetic regression fixtures
- Machine-checkable fixture contract validation
- Human review rubric
- Weekly Learning Report template / synthetic example

まだ実装しないもの:

- 本番Analytics SDK
- 実ユーザーデータ接続
- SNS自動投稿
- LINE / メール / Pushの自動送信
- 自動価格変更
- Growth / Content / CRM Agent
- Orchestrator

## 関連

- Foundation: Issue #18 / PR #19
- Observe: Issue #20
- 数秘術ドメイン: PR #16
- 文言ガードレール: PR #17
