# Skill: prepare-learning-candidate

## Goal

Experiment Evaluationから、Accepted Learningへ昇格可能な**候補**をEvidence付きで作る。

AIは候補を作るだけで、Accepted Learningへ自己昇格しない。

## Preconditions

- `evaluate-experiment`のEvaluationがある
- Evidence refsがある
- `learning_candidate_allowed=true`
- Safety / guardrail findingsが明示されている

## Input contract

```yaml
experiment_id: string
evaluation:
  result: positive | negative | inconclusive | stopped
  facts: []
  causal_claim_allowed: boolean
  limitations: []
  recommendation: adopt | reject | iterate | gather_more_evidence
  learning_candidate_allowed: boolean
  evidence_refs: []
existing_learning_refs:
  - string
```

## Process

1. Factと解釈を分離
2. Experiment scopeを確認
3. causal claim境界を維持
4. contradicting evidenceを確認
5. statementを最小範囲で作る
6. confidenceを設定
7. revisit conditionを定義
8. `status: candidate`で返す

## Output contract

```yaml
status: candidate
experiment_id: string
statement: string
evidence_refs:
  - string
scope: string
confidence: low | medium | high
contradicting_evidence:
  - string
limitations:
  - string
revisit_when:
  - string
accepted_by: null
accepted_at: null
```

## Rules

- `accepted`へ変更しない
- negative resultからもLearning Candidateを作れる
- inconclusiveの場合は「何が分からなかったか」をLearning候補にできるが、効果主張はしない
- stopped / Safety incidentでは、危険な条件・中止判断をLearning候補にできる
- 実験範囲を超えて一般化しない
- causal claim不可なら「〜が原因」と書かない
- contradicting evidenceを隠さない

## Review checklist

- [ ] status=candidate
- [ ] accepted_by=null
- [ ] Evidence refあり
- [ ] scope明示
- [ ] causal boundary維持
- [ ] contradicting evidence確認
- [ ] limitationsあり
- [ ] revisit conditionあり

## Stop conditions

- `learning_candidate_allowed=false`
- Evidenceなし
- Evaluation矛盾
- Accepted Learningへの自己昇格要求
