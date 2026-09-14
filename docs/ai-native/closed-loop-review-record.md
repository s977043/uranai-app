# Closed Learning Loop — Multi-perspective Review Record

Tracking: #26

Iteration 4を Product / MLP、Agent Architecture、Safety、Data / Analytics、Privacy、QA / Eval、Delivery の7視点でレビューした記録。

## Conclusion

**Approved with changes. Findings resolved before PR completion.**

Closed Loopの方向性は妥当。ただし、Proposal → Execution → Evaluation → Learningの境界を厳密にすると4点のContract gapが見つかったため修正した。

## 1. Product / MLP

### Finding

Experiment数・成功率・学習件数自体が成果になると、MLPのLovability / Retentionより実験量を最適化する危険がある。

### Fix

- Accepted LearningをKnowledge保存だけで終わらせず、Experience Hypothesis / Vertical Slice / Lovability Review / Polish Loop / Retention Validationへ接続
- negative / inconclusiveも次の判断材料として保持
- Experiment数をNorth Starにしない

Status: Resolved.

## 2. Agent Architecture

### Finding A — Evaluator independence

`evaluate-experiment`にはMaker/Evaluator分離のルールがあったが、Input ContractでEvaluator identityを追跡できなかった。

### Fix

- `maker` / `evaluator`を明示
- `evaluator != maker`をSkill / fixture / validatorで必須化
- outputにも`reviewer_is_independent: true`を持たせる

### Finding B — Learning Candidate input mismatch

`prepare-learning-candidate`がトップレベル`evaluation.evidence_refs`を要求していたが、Evaluator Outputは`facts[].evidence_refs`だった。

### Fix

- Candidate SkillをEvaluator Outputに合わせる
- Evidenceは`facts[].evidence_refs`からのみ集約
- 存在しないEvidence refを生成しない

Status: Resolved.

## 3. Safety

### Finding

一部Experiment fixtureでguardrailが空だった。AssistのGrowth Contractはguardrail必須なので、承認済みExperimentとして矛盾していた。

### Fix

- 全Evaluation fixtureに1つ以上のguardrailを要求
- validatorで`observation.guardrails.length > 0`を必須化
- target改善 + guardrail悪化では`adopt`禁止
- Safety stopは`stopped`、target改善していてもadopt不可

Status: Resolved.

## 4. Data / Analytics

### Finding A — Execution Receipt fidelity

Experiment Contractには`execution_scope / implementation_ref / executed_at`があるのに、Evaluation Skill側では欠落していた。これでは予定と実際の変更差を十分追跡できない。

### Fix

Evaluation Skill / fixtures / validatorへ以下を必須化:

- executed_at
- execution_scope
- implementation_ref
- actual_change
- deviations_from_proposal
- stop condition / reason

### Finding B — Causal overclaim

Before/after改善だけで因果を主張する危険。

### Fix

- `causal_claim_allowed`を明示
- confounder / deviation fixtureを追加
- Metric Contract / baseline / sample / window不足では`inconclusive`

Status: Resolved.

## 5. Privacy

### Confirmation

- Execution ReceiptへRaw相談 / PII / secretsを入れない
- fixtureはSyntheticのみ
- Evidenceは参照ID中心
- 実データAnalytics接続はScope out

実データ導入時のretention / access control / deletionは後続レビュー対象。

Status: Resolved for current scope.

## 6. QA / Eval

### Coverage

Experiment fixture 7ケース:

1. target改善 + guardrail維持
2. target改善 + guardrail悪化
3. negative result
4. small sample / inconclusive
5. missing Metric Contract / baseline
6. Safety stop
7. confounder / correlation != causation

Validatorで追加確認:

- Human approval
- evaluator != maker
- Execution Receipt completeness
- Observation Evidence
- Metric Contract refs
- guardrail必須
- negative result保持
- stopped result
- causal boundary

Model output assertion runnerはまだ未実装。Harness確定後に追加する。

Status: Resolved for Iteration 4.

## 7. Delivery

### Confirmation

- 外部SDK / DB / production action追加なし
- Markdown Contract / Skill / Workflow / Synthetic fixture / validatorのみ
- 本番Experiment実行はHuman-only
- PR単位でrevert可能
- Orchestratorを追加しない

Status: Resolved.

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
- [ ] Latest CI Green
- [ ] Final PR diff review

CIと最終差分レビューがGreenならIteration 4はマージ可能。
