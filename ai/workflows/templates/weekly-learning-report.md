# Weekly Learning Report

Period: `YYYY-MM-DD .. YYYY-MM-DD`

## 1. Executive summary

- What materially changed:
- Why it matters:
- Decisions needed from Human:

## 2. Key facts

Factのみを書く。原因推定は次節へ分離する。

| ID | Fact | Evidence | Sample / Window | Confidence |
| --- | --- | --- | --- | --- |
| F-001 |  |  |  |  |

## 3. Hypotheses

| ID | Hypothesis | Evidence refs | What would confirm/reject it? | Confidence |
| --- | --- | --- | --- | --- |
| H-001 |  | F-001 |  |  |

## 4. VoC insights

| ID | Theme | Category | Evidence count | Segments | Limitations | Status |
| --- | --- | --- | ---: | --- | --- | --- |
| V-001 |  |  |  |  |  | candidate |

Raw VoC / PIIは貼らない。

## 5. Funnel / product signals

| Metric | Current | Comparison | Sample | Identity | Interpretation | Guardrail |
| --- | ---: | ---: | ---: | --- | --- | --- |
| First Reading Completion |  |  |  | cross_session |  | Helpfulness / Safety |
| Reading Flow Completion |  |  |  | session |  | Helpfulness / Safety |
| D1 Return |  |  |  | cross_session |  | Helpfulness / Safety |
| D7 Return |  |  |  | cross_session |  | Helpfulness / Safety |
| Repeat Reading Rate |  |  |  | cross_session |  | Helpfulness / manipulation risk |
| Helpful Feedback Rate |  |  |  | none |  |  |
| Paid Conversion |  |  |  | cross_session |  | Helpfulness / Safety |

Rules:

- 分母ゼロや定義不一致は値を無理に出さず `N/A` とする。
- `identity_requirement` を満たさないKPIも `N/A` とする。
- First Reading CompletionをReading Flow Completionで代用しない。
- cross-session identifierがPrivacy条件を満たさない場合、cross-session KPIを推定しない。

## 6. Safety / trust findings

- Safety rejections:
- High-risk patterns:
- Privacy / PII incidents:
- Manipulation risk:

重大なSafety findingは通常のGrowth proposalと混ぜず、独立して扱う。

## 7. Experiment results

| Experiment | Hypothesis | Result | Guardrail result | Decision | Learning candidate |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## 8. Accepted Learning candidates

この時点では自動昇格しない。

```yaml
- statement: ""
  evidence_refs: []
  scope: ""
  confidence: low | medium | high
  review_required: true
```

## 9. Decision Queue

最大3〜5件。

```yaml
- title: ""
  evidence_refs: []
  hypothesis: ""
  expected_user_value: ""
  expected_metric: ""
  risk: low | medium | high
  reversibility: easy | moderate | hard
  recommendation: approve | reject | gather_more_evidence
  human_decision: pending
```

## 10. Rejected / invalidated assumptions

失敗・反証もKnowledge候補として保持する。

- Assumption:
- Evidence:
- Why invalidated:

## 11. Next-week focus

AIが処理できる量ではなく、User Value / Evidence / Learning Valueで優先する。

1.
2.
3.

## Review checklist

- [ ] FactとHypothesisが分離されている
- [ ] Fact / InsightにEvidence refがある
- [ ] sample / window / metric definitionを追跡できる
- [ ] identity requirementを満たしている
- [ ] Raw VoC / PIIを転載していない
- [ ] Revenue / RetentionをSafety / Trustと併記した
- [ ] Accepted Learningを自動昇格していない
- [ ] Decision Queueが3〜5件以内
