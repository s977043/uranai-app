# Skill: review-learning-candidate

## Goal

Learning Candidateを独立レビューし、Accepted Learningへの昇格可否を**Humanへ推薦**する。

このSkillはAccepted Learningを確定しない。

## Preconditions

- candidate statusである
- Candidate自身に`candidate_maker_id` / `source_evaluation_refs`が記録されている
- Evidence refsが存在
- Experiment由来ならExperiment validityが確認可能
- reviewerはLearning Candidateを作った主体と別である

不足時は `need_more_evidence` または `invalid_review_input` を返す。

## Input contract

```yaml
candidate_ref: string
candidate:
  candidate_maker_id: string
  source_evaluation_refs:
    - string
  status: candidate
  # ...other Learning Candidate fields
source_evaluations:
  - object
reviewer_id: string
```

`candidate.candidate_maker_id` はExperiment proposalの作成者ではなく、**このLearning Candidateを生成したEvaluator / Maker**を指す。

Candidate本体をprovenanceの唯一の正本とし、Reviewer入力側に別のmaker IDを重複保持しない。

## Process

1. `reviewer_id != candidate.candidate_maker_id` を確認
2. `candidate.source_evaluation_refs` と `source_evaluations` の追跡可能性を確認
3. Evidence traceabilityを確認
4. Experiment validityを確認
5. Metric fidelityを確認
6. Guardrail / Safety結果を確認
7. Contradicting evidenceを確認
8. ScopeがEvidenceを超えていないか確認
9. Confidence calibrationを確認
10. Revisit conditionを確認
11. 次のExperience Hypothesis / MLP Polishへの利用可能性を確認
12. Human recommendationを作る

## Output contract

```yaml
candidate_ref: string
reviewer_id: string
candidate_maker_id: string
recommendation: accept_candidate | reject_candidate | need_more_evidence | invalid_review_input
findings:
  - severity: blocker | warning | note
    category: evidence | validity | metric | safety | scope | confidence | contradiction | privacy | provenance | other
    message: string
required_changes:
  - string
recommended_scope: string | null
recommended_confidence: low | medium | high | null
recommended_next_use:
  - string
human_gate_required: true
```

Outputの`candidate_maker_id`はCandidate provenanceをそのまま転記し、別値を生成しない。

## Blockers

- reviewer_id == candidate.candidate_maker_id
- Candidate provenance不足
- source evaluationを追跡できない
- Evidence ref無し
- invalid Experimentを主要根拠にしている
- Safety/Trust悪化を成功学習化している
- Metric definition不明
- Raw PII / consultation textを含む
- Evidenceより広いscope
- 反証Evidenceを隠している
- 単一小サンプルをhigh confidenceで一般化

## Prohibited

- mark_as_accepted_learning
- write_knowledge_directly
- rewrite_candidate_provenance
- hide_contradicting_evidence
- approve_own_candidate
- weaken_safety_policy

## Human Gate

recommendationが`accept_candidate`でも、最終状態はcandidateのまま。

Humanが承認した後にのみAccepted Learningとして保存する。
