# Skill: draft-content

## Goal

Brand / Accepted Learning / Evidenceに沿った外部公開前コンテンツDraftを作る。

## Preconditions

- audience / objectiveが明確
- Brand / Safety policyを参照可能
- 数値・実績・顧客傾向を主張する場合はEvidence refがある
- Raw VoC / 不要なPIIを入力しない

満たさない場合はDraftせず`needs_evidence`を返す。

## Input contract

```yaml
artifact_type: social | article | education | landing_copy | other
audience: string
objective: string
evidence_refs:
  - string
accepted_learning_refs:
  - string
constraints:
  - string
```

## Process

1. objectiveとaudienceを確認
2. Brand / Safety制約を読み込む
3. Evidenceで主張可能な範囲を特定
4. unsupported claimを除外
5. Draft作成
6. CTAが必要ならUser agencyを損なわない形で作成
7. deterministic message guardrailへ渡す前提で出力
8. Human review requiredを固定

## Output contract

```yaml
status: draft | needs_evidence
artifact_type: string
audience: string
objective: string
evidence_refs:
  - string
claims:
  - statement: string
    evidence_ref: string | null
draft: string
cta: string | null
safety_notes:
  - string
guardrail_required: true
review_required: true
```

## Safety / Privacy rules

- 架空の実績・レビュー・専門家権威を作らない
- Raw VoCを引用しない
- PIIをDraftへ持ち込まない
- 恐怖・不安・孤独をCTAに利用しない
- fake urgency / scarcity禁止
- 医療・法律・投資の断定助言禁止
- 高リスク相談を課金へ接続しない

## Review checklist

- [ ] audience / objectiveが明確
- [ ] claimに必要なEvidenceがある
- [ ] Raw VoC / PIIがない
- [ ] fake urgency / manipulationがない
- [ ] Safety Policyと整合
- [ ] deterministic message guardrail前提
- [ ] review_required=true

## Stop conditions

- Evidence不足
- Safetyとobjectiveの衝突
- 架空口コミや実績生成要求
- 外部publish/send要求
