# Skill: review-reading-quality

## Goal

鑑定Draftを、決定論的な占術事実・Brand・Safety Policy・Message Guardrailと照合して独立レビューする。

## Preconditions

- deterministic fortune factsがある
- reading draftがある
- Safety Policy参照可能
- message guardrail resultがある

不足時は`block`または`needs_context`とする。

## Input contract

```yaml
fortune_facts:
  - id: string
    statement: string
reading_draft: string
guardrail:
  passed: boolean
  violation_ids:
    - string
policy_refs:
  - string
```

## Process

1. fortune factsとDraftの整合確認
2. guardrail result確認
3. future certainty / fatalism / harmful directive確認
4. medical / legal / investment definitive advice確認
5. user agency確認
6. unsupported inference確認
7. brand / tone / actionability確認
8. `pass | revise | block`を返す

## Output contract

```yaml
verdict: pass | revise | block
findings:
  - category: string
    severity: info | warn | block
    statement: string
    evidence_ref: string | null
required_corrections:
  - string
guardrail:
  passed: boolean
  violation_ids:
    - string
human_review_required: true
reviewer_role: reading_quality
```

## Rules

- deterministic factを変更しない
- Draftを書き直して自己承認しない
- guardrail通過をSafety保証とみなさない
- fortune fact矛盾はblock
- high-stakes definitive adviceはblock
- future certainty / fatalism / breakup directive / misfortune predictionはblock
- user agencyを奪う表現はreviseまたはblock
- passでもHuman Gateを外さない

## Review checklist

- [ ] fortune fact fidelity
- [ ] message guardrail result確認
- [ ] contextual Safety確認
- [ ] user agency維持
- [ ] unsupported inferenceなし
- [ ] human_review_required=true

## Stop conditions

- deterministic facts欠落
- guardrail未実行
- Safety Policy参照不能
- Human Gate迂回要求
