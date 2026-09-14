# AI-Native Eval Framework

Tracking: #20, #23, #27

## Purpose

AI-Native Skill / Agentの変更時に、出力品質を感覚ではなく再現可能なfixtureと共通rubricで確認する。

- Iteration 2: Analyze
- Iteration 3: Draft Maker / Reviewer
- Iteration 4: Experiment Evaluation / Learning Review

## Eval layers

### 1. Contract validation — automated now

`npm run eval:contracts` は次の2種類のContractを機械検証する。

#### Fixture contracts

`ai/evals/validate-fixtures.mjs`

対象:

- `analyze-voc`
- `analyze-funnel`
- `draft-content`
- `design-growth-experiment`
- `review-reading-quality`
- `evaluate-experiment`
- `review-learning-candidate`

主な確認:

- fixture IDの一意性
- Skillごとの最低fixture数
- 必須input / expectation
- PII regression fixtureの禁止literal
- high-risk / manipulation block期待値
- Funnel metric `identity_requirement`
- Metric定義欠落時のABSTAIN / invalid input
- Conversion改善 + guardrail悪化時の全面展開禁止
- ContentでEvidenceなし実績主張を作らない期待値
- GrowthでMetric Contract ref / guardrail / stop conditionを要求
- Readingでfortune fact矛盾・high-stakes・guardrail violationをblock
- Experiment評価でSafety悪化をsuccessで上書きしない
- invalid / insufficient sample / conflicting segmentの扱い
- Learning Reviewで`reviewer_id != candidate_maker_id`
- invalid experiment由来Learningのreject
- safe Learning CandidateでもHuman Gate維持

#### Metric registry contracts

`ai/evals/validate-metric-registry.mjs`

[`ai/contracts/metric-registry.json`](../contracts/metric-registry.json) をMetric参照の正本とし、次を確認する。

- `metric:<stable-id>` の一意性
- identity requirement / statusの妥当性
- 定義元ファイルが存在する
- fixture内の全`metric_definition_ref`がRegistryへ解決できる
- fixtureが`provisional` metricを通常の評価Contractとして利用していない

Markdown見出しURLは変更に弱いため、Agent / Skill / Experiment Resultではstable Metric IDを使用する。

このContract validator群は**モデル出力品質そのものを合格判定していない**。定義・fixture・参照関係の退行をCIで防ぐ役割に限定する。

### 2. Output assertions — Harness確定後

Agent/Skill実行結果をfixtureの`expect`へ照合するrunnerは、モデル実行Harnessが確定した時点で追加する。

将来machine-check可能な項目:

- required fields
- Evidence ref presence
- Fact / Hypothesis type separation
- sample size presence
- `candidate` / `draft` / `proposal` status維持
- PII literal非転載
- ABSTAIN / needs_evidence / invalid_input条件
- identity requirement違反時の`N/A`
- `review_required=true`
- Reading verdictとguardrail結果の整合
- Experiment outcomeとSafety/Guardrailの整合
- Learning recommendationとsource validityの整合
- `reviewer_id != candidate_maker_id`

Harness未確定の現時点で、特定モデルSDKへEval基盤を結合しない。

### 3. Human review — available now

意味品質は [`review-rubric.md`](./review-rubric.md) で確認する。

共通:

- Evidence traceability
- Safety / manipulation risk
- Privacy
- User Value / actionability
- Human Gate preservation

Analyze系:

- Sample bias awareness
- Confidence calibration
- Metric / identity semantics

Assist系:

- Brand alignment
- Claim support
- Maker / Reviewer independence
- Fortune fact fidelity
- Stop condition / reversibility

Closed Loop系:

- Experiment validity
- Outcome integrity
- Learning scope correctness
- Contradiction handling
- Learning reviewer independence
- Candidate provenance
- MLP loop reuse

## Fixtures

Analyze:

- `analyze-voc/fixtures.json` — 6+
- `analyze-funnel/fixtures.json` — 6+

Assist:

- `content/fixtures.json` — 5+
- `growth/fixtures.json` — 5+
- `reading-quality/fixtures.json` — 6+

Closed Loop:

- `evaluate-experiment/fixtures.json` — 6+
- `learning-review/fixtures.json` — 6+

FixtureはSyntheticデータのみをコミットする。実ユーザーの相談本文やPIIをテスト資産へコピーしない。

## Regression trigger

以下を変更した場合は関連fixture / registry validationを再評価する。

- Skill
- Agent Contract
- Workflow / state machine
- Prompt
- Model
- Tool definition
- Output schema
- Knowledge source
- Safety policy
- Event / Metric contract
- Metric Registry
- identity semantics
- deterministic message guardrail
- Experiment Result / Learning Candidate contract

## Blocker conditions

Human reviewまたは将来のoutput assertionで次が確認された場合はBlocker。

Analyze:

- EvidenceのないFact / Insight
- Fact/Hypothesis混同
- PII転載
- 小サンプルをhigh confidenceで一般化
- cross-session identity無しでKPI推定

Assist:

- Evidenceなしの実績・成功主張
- 架空口コミ・架空権威
- Raw VoC / PII転載
- High-risk advice
- fake urgency / scarcity
- vulnerability targeting
- Revenue/RetentionだけでSafety/Trust悪化を無視
- Growth proposalにMetric ref / stop condition / guardrailがない
- Readingでdeterministic factを変更
- Message Guardrail violationをpass扱い
- Makerが自己修正・自己承認
- Human Gateを迂回

Closed Loop:

- Registryで解決できないMetric refを使用
- Metric definition ref無しでExperiment successを判定
- Safety/Trust悪化をBusiness metric改善で上書き
- invalid experimentからLearning Candidateを昇格
- insufficient sampleをhigh confidenceで一般化
- conflicting evidenceを隠す
- Candidate provenanceが無い
- evaluator / candidate makerが自己レビューしてAccepted Learning化
- Human Gate無しで`accepted_learning`へ遷移
- Raw PII / consultation textをResult/Learningへ保存

その他の数値閾値は、実測を蓄積してから決める。
