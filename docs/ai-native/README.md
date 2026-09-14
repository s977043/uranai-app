# AI-Native Fortune Business OS

このディレクトリは、`uranai-app` を単なる「AI機能付き占いアプリ」ではなく、**AIが日常Executionを進め、人間が世界観・ユーザー価値・倫理・重要判断に集中する事業OS**として育てるための設計正本です。

## 位置づけ

- 開発作業のルール正本: [`AGENTS.md`](../../AGENTS.md)
- プロダクト開発の基本形: [`docs/product-development.md`](../product-development.md)
- プロダクトの世界観・ブランド正本: [`docs/concept-board.md`](../concept-board.md)
- AI-Native事業運用の設計正本: 本ディレクトリ

競合した場合は、実装手順は `AGENTS.md`、ユーザー体験・表現方針は `concept-board.md`、プロダクト開発プロセスは `product-development.md` を優先し、AI-Native設計を修正します。

## North Star

> AIが日常的なExecutionを自律的に進め、人間は世界観・ユーザー価値・倫理・重要判断に集中する占い事業OSを作る。

AI稼働率最大化や人間ゼロ化は目的ではありません。

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

## 設計原則

1. **Deterministic facts / AI interpretation**
2. **Execution / Judgment separation**
3. **Maker / Checker separation**
4. **Evidence-first learning**
5. **Controlled autonomy**
6. **Learning must return to product**
7. **Defined does not mean observable**
8. **Computed does not mean observable**

Metric定義がactiveでも、実Product eventとEvidence sourceが無ければ`observable`とは扱いません。Synthetic/local dataを計算できることも、本番Observabilityの証明には使いません。

## Core documents

- [Product Development — MLP First](../product-development.md)
- [North Star](./north-star.md)
- [Operating Model](./operating-model.md)
- [Execution Plan](./execution-plan.md)
- [Safety Policy](./safety-policy.md)
- [Metrics & Evals](./metrics-and-evals.md)
- [Event Taxonomy](./event-taxonomy.md)
- [Funnel Metrics](./funnel-metrics.md)
- [Pilot Telemetry Foundation](./telemetry-foundation.md)

Review records:

- [Foundation Review](./review-record.md)
- [Observe Review](./observe-review-record.md)
- [Assist Review](./assist-review-record.md)
- [Closed Loop Review](./closed-loop-review-record.md)
- [Operational Pilot Review](./closed-loop-pilot-review-record.md)

## Observe / Metric contracts

- [`Metric Registry`](../../ai/contracts/metric-registry.json)
- [`ai/evals/`](../../ai/evals/README.md)
- [`weekly-learning-report.md`](../../ai/workflows/templates/weekly-learning-report.md)

Metric Registryでは次を分離します。

```yaml
status: active | provisional
observability_status: uninstrumented | partial | observable
```

- `status` = Metric定義の状態
- `observability_status` = 実Product Evidenceを再現可能に取得できる状態

## Assist contracts — Iteration 3

Agents:

- [`Content Agent`](../../ai/agents/content.md)
- [`Growth Agent`](../../ai/agents/growth.md)
- [`Reading Quality Agent`](../../ai/agents/reading-quality.md)

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
- `reviewer_id != candidate_maker_id`
- Safety/Trust悪化をBusiness metric改善で上書きしない
- Accepted Learning確定はHumanのみ
- Raw PII / consultation textをResult/Learningへ保存しない

## Operational Readiness — Iteration 4.5

PR #32 / Issue #30でReadiness評価を完了。

```text
Synthetic Contract E2E rehearsal  → CI validated
Agent/Skill runtime E2E            → not validated
Manual Real Pilot                  → blocked
Controlled Autonomy                → not entered
```

## Pilot Telemetry Foundation — Iteration 4.6

Tracking: #31  
Product integration: #33

[`telemetry-foundation.md`](./telemetry-foundation.md) を正本とします。

### Foundationで実装するもの

- strict typed Event Contract
- `reading_started`
- `reading_completed`
- `reading_feedback_submitted`
- random `anonymous_session_id`
- random `reading_flow_id`
- Telemetry Sink port
- in-memory sink
- Reading Flow Completion集約
- Helpful Feedback Rate集約
- Observability promotion assessment

### Reading Flow correlation

同一sessionで複数Readingがあってもflow数を正しく数えるため、3イベントで同じ`reading_flow_id`を共有します。

これはuser identityではありません。

### Privacy

#31では:

- `anonymous_visitor_id = null`
- unknown propertyをreject
- raw consultation / prompt / responseをreject
- name / email / phone等をreject
- persistent storage無し
- external Analytics vendor無し

### Current Observability

Telemetry Foundationを実装してもReading Product Flowがまだ無いため:

```yaml
metric:reading_flow_completion: uninstrumented
metric:helpful_feedback_rate: uninstrumented
```

`computed`なSynthetic/local resultを理由にRegistryを`observable`へ変更しません。

## Reading Vertical Slice — next

Issue #33でMLP Firstに従い、Core ExperienceとTelemetryを実Product Flowへ接続します。

```text
Entry
  ↓
Reading Start          → reading_started
  ↓
Fortune / Interpretation
  ↓
Result                 → reading_completed
  ↓
Next Action
  ↓
Feedback               → reading_feedback_submitted
```

Product instrumentation + operational Evidence source + shared test surfaceが揃った後にManual Real Pilotへ進みます。

## Iteration status

- Iteration 1 Foundation: 完了
- Iteration 2 Observe: 完了
- Message Guardrail: 完了
- MLP First: 完了
- Iteration 3 Assist: 完了
- Iteration 4 Closed Learning Loop: 完了
- Iteration 4.5 Operational Readiness: PR #32 / Issue #30 — 完了
- Iteration 4.6 Pilot Telemetry Foundation: Issue #31 — 実装中
- Reading Vertical Slice + Product instrumentation: Issue #33 — open
- Shared test / deployment surface: Issue #15 — open
- Iteration 5 Controlled Autonomy: **blocked until Manual Real Pilot evidence exists**

## Human Gateを維持するもの

- Experiment start / stop
- SNS / CRM外部実行
- 価格変更 / 課金操作
- High-stakes content / reading
- Accepted Learning
- Safety Policy変更
- Orchestrator導入判断
