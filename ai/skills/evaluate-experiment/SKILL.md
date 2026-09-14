# Skill: evaluate-experiment

## Goal

Humanが承認・実行したExperiment Result Recordを、Metric Contract / Guardrail / Safety / Limitationsに照らして評価し、Learning Candidateの材料を作る。

このSkillはAccepted Learningを確定しない。

## Preconditions

- Experiment Result Recordが存在
- target metric / guardrailに `metric_definition_ref` がある
- Human approval記録がある
- statusが `completed | stopped | invalid` のいずれか
- Result Evidence refが追跡可能

不足時は `invalid_input` または `needs_evidence` を返す。

## Input contract

```yaml
experiment_result_ref: string
experiment_result: object
metric_contract_refs:
  - string
previous_findings:
  - string
```

## Process

1. Experiment statusを確認
2. Human approval / execution scopeを確認
3. Metric definition refを検証
4. Sample rule / stop conditionを確認
5. target metric結果をFactとして整理
6. guardrail結果をFactとして整理
7. Safety findingsを確認
8. limitations / contamination / missing dataを確認
9. Segment間の矛盾を確認
10. Outcome classificationを作る
11. 原因仮説はFactと分離して記録
12. Learning Candidate draftを作る場合はscope/confidenceを制限する

## Output contract

```yaml
status: evaluated | needs_evidence | invalid_input
experiment_ref: string
validity: valid | limited | invalid
outcome: positive | negative | mixed | inconclusive | safety_blocked | invalid
facts:
  - statement: string
    evidence_refs:
      - string
guardrail_assessment:
  status: stable | improved | degraded | unknown
  findings:
    - string
safety_assessment:
  status: clear | concern | violation
  findings:
    - string
limitations:
  - string
hypotheses:
  - statement: string
    confidence: low | medium | high
learning_candidate:
  statement: string | null
  scope: string | null
  confidence: low | medium | high | null
  evidence_refs:
    - string
  experiment_refs:
    - string
  status: candidate | null
review_required: true
```

## Outcome rules

- target metric改善 + guardrail安定: `positive`候補
- target metric改善 + guardrail悪化: `mixed` または `safety_blocked`
- Safety violation: `safety_blocked`。Business metric改善で上書きしない
- sample不足: `inconclusive`
- Experiment status=`invalid`: `invalid`
- Segment結果が相反し全体化できない: `mixed` / narrow scope candidate

## Prohibited

- cause_as_fact
- promote_to_accepted_learning
- ignore_guardrail_degradation
- ignore_safety_violation
- invent_missing_metric
- infer_cross_session_without_identity_contract
- include_raw_pii

## Review checklist

- [ ] metric_definition_refを追跡できる
- [ ] Sample rule / stop conditionを確認した
- [ ] Fact / Hypothesisが分離されている
- [ ] Guardrail悪化を結果へ反映した
- [ ] Safety violationを成功扱いしていない
- [ ] invalid experimentからLearningを生成していない
- [ ] Learning Candidateはcandidateのまま
- [ ] review_required=true
