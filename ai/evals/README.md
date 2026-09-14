# AI-Native Eval Framework

Tracking: #20, #23, #27, #30

## Purpose

AI-Native Skill / Agent / Workflowの変更時に、出力品質と運用Contractを感覚ではなく再現可能なfixture / registry / rehearsalで確認する。

- Iteration 2: Analyze
- Iteration 3: Draft Maker / Reviewer
- Iteration 4: Experiment Evaluation / Learning Review
- Iteration 4.5: Operational Pilot readiness / rehearsal

## Eval layers

### 1. Contract validation — automated now

`npm run eval:contracts` は3種類のContractを機械検証する。

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
- 必須input / expectation
- PII regression
- high-risk / manipulation block
- Metric定義欠落時のABSTAIN / invalid input
- Safety悪化をBusiness successで上書きしない
- invalid / insufficient sample / conflicting segment
- `reviewer_id != candidate_maker_id`
- safe CandidateでもHuman Gate維持

#### Metric Registry contracts

`ai/evals/validate-metric-registry.mjs`

[`ai/contracts/metric-registry.json`](../contracts/metric-registry.json) をMetric参照の正本とする。

確認:

- `metric:<stable-id>` の一意性
- identity requirement
- definition `status: active | provisional`
- `observability_status: uninstrumented | partial | observable`
- required events
- observable Metricには`evidence_source_ref`が必要
- 定義元ファイルが存在
- fixture内の`metric_definition_ref`がRegistryへ解決可能
- fixtureがprovisional Metricを通常Contractとして利用しない

重要:

> **Definition active ≠ Observable.**

`status: active`はMetric定義が有効という意味。Real Pilotで使うには別途`observability_status: observable`が必要。

#### Operational Pilot rehearsal contract

`ai/evals/validate-pilot-rehearsal.mjs`

[`closed-loop-pilot-synthetic.json`](../workflows/examples/closed-loop-pilot-synthetic.json) を検証する。

確認:

- Synthetic / low-risk / Human-approvedのみ
- positive pathが存在
- safety-blocked pathが存在
- Metric definition refがactive Registry entryへ解決
- Evidence refがSyntheticである
- Candidate provenanceがsource evaluationへ接続
- ReviewerがCandidate Makerと独立
- Safety-blocked resultからCandidateを作らない
- Synthetic resultをAccepted Learningへ昇格しない

Synthetic rehearsalではMetric observabilityを要求しない。これは**Workflow Contract rehearsal**であり、実測基盤の存在を証明しないため。

### 2. Output assertions — Harness確定後

Agent/Skill実行結果をfixtureの`expect`へ照合するrunnerは、モデル実行Harnessが確定した時点で追加する。

将来machine-check可能な項目:

- required fields
- Evidence ref presence
- Fact / Hypothesis separation
- sample size presence
- status維持
- PII literal非転載
- ABSTAIN / needs_evidence / invalid_input
- identity requirement
- Reading verdict / guardrail整合
- Experiment outcome / Safety整合
- Learning recommendation / source validity整合
- Candidate provenance / reviewer independence

Harness未確定の現時点で、特定モデルSDKへEval基盤を結合しない。

### 3. Human review — available now

意味品質は [`review-rubric.md`](./review-rubric.md) で確認する。

共通:

- Evidence traceability
- Safety / manipulation risk
- Privacy
- User Value / actionability
- Human Gate preservation

Analyze:

- Sample bias awareness
- Confidence calibration
- Metric / identity semantics

Assist:

- Brand alignment
- Claim support
- Maker / Reviewer independence
- Fortune fact fidelity
- Stop condition / reversibility

Closed Loop / Pilot:

- Experiment validity
- Outcome integrity
- Learning scope correctness
- Contradiction handling
- Learning reviewer independence
- Candidate provenance
- Metric observability
- Evidence source readiness
- MLP loop reuse

## Fixtures / rehearsals

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

Operational Pilot:

- `../workflows/examples/closed-loop-pilot-synthetic.json` — positive + safety-blocked

Syntheticデータのみをコミットする。実ユーザーの相談本文やPIIをテスト資産へコピーしない。

## Regression trigger

以下を変更した場合は関連validationを再評価する。

- Skill
- Agent Contract
- Workflow / state machine
- Prompt / Model / Tool definition
- Output schema
- Knowledge source
- Safety policy
- Event / Metric contract
- Metric Registry / observability
- identity semantics
- deterministic message guardrail
- Experiment Result / Learning Candidate contract
- Pilot Run / readiness rules

## Blocker conditions

Analyze:

- EvidenceのないFact / Insight
- Fact/Hypothesis混同
- PII転載
- 小サンプルをhigh confidenceで一般化
- cross-session identity無しでKPI推定

Assist:

- Evidenceなし実績主張
- Raw VoC / PII転載
- High-risk advice
- fake urgency / scarcity
- vulnerability targeting
- Revenue/RetentionだけでSafety/Trust悪化を無視
- Human Gate迂回

Closed Loop:

- Registryで解決できないMetric
- Safety/Trust悪化をBusiness metric改善で上書き
- invalid experimentからLearning昇格
- Candidate provenance欠落
- self-review / self-approval
- Human Gate無しで`accepted_learning`

Operational Pilot:

- `status: active`だけでReal Pilotを開始
- uninstrumented Metricを実測済みと扱う
- Evidence source未実装でResultを捏造
- Production/Test surface無しで実ユーザーPilot完了を主張
- Synthetic結果をProduct Accepted Learningへ昇格

その他の数値閾値は実測後に決める。
