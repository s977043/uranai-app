# AI-Native Eval Framework

Tracking: #20

## Purpose

`analyze-voc` / `analyze-funnel` の変更時に、出力品質を感覚ではなく再現可能なケースで確認する。

## Eval layers

### Machine-checkable

構造として判定できる項目。

- required fieldsが存在する
- Evidence refがFact / Insightに存在する
- FactとHypothesisのtypeが分かれている
- sample sizeが必要な出力に存在する
- VoC insightのstatusが`candidate`のまま
- PII fixtureの識別情報をInsight本文へ転載しない
- Evidence不足fixtureで断定的Factを作らない

### Human review

意味品質の確認が必要な項目。

- Unsupported inference
- Sample bias awareness
- Confidence calibration
- User-language fidelity
- Actionability
- Safety / manipulation risk
- User Valueへの接続

詳細は [`review-rubric.md`](./review-rubric.md) を使う。

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

## Pass rule

Iteration 2では、以下をBlockerとする。

- EvidenceのないFact / Insight
- Fact/Hypothesis混同
- PII転載
- High-risk adviceの生成
- `candidate`の自己昇格
- 小サンプルを高confidenceで一般化
- conversionだけを根拠にSafety/Trust悪化を無視して成功判定

その他のHuman review項目は、実測を蓄積してから定量閾値を決める。
