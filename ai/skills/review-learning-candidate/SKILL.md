# Skill: review-learning-candidate

## Goal

Learning Candidateを独立レビューし、Accepted Learningへの昇格可否を**Humanへ推薦**する。

このSkillはAccepted Learningを確定しない。

## Preconditions

- candidate statusである
- Evidence refsが存在
- Experiment由来ならExperiment validityが確認可能
- reviewerはcandidate makerと別主体

不足時は `need_more_evidence` または `invalid_review_input` を返す。

## Input contract

```yaml
candidate_ref: string
candidate: object
source_evaluations:
  - string
reviewer_id: string
maker_id: string
```

## Process

1. reviewer != makerを確認
2. Evidence traceabilityを確認
3. Experiment validityを確認
4. Metric fidelityを確認
5. Guardrail / Safety結果を確認
6. Contradicting evidenceを確認
7. ScopeがEvidenceを超えていないか確認
8. Confidence calibrationを確認
9. Revisit conditionを確認
10. 次のExperience Hypothesis / MLP Polishへの利用可能性を確認
11. Human recommendationを作る

## Output contract

```yaml
candidate_ref: string
recommendation: accept_candidate | reject_candidate | need_more_evidence | invalid_review_input
findings:
  - severity: blocker | warning | note
    category: evidence | validity | metric | safety | scope | confidence | contradiction | privacy | other
    message: string
required_changes:
  - string
recommended_scope: string | null
recommended_confidence: low | medium | high | null
recommended_next_use:
  - string
human_gate_required: true
```

## Blockers

- reviewer == maker
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
- hide_contradicting_evidence
- approve_own_candidate
- weaken_safety_policy

## Human Gate

recommendationが`accept_candidate`でも、最終状態はcandidateのまま。

Humanが承認した後にのみAccepted Learningとして保存する。
