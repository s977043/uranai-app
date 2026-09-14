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
  ↓
Evaluation
  ↓
Accepted Learning
  └────────→ Next Experience Hypothesis / MLP Polish
```

AI-Native化の価値は各作業の自動化ではなく、**EvidenceからLearningを作り、そのLearningを次の体験改善へ戻すループを短く、検証可能にすること**にあります。

プロダクト開発側では、この事業学習ループを [`product-development.md`](../product-development.md) の `Experience Hypothesis → Vertical Slice → Lovability Review → User Observation → Polish Loop → MLP Release → Retention Validation` に接続します。

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

6. **Learning must return to product**
   - Accepted Learningを蓄積するだけで終わらせず、次のExperience Hypothesis / MLP Polishへ戻す。

## Core documents

- [Product Development — MLP First](../product-development.md)
- [North Star](./north-star.md)
- [Operating Model](./operating-model.md)
- [Execution Plan](./execution-plan.md)
- [Foundation Review](./review-record.md)
- [Observe Review](./observe-review-record.md)
- [Assist Review](./assist-review-record.md)
- [Closed Loop Review](./closed-loop-review-record.md)
- [Safety Policy](./safety-policy.md)
- [Metrics & Evals](./metrics-and-evals.md)

## Observe contracts — Iteration 2

実データ接続より前に分析の入力・評価境界を固定しています。

- [Event Taxonomy](./event-taxonomy.md)
- [Funnel Metrics](./funnel-metrics.md)
- [`Metric Registry`](../../ai/contracts/metric-registry.json) — Agent/Skillが参照するstable Metric IDの正本
- [`ai/evals/`](../../ai/evals/README.md)
- [`weekly-learning-report.md`](../../ai/workflows/templates/weekly-learning-report.md)

Metric参照にはMarkdown見出しURLではなく `metric:<stable-id>` を使い、CIでRegistryへの解決可能性を検証します。

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

Message Guardrailは既知NG表現を検出する**一層**であり、包括Safety保証ではありません。

## Closed Learning Loop — Iteration 4

Humanが承認・実行したExperimentを、Accepted Learningへ安全に変換し、MLP改善へ戻します。

### Contracts

- [`Experiment Result Record`](../../ai/workflows/templates/experiment-result.md)
- [`Learning Candidate`](../../ai/workflows/templates/learning-candidate.md)
- [`Metric Registry`](../../ai/contracts/metric-registry.json)

### Skills / Reviewer

- [`evaluate-experiment`](../../ai/skills/evaluate-experiment/SKILL.md)
- [`review-learning-candidate`](../../ai/skills/review-learning-candidate/SKILL.md)
- [`Learning Reviewer Agent`](../../ai/agents/learning-reviewer.md)

### Workflow

- [`Closed Learning Loop`](../../ai/workflows/closed-learning-loop.md)

```text
Experiment Proposal
  ↓
Human Approval / Manual Execution
  ↓
Experiment Result
  ↓
Evaluator / Candidate Maker
  ↓
Learning Candidate + provenance
  ↓
Independent Learning Reviewer
  ↓
Human Gate
  ↓
Accepted Learning
  ↓
Experience Hypothesis / MLP Polish
```

重要な境界:

- AIはExperimentを自動開始しない
- `metric_definition_ref` はactiveなMetric Registry IDへ解決できること
- Learning Candidateに`candidate_maker_id`とsource evaluation provenanceを残す
- `reviewer_id != candidate_maker_id`
- Safety/Trust悪化をBusiness metric改善で上書きしない
- invalid ExperimentからLearningを昇格しない
- Learning Reviewerは推薦まで
- Accepted Learning確定はHumanのみ
- Raw PII / consultation textをResult/Learningへ保存しない

## Iteration status

- Iteration 1 Foundation: Issue #18 / PR #19 — 完了
- Iteration 2 Observe: Issue #20 / PR #21 — 完了
- Deterministic Message Guardrail: PR #22 — 完了
- MLP First: PR #24 — 完了
- Iteration 3 Assist: Issue #23 / PR #25 — 完了
- Iteration 4 Closed Learning Loop: Issue #27 / PR #28 — レビュー・検証中

Iteration 4でも自動化しないもの:

- SNS / CRMの自動実行
- 価格変更 / 課金操作
- Experimentの自動開始
- Accepted LearningのAI単独確定
- 実Analytics SDK / 実ユーザーデータ接続
- Human Gate解除
- Orchestrator

## 関連

- 数秘術ドメイン: PR #16
