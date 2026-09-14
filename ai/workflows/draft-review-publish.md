# Workflow: Draft → Review → Human Gate

## Goal

Content / Growth / Reading系のユーザー向けArtifactを、**Draftのまま作成し、独立ReviewとHuman Gateを通す**。

Iteration 3ではPublish / Send / Price changeを自動実行しない。

## Flow

```text
Approved inputs
  ↓
Maker Agent / Skill
  ↓
Draft artifact
  ↓
Deterministic message guardrail（該当テキスト）
  ↓
Independent review
  ↓
Human Gate
  ↓
Approved draft artifact
```

`Approved draft artifact` は自動公開許可を意味しない。外部実行は別の明示操作とする。

## Content flow

```text
Brand + Evidence + Objective
  ↓
Content Agent / draft-content
  ↓
Draft
  ↓
Message Guardrail
  ↓
Human Review
```

必須:

- evidence refs
- unsupported claim確認
- privacy確認
- manipulation risk確認
- guardrail result

## Growth flow

```text
Evidence + Metric definition
  ↓
Growth Agent / design-growth-experiment
  ↓
Experiment proposal + Draft assets
  ↓
Message Guardrail（Draft assets）
  ↓
Independent review
  ↓
Human decision
```

Human decision:

- Approve experiment
- Reject
- Need evidence
- Revise

Human approvalなしでcampaignを開始しない。

## Reading flow

```text
Deterministic fortune facts
  +
Reading draft (maker outside this iteration)
  ↓
Message Guardrail
  ↓
Reading Quality Agent / review-reading-quality
  ↓
pass / revise / block
  ↓
Human Gate
```

Reading Quality AgentはDraftを生成・修正して自己承認しない。

## Artifact states

許可:

```text
draft
  ↓
needs_review
  ↓
approved_for_manual_use | revise | blocked
```

Iteration 3で禁止:

```text
published
sent
scheduled
price_changed
charged
```

## Required audit fields

```yaml
artifact_id: string
maker: string
evidence_refs: []
guardrail_result:
  passed: boolean
  violation_ids: []
reviewer: string | human
review_result: pass | revise | block
human_decision: pending | approve | reject | revise
```

## Stop conditions

以下ではHuman Gateへ進めず`blocked`または`revise`。

- Evidence不足
- Raw VoC / PII混入
- deterministic message guardrail違反
- fortune fact矛盾
- high-stakes definitive advice
- fake urgency / scarcity
- manipulative monetization
- MakerとReviewerが同一で独立性を確保できない

## Definition of Done

1件のArtifactについてDoneとみなすのは、次を満たす場合。

- Draft contract準拠
- deterministic guardrail実行済み
- independent review済み
- Human decision記録済み
- Publish / Send等の副作用は未実行、または別の明示Human操作として追跡可能
