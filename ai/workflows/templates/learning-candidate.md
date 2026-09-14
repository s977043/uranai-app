# Learning Candidate

Experiment評価や複数Evidenceから得た学習候補を、Accepted Learningへ昇格する前に保持するテンプレート。

## Contract

```yaml
candidate_id: string
statement: string
scope: string
evidence_refs:
  - string
experiment_refs:
  - string
confidence: low | medium | high
supporting_findings:
  - string
contradicting_findings:
  - string
limitations:
  - string
revisit_when:
  - string
recommended_next_use:
  - experience_hypothesis
  - mlp_polish
  - content
  - growth
  - product
status: candidate
```

## State machine

```text
candidate
  ↓
under_review
  ├──→ rejected
  ├──→ need_more_evidence
  └──→ human_approved
          ↓
      accepted_learning
```

AI Agent / Skillは `candidate` またはReview recommendationまでしか作れない。

`accepted_learning` への最終遷移はHuman Gate必須。

## Rules

- statementはEvidenceが支える範囲を超えて一般化しない
- Experimentが`invalid`なら主要根拠として使わない
- 反証Evidenceを隠さず `contradicting_findings` に含める
- confidenceはsample /再現性 /反証 /limitationsに合わせる
- Raw PII / consultation textを含めない
- 「売上が上がった」だけをユーザー価値のLearningに変換しない
- Safety/Trust悪化を伴う施策を成功学習として昇格しない

## Accepted Learningへ昇格するとき

Humanが最低限確認する。

1. Evidence traceability
2. Experiment validity
3. Metric fidelity
4. Safety / Guardrail
5. Scope
6. Confidence
7. Contradicting evidence
8. Revisit condition
9. 次のExperience Hypothesis / MLP Polishへの使い道
