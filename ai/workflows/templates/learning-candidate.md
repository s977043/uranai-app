# Learning Candidate

Experiment評価や複数Evidenceから得た学習候補を、Accepted Learningへ昇格する前に保持するテンプレート。

## Contract

```yaml
candidate_id: string
candidate_maker_id: string
source_evaluation_refs:
  - string
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

`candidate_maker_id` はこのCandidateを作成したEvaluator / Makerの識別子。Experiment proposal作成者とは別概念。

`source_evaluation_refs` はCandidateを生成する根拠となったExperiment Evaluation等を追跡するために必須。

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

## Reviewer independence

Learning Reviewでは最低限、次を満たす。

```text
reviewer_id != candidate_maker_id
```

同一主体によるCandidate生成→自己レビュー→自己承認を禁止する。

## Rules

- statementはEvidenceが支える範囲を超えて一般化しない
- Experimentが`invalid`なら主要根拠として使わない
- 反証Evidenceを隠さず `contradicting_findings` に含める
- confidenceはsample /再現性 /反証 /limitationsに合わせる
- Raw PII / consultation textを含めない
- 「売上が上がった」だけをユーザー価値のLearningに変換しない
- Safety/Trust悪化を伴う施策を成功学習として昇格しない
- provenanceを失うため`candidate_maker_id` / `source_evaluation_refs`を削除しない

## Accepted Learningへ昇格するとき

Humanが最低限確認する。

1. Evidence traceability
2. Candidate provenance / reviewer independence
3. Experiment validity
4. Metric fidelity
5. Safety / Guardrail
6. Scope
7. Confidence
8. Contradicting evidence
9. Revisit condition
10. 次のExperience Hypothesis / MLP Polishへの使い道
