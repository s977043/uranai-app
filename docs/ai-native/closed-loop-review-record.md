# Closed Learning Loop — Multi-perspective Review Record

Tracking: #27 / PR #28

Iteration 4 Closed Learning Loopを、Product / Agent Architecture / Safety / Data & Privacy / Experimentation / QA & Eval / Delivery の7視点でレビューした記録。

## Review conclusion

**Approved with changes. All review blockers are reflected.**

当初案の方向性は妥当だったが、Closed Loopとして長期運用するにはMetric参照の安定性、Learning Candidateのprovenance、Experiment execution statusと分析validityの分離が不足していたため修正した。

---

## 1. Product / MLP review

### Finding

Accepted LearningをKnowledgeへ保存すること自体が成果になると、Product側のExperience Hypothesis / Lovability / Retention改善へ戻らず、知識蓄積だけが増える。

### Fix

- Closed Loopの終点をKnowledgeではなく `Next Experience Hypothesis / MLP Polish` に変更
- Learning Candidate / Accepted Learningに `recommended_next_use` / `next_use` を持たせる
- AI-Native README / Execution PlanへMLP return pathを明示

### Status

Resolved.

---

## 2. Agent Architecture review

### Finding A — Evaluator / Reviewer self-approval risk

Experiment EvaluatorがLearning Candidateを生成し、そのまま自分でレビューするとMaker/Checker分離が壊れる。

### Fix

- EvaluatorとLearning Reviewerを別責務に分離
- Learning ReviewerをReviewer-only Agentとして追加
- Accepted Learning確定はHumanのみ

### Finding B — Candidate maker identity ambiguity

`maker_id` がExperiment proposal makerなのかLearning Candidateを生成したEvaluatorなのか曖昧で、独立性Contractとして弱かった。

さらにReviewer入力側へmaker IDを別フィールドで渡す方式では、Candidate本体のprovenanceと食い違う余地があった。

### Fix

- Learning Candidate自身の `candidate_maker_id` をprovenanceの唯一の正本に変更
- `source_evaluation_refs` をCandidate Contractへ追加
- Reviewerは `candidate.candidate_maker_id` を参照
- `reviewer_id != candidate.candidate_maker_id` をSkill / Agent / fixture / validatorで固定
- `source_evaluation_refs` が実際のsource evaluationへ解決することをvalidatorで確認

### Status

Resolved.

---

## 3. Safety review

### Finding

Target metricが改善した場合、Safety/Trust guardrail悪化が副作用として扱われ、Business successに上書きされる危険がある。

### Fix

- target改善 + Safety/Trust悪化は `mixed` / `safety_blocked`
- Safetyで停止したExperimentからLearning Candidateを生成しないfixtureを追加
- Human rubricにOutcome integrityをBlockerとして追加
- Safety violationはBusiness metricで上書き不可とWorkflow/Skillへ明記

### Status

Resolved.

---

## 4. Data / Privacy / Contract review

### Finding A — unstable Metric references

初期fixtureではMarkdown見出しanchorを`metric_definition_ref`として使っていた。見出し変更に弱く、実際にanchor表記と参照文字列が一致しないケースがあった。

また既存Growth fixtureには正式Metric Contractが無い`followup_action_rate` / `high_price_conversion`等を「定義済み」のように参照するケースがあった。

### Fix

- `ai/contracts/metric-registry.json` をMachine-readableなMetric参照正本として追加
- `metric:<stable-id>` をstable refとして採用
- Growth / Experiment fixturesをactive Registry Metricへ整理
- `validate-metric-registry.mjs` でfixture内の全`metric_definition_ref`をRegistryへ解決
- `provisional` Metricは通常fixtureから利用不可

### Finding B — Raw data retention

Result / Learningに相談本文やPIIを残すと、長期Learning資産へセンシティブデータが混入する。

### Fix

- Resultは集約Metric + Evidence ref中心
- Raw PII / consultation textは禁止
- Synthetic fixtureのみGitへ保存

### Status

Resolved for Iteration 4 scope.

---

## 5. Experimentation review

### Finding — execution status vs evaluation validity

Experiment Result templateではsample rule未達を`invalid`と読める一方、Evaluator Contractではsample不足を`limited / inconclusive`としており、状態定義が矛盾していた。

### Fix

実行状態と分析上の妥当性を分離した。

```text
Experiment Result status:
completed | stopped | invalid

Evaluation validity:
valid | limited | invalid
```

- 実行が終了してもsample不足なら`limited / inconclusive`
- Metric変更やcomparison崩壊など比較不能の場合は`invalid`
- `completed`をsuccessの意味で使用しない
- sample rule未達をlimitationsへ必須記録

### Status

Resolved.

---

## 6. QA / Eval review

### Confirmation / Fix

Closed Loop regressionを追加。

- Experiment Evaluation: 6+
- Learning Review: 6+

Contract validatorで次を固定。

- Human-approved execution
- Result Evidence refs / hypothesis ref
- Metric ref存在
- Safety degradation block
- insufficient sample / conflicting segment
- invalid experiment source reject
- Candidate Evidence refs / source evaluations / provenance
- `reviewer_id != candidate.candidate_maker_id`
- source evaluation ref解決
- safe candidateでもHuman Gate

さらにMetric Registry専用validatorを追加し、`npm run eval:contracts`でFixture ContractとMetric Registry Contractの両方を検証する。

Residual risk:
- Model output assertion runnerはModel/Harness確定後。現在はfixture contract validation + Human rubric。

### Status

Resolved for Iteration 4.

---

## 7. Delivery / DX review

### Confirmation

- 外部SNS / CRM / Price / Charge接続なし
- 実Analytics SDK / DB migrationなし
- Agent/Skill/Workflow/fixture/docs中心でrevert容易
- `eval:contracts`へMetric Registry validatorを追加
- PR #28は最新mainをbaseとしてmergeable
- reviewed implementation headで `npm ci / lint / typecheck / test / AI eval contracts / build` Green
- unresolved review thread 0

### Status

Resolved.

---

## Residual risks / next iteration

Iteration 4では意図的に残す。

1. Model output assertion runner未実装
2. 実Analytics SDK / real user data ingestion未実装
3. Experiment execution自動化なし
4. Accepted Learning自動確定なし
5. SNS / CRM / Price / Charge外部Action未接続
6. Orchestrator未実装

これらはControlled Autonomyへ進む前に、Closed Loopを実運用で検証してから判断する。

## Final checklist

- [x] Product / MLP return path
- [x] Evaluator / Learning Reviewer分離
- [x] Candidate provenance / reviewer independence
- [x] Safety / Guardrail integrity
- [x] Stable Metric Registry
- [x] Data / Privacy境界
- [x] Execution status / Evaluation validity分離
- [x] 12+ Closed Loop fixtures
- [x] Fixture + Metric Registry validators
- [x] Reviewed implementation CI Green
- [x] Final PR diff / unresolved threads確認

**Blocker 0。Iteration 4はmerge可能。**
