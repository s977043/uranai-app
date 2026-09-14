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
- Iteration 4.5 Operational Readiness: PR #32 / Issue #30 — 完了
- Iteration 4.6 Pilot Telemetry Foundation: Issue #31 — 実装中
- Reading Vertical Slice + instrumentation: Issue #33 — #31後
- Deployment / shared test surface: Issue #15 — 実ユーザー観察前に判断
- Iteration 5 Controlled Autonomy — Real Pilot Evidence待ち

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

- [x] Content / Growth Draft Maker
- [x] Reading Quality Reviewer
- [x] Draft → Guardrail → Independent Review → Human Gate
- [x] reviewer != maker
- [x] regression fixtures / Metric Contract
- [x] 7視点レビュー / CI / merge

# Iteration 4 — Closed Learning Loop ✅

Tracking: #27 / PR #28

```text
Experiment Proposal
  ↓
Human Approval / Manual Execution
  ↓
Experiment Result
  ↓
Evaluator / Learning Candidate
  ↓
Independent Learning Reviewer
  ↓
Human Gate
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

Established:

- Experiment Result / Learning Candidate Contract
- stable Metric Registry
- Candidate provenance
- Safety / Guardrail integrity
- execution status / evaluation validity分離
- Human-only Accepted Learning
- Closed Loop regression / validators

# Iteration 4.5 — Operational Readiness ✅

Tracking: #30 / PR #32

Confirmed:

- Synthetic Contract E2EはCI検証可能
- runtime E2E / live Analytics / Real Pilotは未検証
- Metric definitionとobservabilityを分離
- Readinessを`ready | blocked`で機械判定
- Manual Real PilotはTelemetry / Evidence / surface不足のためBlocked
- Controlled Autonomyへ進まない

Review: [`closed-loop-pilot-review-record.md`](./closed-loop-pilot-review-record.md)

# Iteration 4.6 — Pilot Telemetry Foundation 🚧

Tracking: #31  
Product integration: #33  
Shared test surface: #15

## Goal

Manual Real Pilotに必要なTelemetryを、外部Vendorへ先に結合せず、**privacy-safe / session-level / testable**なContractとして実装する。

## Plan review / changes

実装前レビューで当初計画を変更した。

### 1. Telemetry FoundationとProduct Instrumentationを分離

最新mainはNext.js初期画面で、Reading Flow自体がまだ無い。

したがって:

```text
Telemetry Foundation   #31
  ↓
Reading Vertical Slice + instrumentation   #33
  ↓
Operational Evidence source / shared surface
  ↓
Manual Real Pilot
```

FoundationだけでMetric Registryを`observable`へ変更しない。

### 2. Vendor SDKを先に導入しない

GA4 / PostHog等へ直接結合せず、Domain Contract + Sink portを先に安定させる。

### 3. Reading Flow correlationを追加

`Reading Flow Completion`はflow数を数えるため、session IDだけでは同一session内の複数readingを区別できない。

`reading_started` / `reading_completed` / `reading_feedback_submitted` に:

```text
reading_flow_id = reading-flow_<random-uuid>
```

を追加する。

これはuser identityではなく、1回のReading Flowだけに使うcorrelation key。

### 4. ComputationとObservabilityを分離

```yaml
aggregation_status: computed | not_computable
registry_observability: uninstrumented | partial | observable
```

Synthetic / local eventを計算できても、本番Metricがobservableとは扱わない。

### 5. Cross-session identityを導入しない

#31では`anonymous_visitor_id = null`固定。

## Deliverables

### Domain

- [x] typed event contract
- [x] strict property allowlist / schema validation
- [x] Reading Flow correlation contract
- [x] Reading Flow Completion aggregation
- [x] Helpful Feedback aggregation
- [x] duplicate / orphan / out-of-order quality signal
- [x] missing Evidence => `not_computable`
- [x] Metric observability assessment

### Adapter

- [x] random `anonymous_session_id`
- [x] random `reading_flow_id`
- [x] Telemetry Sink port
- [x] In-memory Sink for test/local rehearsal

### Privacy / Safety

- [x] Raw consultationをpropertyへ追加不可
- [x] name / email / phone等の未知propertyをreject
- [x] raw prompt / raw responseをreject
- [x] cross-session visitor IDをreject
- [x] external vendor / persistence無し

### Docs / integration

- [x] Event Taxonomyへ`reading_flow_id`追加
- [x] [`telemetry-foundation.md`](./telemetry-foundation.md)
- [x] Reading Vertical Slice dependency #33を分離
- [ ] AI-Native README更新
- [ ] Review record
- [ ] PR / CI
- [ ] 完了前7視点レビュー
- [ ] Review blocker反映
- [ ] merge / #31 close

## Foundation exit criteria

- [x] Event Contract / PII boundary
- [x] session / reading flow random ID
- [x] Sink port + in-memory Evidence source
- [x] Flow-level aggregation
- [x] missing Evidence semantics
- [x] observable promotion ruleがテスト可能
- [x] RegistryはProduct未接続のため`uninstrumented`を維持
- [ ] CI Green
- [ ] Product / Architecture / Privacy / Safety / Analytics / QA / Deliveryレビュー
- [ ] Blocker解消

## Scope out

- Reading UI / Core Experience
- production Analytics vendor
- persistent Evidence store
- cross-session identity
- D1 / D7 / Repeat Reading
- Retention tracking
- pricing / charge
- external automation

# Reading Vertical Slice + Product Instrumentation 🔒 next

Tracking: #33

MLP Firstに従い、Core Experienceを端から端まで通す。

```text
Entry
  ↓
Reading Start
  ↓
Fortune Fact / Interpretation
  ↓
Result
  ↓
Actionable Next Step
  ↓
Feedback
```

Telemetry:

- `reading_started`
- `reading_completed`
- `reading_feedback_submitted`

# Manual Real Pilot 🔒

Entry criteria:

- #31 Telemetry Foundation complete
- #33 Product instrumentation complete
- target Metric `observable`
- guardrail Metric >= 1 `observable`
- Evidence source operational
- shared / production test surface available
- low-risk reversible Experiment
- Human start / stop owner

Manual Real Pilotを1サイクル通すまではIteration 5へ進まない。

# Iteration 5 — Controlled Autonomy 🔒 blocked

Entry gate:

- Manual Real Pilot完了
- Evidence / Metric / provenance欠損なし
- Safety / Privacy incident 0
- Human bottleneck観測済み
- Accepted Learning → MLP return path実運用確認
- 自律化候補を7視点レビューで限定

Candidate only:

- Contract validation
- Metric ref resolution
- regression execution
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

- major Agent Contract stable
- Skill Eval存在
- Real Closed Learning Loop運用
- Controlled Autonomy実測検証
- Decision Queue実運用
- Audit / Stop / rollback検証

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
Telemetry Foundation (#31)
  ↓
Reading Vertical Slice + Instrumentation (#33)
  ↓
Shared Test Surface / Evidence Source
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
- External service接続前は本番副作用なし
- 自律化単位ごとに停止可能
