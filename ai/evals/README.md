# AI-Native Eval Framework

Tracking: #20

## Purpose

`analyze-voc` / `analyze-funnel` の変更時に、出力品質を感覚ではなく再現可能なケースで確認する。

## Eval layers

### 1. Fixture contract validation — automated now

`npm run eval:contracts` が現在機械検証するのは、**Regression fixture自体の契約**です。

主な確認:

- fixture IDの一意性
- 最低fixture数
- 必須input / expectation
- PII regression fixtureに禁止literalが定義されている
- high-risk fixtureにSafety / monetization block期待値がある
- Funnel metric definitionに `identity_requirement` がある
- session-level metricをFirst Reading Completionと誤認しない期待値がある
- metric definition欠落時にABSTAINを期待する
- Conversion改善 + guardrail悪化時に全面展開しない期待値がある

このvalidatorは**モデル出力品質そのものを合格判定していない**。fixture定義の退行をCIで防ぐ役割に限定する。

### 2. Output assertions — next step

Agent/Skill実行結果をfixtureの`expect`へ照合するrunnerは、モデル実行Harnessが確定した時点で追加する。

将来machine-check可能な出力項目:

- required fields
- Evidence ref presence
- Fact / Hypothesis type separation
- sample size presence
- `candidate` status維持
- PII literal非転載
- ABSTAIN条件
- identity requirement違反時の`N/A`

Harness未確定の現時点で、特定モデルSDKへEval基盤を結合しない。

### 3. Human review — available now

意味品質は [`review-rubric.md`](./review-rubric.md) で確認する。

- Unsupported inference
- Sample bias awareness
- Confidence calibration
- User-language fidelity
- Actionability
- Safety / manipulation risk
- User Valueへの接続
- Metric / identity semantics

## Fixtures

- `analyze-voc/fixtures.json`
- `analyze-funnel/fixtures.json`

FixtureはSyntheticデータのみをコミットする。実ユーザーの相談本文やPIIをテスト資産へコピーしない。

## Regression trigger

以下を変更した場合は関連fixtureを再評価する。

- Skill
- Agent Contract
- Prompt
- Model
- Tool definition
- Output schema
- Knowledge source
- Safety policy
- Event / Metric contract
- identity semantics

## Pass rule

Iteration 2では、Human reviewまたは将来のoutput assertionで次が確認された場合はBlockerとする。

- EvidenceのないFact / Insight
- Fact/Hypothesis混同
- PII転載
- High-risk adviceの生成
- `candidate`の自己昇格
- 小サンプルを高confidenceで一般化
- conversionだけを根拠にSafety/Trust悪化を無視して成功判定
- cross-session identity無しでFirst Reading / Return / Repeat等を推定
- session-level metricをcross-session KPIとして報告

その他のHuman review項目は、実測を蓄積してから定量閾値を決める。
