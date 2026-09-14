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
7. **Defined does not mean observable**
   - Metric定義がactiveでも、実イベント・Evidence sourceが無ければ実測可能とは扱わない。

## Core documents

- [Product Development — MLP First](../product-development.md)
- [North Star](./north-star.md)
- [Operating Model](./operating-model.md)
- [Execution Plan](./execution-plan.md)
- [Foundation Review](./review-record.md)
- [Observe Review](./observe-review-record.md)
- [Assist Review](./assist-review-record.md)
- [Closed Loop Review](./closed-loop-review-record.md)
- [Closed Loop Operational Pilot](./closed-loop-pilot.md)
- [Safety Policy](./safety-policy.md)
- [Metrics & Evals](./metrics-and-evals.md)

## Observe contracts — Iteration 2

- [Event Taxonomy](./event-taxonomy.md)
- [Funnel Metrics](./funnel-metrics.md)
- [`Metric Registry`](../../ai/contracts/metric-registry.json)
- [`ai/evals/`](../../ai/evals/README.md)
- [`weekly-learning-report.md`](../../ai/workflows/templates/weekly-learning-report.md)

Metric参照には `metric:<stable-id>` を使う。

Metric Registryでは次を分離する。

```yaml
status: active | provisional
observability_status: uninstrumented | partial | observable
```

- `status` = Metric定義の状態
- `observability_status` = 実データでEvidence取得できる状態

Real Pilotで使うMetricは両方を確認する。

## Assist contracts — Iteration 3

Agents:

- [`Content Agent`](../../ai/agents/content.md)
- [`Growth Agent`](../../ai/agents/growth.md)
- [`Reading Quality Agent`](../../ai/agents/reading-quality.md) — Reviewer only

Skills:

- [`draft-content`](../../ai/skills/draft-content/SKILL.md)
- [`design-growth-experiment`](../../ai/skills/design-growth-experiment/SKILL.md)
- [`review-reading-quality`](../../ai/skills/review-reading-quality/SKILL.md)

Standard flow:

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

## Closed Learning Loop — Iteration 4

Contracts:

- [`Experiment Result Record`](../../ai/workflows/templates/experiment-result.md)
- [`Learning Candidate`](../../ai/workflows/templates/learning-candidate.md)
- [`Metric Registry`](../../ai/contracts/metric-registry.json)

Skills / Reviewer:

- [`evaluate-experiment`](../../ai/skills/evaluate-experiment/SKILL.md)
- [`review-learning-candidate`](../../ai/skills/review-learning-candidate/SKILL.md)
- [`Learning Reviewer Agent`](../../ai/agents/learning-reviewer.md)

Workflow:

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
- Candidateにprovenanceを残す
- `reviewer_id != candidate_maker_id`
- Safety/Trust悪化をBusiness metric改善で上書きしない
- Accepted Learning確定はHumanのみ
- Raw PII / consultation textをResult/Learningへ保存しない

## Operational Pilot — Iteration 4.5

Controlled Autonomyへ進む前に、Closed Loopの**運用可能性**を検証する。

- Runbook: [`closed-loop-pilot.md`](./closed-loop-pilot.md)
- Pilot template: [`pilot-run.md`](../../ai/workflows/templates/pilot-run.md)
- Synthetic narrative: [`closed-loop-pilot-synthetic.md`](../../ai/workflows/examples/closed-loop-pilot-synthetic.md)
- Machine-readable rehearsal: [`closed-loop-pilot-synthetic.json`](../../ai/workflows/examples/closed-loop-pilot-synthetic.json)
- CI validator: [`validate-pilot-rehearsal.mjs`](../../ai/evals/validate-pilot-rehearsal.mjs)

Current conclusion:

```text
Synthetic workflow rehearsal  → possible / CI validated
Manual Real Pilot             → blocked
Controlled Autonomy           → not entered
```

Real Pilot blockers:

- #31: privacy-safe telemetry / Evidence source
- #15: production or shared test surface decision

Synthetic成功をReal Product Learningとして扱わない。

## Iteration status

- Iteration 1 Foundation: 完了
- Iteration 2 Observe: 完了
- Deterministic Message Guardrail: 完了
- MLP First: 完了
- Iteration 3 Assist: 完了
- Iteration 4 Closed Learning Loop: PR #28 / Issue #27 — 完了
- Iteration 4.5 Operational Pilot: Issue #30 — Readiness評価中
- Pilot telemetry foundation: Issue #31 — open
- Iteration 5 Controlled Autonomy: **blocked until Real Pilot evidence exists**

## Human Gateを維持するもの

- Experiment start / stop
- SNS / CRM外部実行
- 価格変更 / 課金操作
- High-stakes content / reading
- Accepted Learning
- Safety Policy変更
- Orchestrator導入判断

## 関連

- 数秘術ドメイン: PR #16
