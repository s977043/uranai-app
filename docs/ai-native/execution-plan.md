# AI-Native Execution Plan

Tracking: #18, #20, #23, #27, #30, #31

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
- Iteration 4.5 Operational Pilot: Issue #30 / PR #32 — 実装・7視点レビュー完了、final validation中
- Pilot telemetry foundation: Issue #31 — Real PilotのBlocking dependency
- Deployment / shared test surface: Issue #15 — 判断待ち
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

# Iteration 4.5 — Closed Loop Operational Pilot 🚧 final validation

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

Unblocker:

- #31: privacy-safe session telemetry
- #15: deployment / test surface

## Phase C — Manual Real Pilot 🔒 not started

- [ ] target Metricが`observable`
- [ ] guardrail Metricが1つ以上`observable`
- [ ] Evidence source operational
- [ ] execution surface available
- [ ] Human start / stop owner確定
- [ ] 低リスク・可逆Experimentを1サイクル実施
- [ ] Result → Evaluation → Candidate → Review → Human Decision
- [ ] Accepted Learning → MLP Polish / Next Hypothesisへ返却

**#31 / #15の条件成立まで開始しない。**

## Multi-perspective review

Product / Agent Architecture / Safety / Data & Privacy / Experimentation / QA & Eval / Delivery の7視点でレビュー済み。

Reviewで解消したBlocker:

- Metric definitionとObservabilityの混同
- Pilot template / readiness schema不整合
- Readiness validatorの現状態ハードコード
- Synthetic Contract E2E / runtime E2Eの表現混同

Residual riskはReview Recordに記録し、Iteration 5 Entry Evidenceとして残す。

## Iteration 4.5 Definition of Done

Issue #30はOperational Readiness評価のIterationとして完了可能。

- [x] Synthetic positive + safety failure pathをMachine-readable Contract化
- [x] Pilot Runbook / Template
- [x] Real Pilot readinessを評価可能
- [x] Blocking dependencyをIssue分離
- [x] Controlled Autonomy候補 / Human-only候補を明示
- [x] Reviewed technical head CI Green
- [x] タスク完了前の7視点レビュー
- [x] Review blocker反映
- [ ] Review recordを含むfinal head CI Green
- [ ] Final diff / unresolved thread 0
- [ ] PR merge / Issue #30 close

Real Pilotそのものは#31 / #15解消後に実施し、**Iteration 5のEntry Evidence**として扱う。

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
Pilot Telemetry / Real Pilot
  ↓
Controlled Autonomy
  ↓
Orchestration
```

後段から先に導入しない。

## Rollback strategy

- Agent / Skill / Eval / Workflow単位でrevert可能
- 外部サービス接続前は本番副作用なし
- 自律化単位ごとに停止可能
