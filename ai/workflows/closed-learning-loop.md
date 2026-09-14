# Workflow: Closed Learning Loop

Tracking: #26

## Goal

Experiment ProposalからAccepted Learning候補までを、Human execution / independent evaluation / acceptance gateを保ったまま閉じる。

## Flow

```text
Growth Proposal
  ↓
Human Approval
  ↓
Manual Execution
  ↓
Execution Receipt
  ↓
Observation / Evidence
  ↓
Analyst + evaluate-experiment
  ↓
Evaluation
  ↓
prepare-learning-candidate
  ↓
Learning Candidate
  ↓
Human / Independent Acceptance Gate
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

## Role separation

- Proposal Maker: Growth Agent
- Executor: Human（Iteration 4）
- Evaluator: Analyst Agent + `evaluate-experiment`
- Candidate Maker: `prepare-learning-candidate`
- Acceptance: Human / independent gate

禁止:

- Proposal Makerが自分のExperimentを自己評価して即adopt
- AIがHuman Approval / Execution Receiptを捏造
- Candidate MakerがAccepted Learningへ自己昇格

## Step 1 — Proposal

`design-growth-experiment`のContract準拠。

必須:

- Evidence refs
- target metric + metric definition ref
- guardrails + metric definition refs
- sample/duration rule
- stop conditions
- reversibility

## Step 2 — Human approval

Humanが`approve | reject | revise`を記録。

`approve`のみ次へ進める。

## Step 3 — Manual execution receipt

Humanが実行後にReceiptを残す。

```yaml
experiment_id: string
executed_by: string
executed_at: string
implementation_ref: string
actual_change: string
deviations_from_proposal: []
stop_condition_triggered: false
stopped_at: null
stop_reason: null
```

Receipt無しのExperimentを評価しない。

## Step 4 — Observation

Metric Contractに基づいてtarget / guardrail / sample / window / Evidenceを揃える。

Missing dataは明示する。

## Step 5 — Evaluation

`evaluate-experiment`を利用。

判定:

- `positive`
- `negative`
- `inconclusive`
- `stopped`

重要:

- Target改善だけで成功判定しない
- Guardrail悪化ならadopt禁止
- Safety stopはstopped
- causalityを過剰主張しない

## Step 6 — Learning Candidate

`prepare-learning-candidate`を利用。

AIは`candidate`のみ生成可能。

Negative / inconclusive / stoppedでも、次の意思決定に再利用できるLearningを候補化できる。

## Step 7 — Acceptance Gate

Humanまたは独立Review Gateが確認。

Decision:

- Accept
- Reject
- Need evidence
- Narrow scope

Accept時だけKnowledgeへ`accepted`として保存する。

## Step 8 — MLP feedback

Accepted Learningを少なくとも1つへ接続する。

- Experience Hypothesis
- Vertical Slice
- Lovability Review
- Polish Loop
- Retention Validation
- Growth / Content方針

## Audit trail

最低限:

```yaml
experiment_id: string
proposal_ref: string
human_decision_ref: string
execution_receipt_ref: string
observation_refs: []
evaluation_ref: string
learning_candidate_ref: string
acceptance_decision_ref: string | null
```

## Stop conditions

- Human approval無し
- Execution Receipt無し
- Metric definition ref無し
- baseline / sample / windowが必要なのに欠落
- Guardrail Evidence無し
- Safety incident未解決
- PII / Raw相談の混入
- Maker / Evaluator / Acceptanceの独立性が担保できない

## Done

Closed Loopの1サイクル完了条件:

- Proposal追跡可能
- Human Approval記録
- Execution Receipt記録
- Observation Evidence追跡可能
- Independent Evaluation
- Learning Candidate
- Acceptance decision
- Next MLP / Experience Hypothesisへの接続先記録
