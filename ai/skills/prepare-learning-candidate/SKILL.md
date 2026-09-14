# Skill: prepare-learning-candidate

## Goal

Experiment Evaluationから、Accepted Learningへ昇格可能な**候補**をEvidence付きで作る。

AIは候補を作るだけで、Accepted Learningへ自己昇格しない。

## Preconditions

- `evaluate-experiment`のEvaluationがある
- `facts[].evidence_refs`からEvidenceを追跡できる
- `learning_candidate_allowed=true`
- Safety / guardrail findingsが明示されている

## Input contract

```yaml
experiment_id: string
evaluation:
  result: positive | negative | inconclusive | stopped
  facts:
    - statement: string
      evidence_refs:
        - string
  target_result: improved | worsened | unchanged | unknown
  guardrail_results:
    - metric: string
      result: improved | worsened | unchanged | unknown
  causal_claim_allowed: boolean
  limitations:
    - string
  recommendation: adopt | reject | iterate | gather_more_evidence
  learning_candidate_allowed: boolean
  evaluated_by: string
existing_learning_refs:
  - string
```

## Process

1. `facts[].evidence_refs`を集約し、Factと解釈を分離
2. Experiment scopeを確認
3. target / guardrail resultを同時に確認
4. causal claim境界を維持
5. contradicting evidenceを確認
6. statementを最小範囲で作る
7. confidenceを設定
8. revisit conditionを定義
9. `status: candidate`で返す

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
- EvidenceはEvaluationのFactからのみ引き継ぎ、存在しないrefを作らない
- negative resultからもLearning Candidateを作れる
- inconclusiveの場合は「何が分からなかったか」を候補化できるが、効果主張はしない
- stopped / Safety incidentでは危険条件・中止判断を候補化できる
- target改善だけでguardrail悪化を無視しない
- 実験範囲を超えて一般化しない
- causal claim不可なら「〜が原因」と書かない
- contradicting evidenceを隠さない

## Review checklist

- [ ] status=candidate
- [ ] accepted_by=null / accepted_at=null
- [ ] Evidence refがEvaluation facts由来
- [ ] scope明示
- [ ] target / guardrailを両方確認
- [ ] causal boundary維持
- [ ] contradicting evidence確認
- [ ] limitationsあり
- [ ] revisit conditionあり

## Stop conditions

- `learning_candidate_allowed=false`
- factsにEvidence refがない
- Evaluation矛盾
- Accepted Learningへの自己昇格要求
