# Closed Loop Operational Pilot — Multi-perspective Review Record

Tracking: #30 / PR #32

Iteration 4.5 Operational Pilot readinessを、Product / Agent Architecture / Safety / Data & Privacy / Experimentation / QA & Eval / Delivery の7視点でレビューした記録。

## Review conclusion

**Approved with changes. All blocking findings found during review were corrected.**

このIterationで確認できたのは、Closed Learning Loopの**Contract E2E rehearsal**とManual Real PilotのReadiness判定である。Agent/Skill runtime E2E、実Telemetry、実ユーザーPilotの安定性は未検証であり、Controlled Autonomyへは進めない。

## 1. Product / MLP review

### Finding

Synthetic rehearsalが通ること自体を成果にすると、Product learningやLovability / Retention改善と混同する。

### Fix / decision

- Synthetic結果をProduct Accepted Learningへ昇格しない。
- Human Decisionで明示的にrejectするpositive synthetic caseを固定。
- Real PilotでAccepted Learningが得られるまで、MLP Polish / Next Experience Hypothesisへの実運用return pathは「未検証」とする。
- Iteration 5のEntry GateにReal Pilot Evidenceを残す。

Status: Resolved for Iteration 4.5.

## 2. Agent Architecture review

### Finding A — Contract E2E vs runtime E2E

Synthetic JSONは状態遷移とArtifact provenanceを検証するが、実際にMaker / Evaluator / Reviewer Agentをruntimeで連鎖実行していない。

### Fix

- 文書・template・validatorで「Contract E2E rehearsal」と明記。
- runtime E2Eと表現しない。
- Candidate Maker / Learning Reviewer独立性はArtifact Contractとして固定する。

### Finding B — Template / readiness schema mismatch

Readiness JSONには`execution_surface_available`があったが、Pilot Run templateに同フィールドが無く、正本間で不整合だった。

### Fix

- Pilot Run templateへ`execution_surface_available`を追加。
- `deployment_or_test_surface_ref`との両方をReal Pilot ready条件にした。

Status: Resolved.

## 3. Safety review

### Confirmation

- 最初のManual Pilotは`risk: low`のみ。
- pricing / charge / high-stakes / fear / vulnerability targetingは対象外。
- Synthetic safety-blocked caseではBusiness metric改善をSafety violationで上書きしない。
- Safety-blocked resultからLearning Candidateを作らない。
- Experiment start / stop / Accepted LearningのHuman Gateを維持。

Residual:

実ユーザーSafety incident率はReal Pilot未実施のため未検証。

Status: Approved for current scope.

## 4. Data & Privacy review

### Finding — definition statusと実測能力の混同

Metric Registryの`status: active`だけではMetric定義が有効なことしか示さず、Analytics sender / ingestion / Evidence sourceの存在を保証しない。

### Fix

Metric Registryへ以下を追加した。

```yaml
observability_status: uninstrumented | partial | observable
required_events: []
evidence_source_ref: string | null
```

- 現在の全Metricを実態に合わせて`uninstrumented`とした。
- `observable`へ昇格するにはEvidence source refを要求。
- Real Pilotはtarget / guardrail双方がobservableであることを要求。
- 最初のTelemetryはsession-levelへ限定し、cross-session identityは導入しない。
- Raw consultation / PII / raw prompt / raw model responseを収集しない方針を#31へ固定。

Status: Resolved. Real telemetry implementation remains #31.

## 5. Experimentation review

### Finding — readiness validatorが現在状態をハードコード

初期validatorは「今はblocked」を直接assertしており、#31解消後に同じReadiness Contractを再利用できなかった。

### Fix

Real Pilot readinessを以下から導出するよう変更。

- target / guardrail Metricがobservable
- operational Evidence source + refs
- execution surface + surface ref
- sample/duration rule
- stop conditions / rollback
- blocking dependency = 0

導出結果とArtifactの`readiness_status`が一致することをCIで検証する。

Current result:

**Manual Real Pilot = BLOCKED**

Blocking:
- #31 telemetry / Evidence source
- #15 deployment / shared test surface

Status: Resolved. Real experiment remains intentionally not started.

## 6. QA / Eval review

### Added regression / validation

`npm run eval:contracts` で以下を検証する。

1. Existing AI fixture contracts
2. Metric Registry definition + observability metadata
3. Operational Pilot Contract E2E rehearsal + Real Pilot readiness

Pilot validatorで固定:

- positive Contract path
- safety-blocked Contract path
- Human start decision
- synthetic Evidence namespace
- Candidate provenance
- reviewer != Candidate Maker
- Synthetic Accepted Learning禁止
- Metric observabilityとReadiness Artifactの一致
- prerequisites不足時にexecution/result/learningを作らない

Residual risk:

- Model output assertion runner未実装
- Agent/Skill runtime E2E runner未実装
- live Analytics validation未実装

これらをSynthetic Contract成功と混同しないことを文書化した。

Status: Approved for Iteration 4.5.

## 7. Delivery / DX review

### Confirmation

- Product runtime / DB / external APIには変更なし。
- 変更はContract / validator / docs / package script中心でrevert容易。
- Production side effectなし。
- Real Pilot blockerを#31 / #15へ分離し、Issue #30を無限に保持しない。
- Controlled Autonomyを先行導入しない。

Status: Approved.

## Autonomy classification after review

### Candidate only — Real Pilot後に再評価

- Contract validation
- Metric ref resolution
- fixture / regression execution
- report formatting
- Evidence ref existence check

### Keep human-controlled

- Experiment start / stop
- External publish / send
- price / charge
- High-stakes content / reading
- Accepted Learning
- Safety Policy変更
- Orchestrator導入判断

## Residual risks / next dependencies

1. #31: privacy-safe session telemetry / operational Evidence source
2. #15: production / shared test surface
3. Manual Real Pilot未実施
4. Human decision wait time / Evidence準備コスト未実測
5. Accepted Learning → MLP return pathの実運用未検証
6. Agent/Skill runtime E2E未実装

これらはIteration 5へのEntry Evidenceであり、Iteration 4.5内で事実を捏造して解消しない。

## Final checklist

- [x] Product / MLP境界
- [x] Contract E2E / runtime E2E境界
- [x] Pilot template / readiness schema整合
- [x] Safety failure path
- [x] Definition / Observability分離
- [x] Privacy boundary
- [x] Readinessのルール導出
- [x] Synthetic / readiness machine validation
- [x] Blocking dependencies分離
- [x] Controlled Autonomyを停止
- [x] Reviewed technical head CI Green
- [ ] Review recordを含むfinal head CI Green
- [ ] Final diff / unresolved threads確認

Review recordを含むfinal headでCI Greenかつ未解決thread 0なら、Iteration 4.5 Operational Readinessは完了可能。
