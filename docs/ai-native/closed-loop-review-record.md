# Closed Learning Loop — Multi-perspective Review Record

Tracking: #26 / PR #29

Iteration 4を Product / MLP、Agent Architecture、Safety、Data / Analytics、Privacy、QA / Eval、Delivery の7視点でレビューした記録。

## Conclusion

**Approved with changes. All findings resolved.**

Proposal → Execution → Evaluation → Learningの境界を厳密にレビューし、4点のContract gapを修正した。

## 1. Product / MLP — Resolved

Experiment数自体を成果にせず、Accepted LearningをExperience Hypothesis / Vertical Slice / Lovability Review / Polish Loop / Retention Validationへ戻す。negative / inconclusiveも次の判断材料として保持する。

## 2. Agent Architecture — Resolved

- `maker` / `evaluator`を明示し、`evaluator != maker`をSkill / fixture / validatorで必須化
- `prepare-learning-candidate`をEvaluator Outputの`facts[].evidence_refs`へ整合
- AIはLearning Candidateまで。Accepted Learningへ自己昇格しない

## 3. Safety — Resolved

- 全承認済みExperiment fixtureに1つ以上のguardrailを要求
- target改善 + guardrail悪化では`adopt`禁止
- Safety stopは`stopped`。target改善していてもadopt不可

## 4. Data / Analytics — Resolved

Execution Receiptに以下を必須化:

- executed_at
- execution_scope
- implementation_ref
- actual_change
- deviations_from_proposal
- stop condition / reason

Metric Contract / baseline / sample / window不足では`inconclusive`。confounderがある場合は`causal_claim_allowed=false`を維持する。

## 5. Privacy — Resolved for current scope

Execution Receipt / EvidenceへRaw相談・PII・secretsを入れない。fixtureはSyntheticのみ。実データ接続時のretention / access control / deletionは後続レビュー対象。

## 6. QA / Eval — Resolved

Experiment fixture 7ケース:

1. target改善 + guardrail維持
2. target改善 + guardrail悪化
3. negative result
4. small sample / inconclusive
5. missing Metric Contract / baseline
6. Safety stop
7. confounder / correlation != causation

ValidatorでHuman approval、evaluator independence、Execution Receipt、Evidence、Metric refs、guardrail必須、negative/stopped保持、causal boundaryを固定した。

Model output assertion runnerはHarness確定後に追加する。

## 7. Delivery — Resolved

外部SDK / DB / production action追加なし。Markdown Contract / Skill / Workflow / Synthetic fixture / validatorのみ。本番Experiment実行はHuman-onlyで、PR単位でrevert可能。

## Residual risks

次Iteration以降へ意図的に残す。

1. Model output assertion runner
2. Real Analytics / Experiment data connector
3. Identifier lifecycle / access controls
4. Automated execution receipt ingestion
5. Controlled Autonomy
6. Orchestrator

## Final review checklist

- [x] MLP feedback loop
- [x] Maker / Evaluator separation
- [x] Human execution boundary
- [x] Guardrail-aware decision
- [x] Execution Receipt fidelity
- [x] Metric Contract fidelity
- [x] Causal claim boundary
- [x] Negative / inconclusive / stopped preservation
- [x] Learning Candidate self-promotion prohibited
- [x] Privacy scope
- [x] Regression fixture / validator
- [x] Latest CI Green: npm ci / lint / typecheck / test / AI eval contracts / build
- [x] Final PR diff review: 11 files, runtime source / DB / dependency changesなし

**Iteration 4はmerge可能。**
