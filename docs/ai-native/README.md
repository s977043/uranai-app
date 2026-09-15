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
8. **Computed does not mean observable**
   - Synthetic/local Evidenceを集約できても、実Product surfaceとoperational Evidence sourceが無ければ本番Metricを`observable`へ昇格しない。
9. **Provisioned does not mean observable**
   - DBやhostingを作っただけでは実測可能とみなさない。server-side validation / query / retention / shared surface E2Eまで確認する。

## Core documents

- [Product Development — MLP First](../product-development.md)
- [North Star](./north-star.md)
- [Operating Model](./operating-model.md)
- [Execution Plan](./execution-plan.md)
- [Operational Evidence ADR](./operational-evidence-adr.md)
- [Operational Evidence Execution Plan](./operational-evidence-plan.md)
- [Foundation Review](./review-record.md)
- [Observe Review](./observe-review-record.md)
- [Assist Review](./assist-review-record.md)
- [Closed Loop Review](./closed-loop-review-record.md)
- [Closed Loop Operational Pilot](./closed-loop-pilot.md)
- [Operational Pilot Review](./closed-loop-pilot-review-record.md)
- [Pilot Telemetry Foundation](./telemetry-foundation.md)
- [Pilot Telemetry Review](./telemetry-foundation-review-record.md)
- [Reading Vertical Slice](./reading-vertical-slice.md)
- [Reading Vertical Slice Review](./reading-vertical-slice-review-record.md)
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
- Review: [`closed-loop-pilot-review-record.md`](./closed-loop-pilot-review-record.md)
- Pilot template: [`pilot-run.md`](../../ai/workflows/templates/pilot-run.md)
- Synthetic narrative: [`closed-loop-pilot-synthetic.md`](../../ai/workflows/examples/closed-loop-pilot-synthetic.md)
- Machine-readable Contract rehearsal: [`closed-loop-pilot-synthetic.json`](../../ai/workflows/examples/closed-loop-pilot-synthetic.json)
- Real Pilot readiness: [`closed-loop-pilot-readiness.json`](../../ai/workflows/examples/closed-loop-pilot-readiness.json)
- CI validator: [`validate-pilot-rehearsal.mjs`](../../ai/evals/validate-pilot-rehearsal.mjs)

Conclusion:

```text
Synthetic Contract E2E rehearsal  → possible / CI validated
Agent/Skill runtime E2E            → not validated
Manual Real Pilot                  → blocked
Controlled Autonomy                → not entered
```

## Pilot Telemetry Foundation — Iteration 4.6 ✅

Tracking: #31 / PR #34

- Design: [`telemetry-foundation.md`](./telemetry-foundation.md)
- Review: [`telemetry-foundation-review-record.md`](./telemetry-foundation-review-record.md)

Completed:

- `reading_started` / `reading_completed` / `reading_feedback_submitted` Contract
- random UUID v4 session ID / `reading_flow_id`
- strict property allowlist / PII boundary
- Telemetry Sink port + InMemory sink
- Reading Flow Completion / Helpful Feedback Rate集約
- Metric Observability promotion assessment

境界:

- `reading_flow_id`は1回のReadingのcorrelation keyでありuser identityではない
- `anonymous_visitor_id`は`null`固定
- persistence / external Analytics VendorはこのIterationで導入しない
- local/syntheticで`computed`でもRegistryは`observable`へ昇格しない

## Reading Vertical Slice — Iteration 4.7 ✅

Tracking: #33 / PR #35

- Design: [`reading-vertical-slice.md`](./reading-vertical-slice.md)
- Review: [`reading-vertical-slice-review-record.md`](./reading-vertical-slice-review-record.md)

Completed:

- 1枚のReflection ReadingをVertical Sliceとして実装
- `reading_type: reflection`
- テーマ → 一枚ひく → 解釈 → 自分への問い → 今日の一歩 → feedback
- Product Flowから3つのTelemetry Eventをemit
- browser `sessionStorage`をsession-local Evidence surfaceとして利用
- Message Guardrail regression
- Product / UX / Architecture / Privacy / Safety / Analytics / QA の複数視点レビュー

Current observability:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
```

`browser-session-storage:v1`はsession-local Evidenceであり、central operational Evidenceではないため`observable`にはしない。

Lovabilityはproxy reviewまで。actual User Observation / Retention / MLP Release readinessは未検証。

## Operational Evidence Decision — Phase A 🚧

Tracking: #15 / #39

- ADR: [`operational-evidence-adr.md`](./operational-evidence-adr.md)
- Plan: [`operational-evidence-plan.md`](./operational-evidence-plan.md)
- Machine contract: [`operational-evidence-source.json`](../../ai/contracts/operational-evidence-source.json)
- CI validator: [`validate-operational-evidence-decision.mjs`](../../ai/evals/validate-operational-evidence-decision.mjs)

Decision:

```text
Application runtime: Vercel Pro or higher
Storage contract: PostgreSQL / DATABASE_URL
DB provider: Neon or Supabase, selected at provision time
Raw telemetry retention: 30 days
Identity: session-only
Browser direct DB write: prohibited
Preview → Production DB write: prohibited
Telemetry failure: fail-open for Product Value Flow
```

Phase Aは有料resourceを作らない。現在の正しいmachine stateは`operational_gate.status = blocked`。

次にprovider-neutral server ingestion / PostgreSQL persistence / provider provisioning / shared-surface E2Eを順に進める。

## Current next gates

```text
Phase A Deployment + Evidence Decision
  ↓
Provider-neutral server ingestion
  ↓
PostgreSQL persistence / query / deletion
  ↓
Vercel Pro + DB provider provisioning
  ↓
Shared surface E2E
  ↓
Metric observable再評価
  ↓
Actual User Observation
  ↓
Polish Loop
  ↓
Manual Real Pilot
  ↓
Controlled Autonomy
```

## Iteration status

- Iteration 1 Foundation: 完了
- Iteration 2 Observe: 完了
- Deterministic Message Guardrail: 完了
- MLP First: 完了
- Iteration 3 Assist: 完了
- Iteration 4 Closed Learning Loop: PR #28 / Issue #27 — 完了
- Iteration 4.5 Operational Readiness: Issue #30 / PR #32 — 完了
- Iteration 4.6 Pilot Telemetry Foundation: Issue #31 / PR #34 — 完了
- Iteration 4.7 Reading Vertical Slice + instrumentation: Issue #33 / PR #35 — 完了
- Execution Receipt hardening: Issue #40 / PR #41 — 完了
- 数秘術 deterministic domain: PR #42 — 完了
- Deployment / Evidence Decision: #15 / #39 — Phase A実装中
- Operational central Evidence source: blocked until ingestion/storage/provisioning
- Manual Real Pilot: blocked
- Iteration 5 Controlled Autonomy: **blocked until Manual Real Pilot evidence exists**

## Human Gateを維持するもの

- paid plan / external resource provisioning
- DB provider最終選択
- Experiment start / stop
- SNS / CRM外部実行
- 価格変更 / 課金操作
- High-stakes content / reading
- Accepted Learning
- Safety Policy変更
- Orchestrator導入判断

## 関連

- 数秘術ドメイン: PR #42
