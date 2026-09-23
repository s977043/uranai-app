# AI-Native Execution Plan

Tracking: #18, #20, #23, #27, #30, #31, #33

## Objective

`uranai-app` にAI-Nativeな事業運用を段階的に導入する。自動化率ではなく、**User Value / 責務境界 / Evidence / Safety / Eval / Learning Loop**を先に成立させる。

プロダクト開発は [`docs/product-development.md`](../product-development.md) の **MLP First** と接続し、`Experience Hypothesis → Vertical Slice → MLP → Retention` の学習をAI-Native運用へ戻す。

## Current state

- Iteration 1 Foundation: PR #19 — 完了
- Iteration 2 Observe: PR #21 / Issue #20 — 完了
- Deterministic message guardrail: PR #22 — 完了
- MLP First: PR #24 — 完了
- Iteration 3 Assist: PR #25 / Issue #23 — 完了
- Iteration 4 Closed Learning Loop: PR #28 / Issue #27 — 完了
- Iteration 4.5 Operational Readiness: Issue #30 / PR #32 — 完了
- Iteration 4.6 Pilot Telemetry Foundation: Issue #31 / PR #34 — 完了
- Iteration 4.7 Reading Vertical Slice + Product instrumentation: Issue #33 / PR #35 — 完了
- Operational Evidence Phase A Decision: #15 / #39 / PR #43 — 完了
- Operational Evidence Phase B ingestion core: #44 / PR #45 — 完了
- Operational Evidence Phase C PostgreSQL persistence + API: #46 / PR #48 — 進行中
- Deployment / managed storage / shared test surface: #15 / #39 — Phase D/Eで必要
- Manual Real Pilot — blocked
- Iteration 5 Controlled Autonomy — blocked
- PR #16 数秘術ドメインは別系統

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

Intentional scope out: Analytics SDK / DB migration / real user data ingestion / identifier lifecycle。

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

# Iteration 4 — Closed Learning Loop ✅

Tracking: #27 / PR #28

```text
Experiment Proposal
  ↓
Human Approval / Manual Execution
  ↓
Experiment Result Record
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
Next Experience Hypothesis / MLP Polish
```

Completed:

- [x] Experiment Result / Learning Candidate Contract
- [x] `evaluate-experiment`
- [x] Learning Reviewer Agent / Skill
- [x] execution status / evaluation validity分離
- [x] stable `metric:<id>` Registry
- [x] Candidate `candidate_maker_id` / `source_evaluation_refs`
- [x] Safety / Guardrail integrity
- [x] 12+ Closed Loop fixtures
- [x] Metric Registry / fixture validators
- [x] 7視点レビュー / blocker修正
- [x] Final CI Green
- [x] PR #28 squash merge (`dcf5622`)
- [x] Issue #27 close

# Iteration 4.5 — Closed Loop Operational Readiness ✅

Tracking: #30 / PR #32  
Deployment/test surface: #15  
Review: [`closed-loop-pilot-review-record.md`](./closed-loop-pilot-review-record.md)

## Why this iteration exists

Iteration 5 Controlled AutonomyのEntry条件は、Closed Loopが**実運用で安定**していること。

Iteration 4で証明したのはContract / Eval / Human Gateの設計整合性であり、実Evidence取得・Metric observability・Human待ち時間・Evidence準備コスト・実行/rollback摩擦・MLP return pathは未検証。したがってControlled Autonomyへ直行しない。

## Plan review / changes

1. **Metric definitionとobservabilityを分離**
   - `status: active | provisional` = 定義状態
   - `observability_status: uninstrumented | partial | observable` = 実測能力
2. **SyntheticをContract E2EとしてCI検証**
   - machine-readable JSON + validatorを正本化。
   - Agent/Skill runtime E2Eとは明確に分離。
3. **Blockedを正しいReadiness結果として扱う**
   - Evidence/source/surface不足を隠して擬似Real Pilotを作らない。
4. **Readinessは現在状態をハードコードせずルールから導出**
   - Metric observability / Evidence source / execution surface / controls / blockersで`ready|blocked`を判定。
5. **最初のTelemetryはsession-levelに限定**
   - Cross-session identityを先に導入しない。
6. **Automation範囲を増やさない**
   - PilotではhandoffとEvidence品質を観測する。

## Phase A — Synthetic Contract E2E rehearsal ✅

- [x] Positive path
- [x] Safety-blocked path
- [x] Human start decision
- [x] Result Evidence ref
- [x] Candidate provenance
- [x] Reviewer independence
- [x] Synthetic learning promotion禁止
- [x] `closed-loop-pilot-synthetic.json`
- [x] `validate-pilot-rehearsal.mjs`
- [x] `npm run eval:contracts`へ統合

未検証: Agent/Skill runtime E2E、live Analytics、実ユーザー挙動。

## Phase B — Manual Real Pilot readiness ✅ evaluated

- [x] Pilot Run Template
- [x] readiness / blocker contract
- [x] Metric definition / observability分離
- [x] Evidence source必須化
- [x] execution surface必須化
- [x] Human owner / stop / rollback必須化
- [x] Privacy / Safety条件
- [x] Current blocking dependencyを特定
- [x] Readiness判定をCIでルール導出

### Current result after #33

**BLOCKED — expected and valid readiness result.**

Progress:

- Product Reading Flow: implemented
- Product event wiring: implemented
- `metric:reading_flow_completion`: `partial`
- `metric:helpful_feedback_rate`: `partial`
- browser session-local Evidence: available

Remaining blockers:

1. central / operational Evidence source無し
2. target / guardrail Metricがまだ`observable`ではない
3. production/shared test surfaceは#15で判断待ち
4. actual User Observation / Polish Loop未実施

## Phase C — Manual Real Pilot 🔒 not started

- [ ] target Metricが`observable`
- [ ] guardrail Metricが1つ以上`observable`
- [ ] Evidence source operational
- [ ] execution surface available
- [ ] actual User Observation / Polish Loop
- [ ] Human start / stop owner確定
- [ ] 低リスク・可逆Experimentを1サイクル実施
- [ ] Result → Evaluation → Candidate → Review → Human Decision
- [ ] Accepted Learning → MLP Polish / Next Hypothesisへ返却

## Multi-perspective review

Product / Agent Architecture / Safety / Data & Privacy / Experimentation / QA & Eval / Delivery の7視点でレビュー済み。

Reviewで解消したBlocker:

- Metric definitionとObservabilityの混同
- Pilot template / readiness schema不整合
- Readiness validatorの現状態ハードコード
- Synthetic Contract E2E / runtime E2Eの表現混同

# Iteration 4.6 — Pilot Telemetry Foundation ✅

Tracking: #31 / PR #34  
Product instrumentation: #33  
Design: [`telemetry-foundation.md`](./telemetry-foundation.md)  
Review: [`telemetry-foundation-review-record.md`](./telemetry-foundation-review-record.md)

## Why this iteration exists

#30でManual Real PilotがBlockedになった主因の1つは、Event Taxonomyが論理定義だけで、実装可能なTelemetry Contract / Sink / aggregationが無いこと。

Telemetry FoundationとProduct instrumentationを分離し、FoundationだけでMetricを`observable`へしない。

## Plan review / changes

1. FoundationだけでMetricをobservableへしない
2. Vendor SDKを先に入れない
3. `reading_flow_id = reading-flow_<random-uuid-v4>`を追加
4. aggregation `computed | not_computable` と registry observabilityを分離
5. `anonymous_visitor_id = null`固定
6. duplicate / orphan / out-of-order / dimension mismatchをData Qualityとして保持
7. canonical timestampを固定
8. Helpful Feedbackをcompleted flowへ相関

Completed:

- [x] typed Event Contract / strict allowlist
- [x] canonical timestamp / UUID v4 validation
- [x] Reading Flow correlation
- [x] Reading Flow Completion / Helpful Feedback Rate aggregation
- [x] Data Quality traceability
- [x] Observability promotion assessment
- [x] random session / flow ID
- [x] Sink port + InMemory sink
- [x] PII / raw consultation / prompt / response禁止
- [x] Review record / 7視点レビュー / CI
- [x] PR #34 squash merge (`69dcb75`)
- [x] Issue #31 close

# Iteration 4.7 — Reading Vertical Slice + Product Instrumentation ✅

Tracking: #33 / PR #35  
Design: [`reading-vertical-slice.md`](./reading-vertical-slice.md)  
Review: [`reading-vertical-slice-review-record.md`](./reading-vertical-slice-review-record.md)

## Experience Hypothesis

> 迷いを抱えたユーザーが、短い1枚のリフレクションReadingを終えたとき、未来を断定されるのではなく、今の気持ちが少し整理され、今日できる一歩を1つ持ち帰れる。

## Plan review / changes

1. **External LLMを入れない**
   - Model品質とExperience品質を混ぜない。
2. **Free-text consultationを入れない**
   - MLP仮説に不要なSensitive dataを先に収集しない。
3. **1枚Reflection Readingに限定**
   - テーマ → draw → interpretation → question → today action → feedback。
4. **Deterministic fact / versioned interpretationを分離**
   - random UUID v4 `reading_flow_id`をseedにcardを決定。
5. **Telemetryを実Product Flowへ接続**
   - started / completed / feedbackをsame flowでemit。
6. **`reading_type: reflection`を正式dimension化**
7. **Browser session-local Evidenceを導入**
   - `browser-session-storage:v1`
   - operational Evidence sourceとは扱わない。
8. **Metric Observabilityはpartialまで**
   - `partial != observable`。
9. **Telemetry failureはUser Valueを止めない**
10. **Feedback理由を推測しない**
    - userが理由を入力していないため`feedback_reason_category = none`。

## Completed deliverables

### Product / Domain

- [x] Reflection Card domain
- [x] deterministic card selection
- [x] 3 contexts: 今の自分 / 仕事 / 人間関係
- [x] versioned interpretation / reflection question / today action
- [x] all copy Message Guardrail regression

### UI

- [x] Entry / theme selection
- [x] Reading Start / draw ritual
- [x] Result / reflection question
- [x] actionable next step
- [x] feedback UI
- [x] theme re-selection / another reading
- [x] mobile feedback layout

### Telemetry

- [x] browser session ID lifecycle
- [x] invalid session rotation + stale event clearing
- [x] sessionStorage sink
- [x] `reading_started`
- [x] `reading_completed`
- [x] `reading_feedback_submitted`
- [x] same `reading_flow_id` correlation
- [x] pure Reflection telemetry event factories
- [x] Registry target / guardrail => `partial`
- [x] Pilot readiness remains `blocked`

### Review / QA

- [x] Experience Hypothesis / MLP boundary doc
- [x] Lovability proxy review
- [x] Product / UX / Architecture / Privacy / Safety / Analytics / QA review
- [x] Review blockers反映
- [x] final-head CI required before merge

## Review blockers resolved

- Telemetry failureがReadingを止め得る
- invalid session rotationでstale Evidenceが混在し得る
- helpfulnessからfeedback理由を推測
- UIがTelemetry payloadを直接構築
- relationship文脈で「手放す」が強い示唆になり得る
- theme誤選択から戻れない
- mobileでfeedbackが3列固定
- Event Taxonomyの不要な圧縮

## Boundary after #33

このIterationで証明したもの:

- Vertical Slice implementation
- session-local Product instrumentation
- target / guardrail Metric `partial`

まだ証明していないもの:

- actual Lovability
- Retention
- central operational Evidence
- MLP Release readiness
- Manual Real Pilot

# Iteration 4.8 — Operational Evidence Source 🚧

Tracking: #15 / #39 / #44 / #46

Completed:

- [x] Phase A: runtime/storage/privacy Decision Gate — PR #43
- [x] Phase B: provider-neutral server ingestion core — PR #45

Phase C / PR #48:

- [x] PostgreSQL / `DATABASE_URL` adapter
- [x] minimized Evidence schema / migration / rollback
- [x] bounded `POST /api/telemetry`
- [x] query/export by server `ingested_at`
- [x] duplicate Evidence preservation / existing Metric reproduction
- [x] 30-day retention implementation / runbook
- [x] PostgreSQL 16 integration CI
- [ ] 7-view final review
- [ ] final CI / merge

Phase C completion still does **not** mean operational readiness. Managed resource provisioning, environment separation,
production abuse/cost control, provider Privacy review, shared-surface E2E, and Product network wiring remain later gates.

Current invariant:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
Operational Evidence: blocked
Manual Real Pilot: blocked
Controlled Autonomy: blocked
```

# Next — Evidence + User Observation 🔒

順序:

```text
Phase D managed runtime / PostgreSQL provisioning
  ↓
Phase E environment separation / abuse control / shared-surface E2E
  ↓
Product central telemetry wiring
  ↓
Metric observable再評価
  ↓
Actual User Observation
  ↓
Polish Loop
  ↓
Metric observable再評価
  ↓
Manual Real Pilot
  ↓
Controlled Autonomy
```

Operational Evidence source導入では、retention / deletion / access control / destinationをPrivacy reviewする。

# Iteration 5 — Controlled Autonomy 🔒 blocked

Entry gate:

- Manual Real Pilotを1サイクル完了
- Evidence / Metric / provenance欠損なし
- Safety / Privacy incident 0
- Human bottleneck観測済み
- Accepted Learning → MLP return pathを実運用で確認
- 自律化候補を7視点レビューで限定

現時点の**candidate only**:

- Contract validation
- Metric ref resolution
- fixture / regression execution
- report formatting
- Evidence ref existence check
- 将来の定期集計

Human Gate維持:

- Experiment start / stop
- 本番投稿 / CRM送信
- price / charge
- High-stakes content / reading
- Accepted Learning
- Safety Policy変更

# Iteration 6 — Orchestration 🔒

Entry criteria:

- 主要Agent Contract安定
- Skill Eval存在
- Closed Learning Loop実運用
- Controlled Autonomy範囲の実測検証
- Decision Queue実運用
- 監査ログ / Stop condition / rollback検証済み

Orchestratorは `Signal → Priority → Agent/Skill Routing` に限定する。

## Dependency map

```text
Foundation
  ↓
Observe
  ↓
Assist
  ↓
Closed Learning Loop
  ↓
Operational Readiness
  ↓
Telemetry Foundation
  ↓
Reading Vertical Slice + Product Instrumentation
  ↓
Operational Evidence Source / Shared Test Surface
  ↓
User Observation / Polish Loop
  ↓
Manual Real Pilot
  ↓
Controlled Autonomy
  ↓
Orchestration
```

後段から先に導入しない。

## Rollback strategy

- Domain / Adapter / Agent / Skill / Eval / Workflow単位でrevert可能
- 外部サービス接続前は本番副作用なし
- 自律化単位ごとに停止可能
