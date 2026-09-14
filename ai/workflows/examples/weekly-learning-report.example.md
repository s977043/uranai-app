# Weekly Learning Report — Synthetic Example

Period: `synthetic-week-2`

> この文書の数値・VoCはすべてSyntheticです。実ユーザーデータではありません。

## 1. Executive summary

- First Reading Completion が 78% → 62% に低下した。
- Paid Conversion は上昇したが Helpful Feedback Rate は低下している。
- VoCでは「解釈理由が欲しい」という候補Insightが複数sourceにある。
- Human判断が必要なのは、完了率低下の原因調査と、有料導線変更を継続するかの2点。

## 2. Key facts

| ID | Fact | Evidence | Sample / Window | Confidence |
| --- | --- | --- | --- | --- |
| F-001 | First Reading Completionが78%から62%へ低下 | funnel-01-clear-dropoff | n=1000 / synthetic-week-1,2 | high |
| F-002 | Paid Conversionが12%から18%へ上昇 | funnel-05-conversion-up-helpfulness-down | n=800+ / synthetic-week-1,2 | high |
| F-003 | Helpful Feedback Rateが68%から52%へ低下 | funnel-05-conversion-up-helpfulness-down | n=800+ / synthetic-week-1,2 | high |

## 3. Hypotheses

| ID | Hypothesis | Evidence refs | What would confirm/reject it? | Confidence |
| --- | --- | --- | --- | --- |
| H-001 | 初回鑑定フロー内の変更が完了率低下に関係している可能性 | F-001 | release差分とstep別離脱を確認 | low |
| H-002 | 有料導線変更がconversion上昇に関係している可能性 | F-002 | randomized experimentで比較 | low |
| H-003 | 有料導線変更が体験品質を損ねた可能性 | F-002,F-003 | placement別helpfulnessを比較 | medium |

因果は確定していない。

## 4. VoC insights

| ID | Theme | Category | Evidence count | Segments | Limitations | Status |
| --- | --- | --- | ---: | --- | --- | --- |
| V-001 | 鑑定結果の理由・解釈プロセスを知りたい | desired_outcome | 3 | relationship, work | Synthetic sample | candidate |
| V-002 | dailyは短く、relationshipは詳しく読みたい | language | 4 | daily, relationship | Segment数が少ない | candidate |

## 5. Funnel / product signals

| Metric | Current | Comparison | Sample | Interpretation | Guardrail |
| --- | ---: | ---: | ---: | --- | --- |
| First Reading Completion | 62% | 78% | 1000 | 明確な低下。原因不明 | Helpfulness確認必要 |
| D1 Return | N/A | N/A | N/A | Fixture未接続 | N/A |
| Repeat Reading Rate | N/A | N/A | N/A | Fixture未接続 | N/A |
| Helpful Feedback Rate | 52% | 68% | 800+ | 低下 | 主要guardrail |
| Paid Conversion | 18% | 12% | 800+ | 上昇。ただし単独成功判定不可 | Helpfulness悪化 |

## 6. Safety / trust findings

- High-risk VoC fixtureでは、復縁断定要求を通常Insight/monetizationへ変換しないことが必要。
- PII fixtureでは氏名・メールをInsightへ転載しないことが必要。
- Revenue改善とHelpful Feedback悪化が同時にあるため、有料導線の全面展開は保留候補。

## 7. Experiment results

現時点ではSynthetic fixtureのため、本番Experiment resultなし。

## 8. Accepted Learning candidates

なし。

理由: Fixture検証段階であり、実ユーザーに対する学習として昇格できない。

## 9. Decision Queue

```yaml
- title: "初回鑑定完了率低下の原因調査を優先する"
  evidence_refs: [F-001]
  hypothesis: "フロー内の変更が関係している可能性"
  expected_user_value: "初回体験を完走しやすくする"
  expected_metric: "First Reading Completion"
  risk: low
  reversibility: easy
  recommendation: gather_more_evidence
  human_decision: pending

- title: "有料導線変更の全面展開を保留する"
  evidence_refs: [F-002, F-003]
  hypothesis: "conversion改善と体験品質低下がトレードオフになっている可能性"
  expected_user_value: "課金最適化による体験毀損を避ける"
  expected_metric: "Paid Conversion + Helpful Feedback Rate"
  risk: medium
  reversibility: easy
  recommendation: gather_more_evidence
  human_decision: pending
```

## 10. Rejected / invalidated assumptions

- 「Paid Conversionが上がれば施策成功」→ 棄却候補。Helpful Feedbackが悪化しているため単独では判断できない。

## 11. Next-week focus

1. First Reading Completion低下のstep別Evidenceを追加する。
2. Paid ConversionとHelpfulnessのplacement別比較を設計する。
3. VoCのSegment差を追加fixtureで継続検証する。
