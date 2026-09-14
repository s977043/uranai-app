# Skill: evaluate-experiment

## Goal

Humanが承認・実行したExperiment Result Recordを、Metric Contract / Execution Fidelity / Guardrail / Safety / Limitationsに照らして評価し、Learning Candidateの材料を作る。

このSkillはAccepted Learningを確定しない。

## Preconditions

- Experiment Result Recordが存在
- target metric / guardrailの`metric_definition_ref`が[`ai/contracts/metric-registry.json`](../../contracts/metric-registry.json)のactive entryへ解決できる
- Human approval記録がある
- statusが `completed | stopped | invalid` のいずれか
- Result Evidence refが追跡可能
- Execution Receiptに `execution_scope / implementation_ref / actual_change / deviations_from_proposal` がある

不足時は `invalid_input` または `needs_evidence` を返す。

## Input contract

```yaml
experiment_result_ref: string
experiment_result: object
metric_contract_refs:
  - metric:<stable-id>
previous_findings:
  - string
```

## Process

1. Experiment statusを確認
2. Human approvalを確認
3. Execution Receiptを確認し、実際の実施内容をProposalと分離して読む
4. `execution_scope / implementation_ref / actual_change / deviations_from_proposal` の追跡可能性を確認
5. Material deviationがcomparison / scope / sample / Safetyへ与える影響を判定
6. Metric Registryでdefinition refを検証
7. Sample rule / stop conditionを確認
8. target metric結果をFactとして整理
9. guardrail結果をFactとして整理
10. Safety findingsを確認
11. limitations / contamination / missing dataを確認
12. Segment間の矛盾を確認
13. `validity` と `outcome` を別々に判定
14. 原因仮説はFactと分離して記録
15. Learning Candidate draftを作る場合はscope/confidenceを制限し、Candidate Maker provenanceを残す

## Output contract

```yaml
status: evaluated | needs_evidence | invalid_input
experiment_ref: string
validity: valid | limited | invalid
outcome: positive | negative | mixed | inconclusive | safety_blocked | invalid
execution_fidelity:
  status: matched | deviated | unknown
  findings:
    - string
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
  candidate_maker_id: string | null
  source_evaluation_refs:
    - string
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

## Validity / outcome rules

- target metric改善 + guardrail安定 +十分なEvidence + execution fidelity一致: `valid` / `positive`候補
- target metric改善 + guardrail悪化: `mixed` または `safety_blocked`
- Safety violation: `safety_blocked`。Business metric改善で上書きしない
- sample rule未達だがResult自体は解釈可能: `limited` / `inconclusive`
- Proposalとの差分があるが影響範囲を限定できる: `execution_fidelity: deviated` + 原則 `validity: limited`
- Proposalとの差分でcomparison条件やExperiment identityが壊れた: `validity: invalid` / `outcome: invalid`
- Experiment status=`invalid` またはMetric Contract解決不能: `invalid` / `invalid`
- Segment結果が相反し全体化できない: `mixed` / narrow scope candidate

`completed` は成功を意味しない。実行が終了したという状態と、分析上のvalidity/outcomeを分離する。

## Execution fidelity rules

- Proposalの内容を「実際に実行した内容」として推測しない
- `implementation_ref` と `actual_change` が追跡できない場合は `execution_fidelity: unknown`
- `deviations_from_proposal` を隠さない
- Deviationがあるだけで自動的にinvalidにはしない。結果解釈への影響で `limited | invalid` を判断する
- EvaluatorはExecution Receiptを書き換えない
- stop condition発火時は `stop_condition_triggered / stop_reason / safety_findings` の整合を確認する
- Receipt中のRaw PII / consultation text / secretをLearningへ引き継がない

## Prohibited

- cause_as_fact
- promote_to_accepted_learning
- ignore_guardrail_degradation
- ignore_safety_violation
- hide_execution_deviation
- rewrite_execution_receipt
- invent_missing_metric
- use_unknown_metric_ref
- infer_cross_session_without_identity_contract
- include_raw_pii

## Review checklist

- [ ] metric_definition_refがRegistryのactive entryへ解決できる
- [ ] Result Evidence refを追跡できる
- [ ] execution_scope / implementation_ref / actual_changeを確認した
- [ ] deviations_from_proposalを確認した
- [ ] Stop condition発火時のstop_reasonを確認した
- [ ] Sample rule / stop conditionを確認した
- [ ] execution statusとevaluation validityを混同していない
- [ ] execution fidelityをvalidityへ反映した
- [ ] Fact / Hypothesisが分離されている
- [ ] Guardrail悪化を結果へ反映した
- [ ] Safety violationを成功扱いしていない
- [ ] invalid experimentからLearningを生成していない
- [ ] Candidate Maker provenanceがある
- [ ] Learning Candidateはcandidateのまま
- [ ] review_required=true
