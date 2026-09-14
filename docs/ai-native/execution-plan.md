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
- Iteration 4.6 Pilot Telemetry Foundation: Issue #31 / PR #34 — 実装・7視点レビュー・CI完了、merge ready
- Reading Vertical Slice + Product instrumentation: Issue #33 — #31後
- Deployment / shared test surface: Issue #15 — 実ユーザー観察前に判断
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
Telemetry unblocker: #31  
Deployment/test surface: #15  
Review: [`closed-loop-pilot-review-record.md`](./closed-loop-pilot-review-record.md)

## Why this iteration exists

Iteration 5 Controlled AutonomyのEntry条件は、Closed Loopが**実運用で安定**していること。

Iteration 4で証明したのはContract / Eval / Human Gateの設計整合性であり、実Evidence取得・Metric observability・Human待ち時間・Evidence準備コスト・実行/rollback摩擦・MLP return pathは未検証。したがってControlled Autonomyへ直行しない。

## Plan review / changes

1. **Metric definitionとobservabilityを分離**
   - `status: active | provisional` = 定義状態
   - `observability_status: uninstrumented | partial | observable` = 実測能力
   - Real Pilotは両方を要求。
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

### Current result

**BLOCKED — expected and valid readiness result.**

Blocking:

1. Product Analytics event sender / ingestion未実装
2. Pilot対象Metricは`observability_status: uninstrumented`
3. operational Evidence source ref未設定
4. production/shared test surfaceは#15で判断待ち

## Phase C — Manual Real Pilot 🔒 not started

- [ ] target Metricが`observable`
- [ ] guardrail Metricが1つ以上`observable`
- [ ] Evidence source operational
- [ ] execution surface available
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

## Iteration 4.5 Definition of Done

- [x] Synthetic positive + safety failure pathをMachine-readable Contract化
- [x] Pilot Runbook / Template
- [x] Real Pilot readinessを評価可能
- [x] Blocking dependencyをIssue分離
- [x] Controlled Autonomy候補 / Human-only候補を明示
- [x] Final CI Green
- [x] 7視点レビュー / blocker反映
- [x] PR #32 squash merge (`cb6ecef`)
- [x] Issue #30 close

# Iteration 4.6 — Pilot Telemetry Foundation 🚧 merge ready

Tracking: #31 / PR #34  
Product instrumentation: #33  
Shared / production surface: #15  
Design: [`telemetry-foundation.md`](./telemetry-foundation.md)  
Review: [`telemetry-foundation-review-record.md`](./telemetry-foundation-review-record.md)

## Why this iteration exists

#30でManual Real PilotがBlockedになった主因の1つは、Event Taxonomyが論理定義だけで、実装可能なTelemetry Contract / Sink / aggregationが無いこと。

ただし最新mainにはReading Product Flow自体もまだ存在しない。

よって、**Telemetry FoundationとProduct instrumentationを分離**する。

```text
Telemetry Foundation (#31)
  ↓
Reading Vertical Slice + Instrumentation (#33)
  ↓
Operational Evidence Source / Shared Test Surface
  ↓
Manual Real Pilot
```

## Plan review / changes

1. **FoundationだけでMetricをobservableへしない**
   - Product Flow未接続ならRegistryは`uninstrumented`を維持。
2. **Vendor SDKを先に入れない**
   - Domain Contract + Sink portを先に安定化。
3. **Reading Flow correlationを追加**
   - `reading_flow_id = reading-flow_<random-uuid-v4>`
   - session内複数readingを正しく数える。
4. **ComputationとObservabilityを分離**
   - aggregation: `computed | not_computable`
   - registry: `uninstrumented | partial | observable`
5. **Cross-session identityを導入しない**
   - `anonymous_visitor_id = null`固定。
6. **Data Qualityを明示**
   - duplicate / orphan / out-of-order / dimension mismatchを隠さない。
7. **Canonical timestampを固定**
   - `Date.toISOString()`形式のみ受理。
8. **Helpful Feedbackをcompleted flowへ相関**
   - orphan / cross-session / pre-completion feedbackを正常sampleへ入れない。

## Deliverables

### Domain

- [x] typed Event Contract
- [x] strict property allowlist
- [x] canonical timestamp validation
- [x] UUID v4 identifier validation
- [x] Reading Flow correlation
- [x] Reading Flow Completion aggregation
- [x] Helpful Feedback Rate aggregation
- [x] Data Quality signals
- [x] `not_computable`でもData Quality保持
- [x] missing Evidence => `not_computable`
- [x] Observability promotion assessment

### Adapter

- [x] random UUID v4 `anonymous_session_id`
- [x] random UUID v4 `reading_flow_id`
- [x] Telemetry Sink port
- [x] InMemory sink
- [x] validate-before-write

### Privacy / Safety

- [x] unknown property reject
- [x] raw consultation / raw prompt / raw responseをallowしない
- [x] name / email / phone等をallowしない
- [x] cross-session visitor IDをreject
- [x] non-v4 UUIDをreject
- [x] persistence無し
- [x] external Analytics vendor無し

### Docs / integration

- [x] Event Taxonomyへ`reading_flow_id`追加
- [x] `telemetry-foundation.md`
- [x] #33 Reading Vertical Slice dependency分離
- [x] AI-Native README更新
- [x] Execution Plan更新
- [x] Review record
- [x] PR final-head CI Green
- [x] 完了前7視点レビュー
- [x] Review blocker反映
- [ ] merge / #31 close

## Foundation exit criteria

- [x] Event Contract / PII boundary
- [x] session / reading-flow random UUID v4
- [x] Sink port + local/test sink
- [x] flow-level aggregation
- [x] missing Evidence semantics
- [x] Data Quality traceability
- [x] Observability promotion rule testable
- [x] RegistryはProduct未接続のため`uninstrumented`維持
- [x] Final CI Green
- [x] Product / Architecture / Privacy / Safety / Analytics / QA / Delivery review
- [x] Blocker解消

# Reading Vertical Slice + Product Instrumentation 🔒 next

Tracking: #33

MLP Firstに従いCore Experienceを端から端まで通す。

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

Product wiring + operational Evidence source + shared test surface成立後にMetric RegistryのObservabilityを再評価する。

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
Telemetry Foundation (#31)
  ↓
Reading Vertical Slice + Instrumentation (#33)
  ↓
Operational Evidence Source / Shared Test Surface
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
