# Workflow: Weekly Learning Loop

## Goal

1週間のプロダクト・VoC・Experimentから、**次週へ再利用できるAccepted LearningとDecision Queueを作る**。

成果物は「今週やったこと一覧」ではなく、次の判断を改善するLearningです。

## Schedule

週1回を基本とする。実行時刻は固定しない。

## Inputs

- 週次KPI
- Funnel metrics
- VoC insights candidates
- Experiment results
- Incident / safety findings
- Previous Accepted Learning
- Open Decision Queue

## Steps

### 1. Collect

必要な集約情報を揃える。

確認:

- source
- period
- metric definition
- sample size
- missing data

### 2. Analyze

`analyze-funnel` / `analyze-voc` を使い、Factを抽出する。

出力はEvidence参照必須。

### 3. Separate fact and hypothesis

```text
Fact
  ↓
Possible explanation (Hypothesis)
  ↓
What evidence would confirm / reject it?
```

原因不明を無理に埋めない。

### 4. Review evidence

独立レビューまたはHumanが確認する。

- Evidence sourceは妥当か
- Sample biasはないか
- 指標定義は同じか
- 反証Evidenceはないか
- PIIを持ち出していないか

### 5. Review safety / brand

`docs/ai-native/safety-policy.md` と `docs/concept-board.md` に照合する。

違反候補はDecision Queueへ上げず、Safety issueとして分離する。

### 6. Create decision candidates

Humanが判断すべき項目だけを残す。

```yaml
decision:
  title: string
  evidence_refs:
    - string
  hypothesis: string
  expected_user_value: string
  expected_metric: string
  risk: low | medium | high
  reversibility: easy | moderate | hard
  recommendation: approve | reject | gather_more_evidence
```

### 7. Human decision

Humanは次のいずれかを記録する。

- Approve
- Reject
- Need evidence
- Defer

理由を短く残す。

### 8. Promote learning

Experiment結果または十分なEvidenceがあり、レビューを通過したものだけ `Accepted Learning` にする。

```yaml
learning:
  statement: string
  evidence_refs:
    - string
  scope: string
  confidence: low | medium | high
  accepted_by: human | review-gate
  accepted_at: YYYY-MM-DD
  revisit_when:
    - condition
```

### 9. Generate next-week focus

最大3〜5件のFocusに絞る。

AIが実行できる量ではなく、**ユーザー価値と学習価値の高い順**で選ぶ。

## Output

```text
Weekly Learning Report
├── Key facts
├── Accepted learnings
├── Rejected / invalidated assumptions
├── Safety findings
├── Decision queue
├── Next experiments
└── Next-week focus
```

## Stop conditions

以下ではAccepted Learningを作らない。

- Evidence不足
- Experiment未完了で因果を主張している
- Sample biasが大きい
- Safety Policyと衝突
- Fact / hypothesisが混ざっている
- 元データの定義が不明

## Anti-patterns

- Agentが自分の提案を自分でAccepted Learningにする
- 毎週Knowledgeを増やすこと自体をKPIにする
- 成功施策だけ保存し失敗を捨てる
- CVR改善だけを成功とする
- Raw VoCをレポートへ大量転載する
