# Workflow: Closed Learning Loop

## Goal

Humanが承認・実行したExperimentを、Evidence付きLearningへ変換し、次のExperience Hypothesis / MLP Polishへ戻す。

Iteration 4では外部Experimentを自動実行しない。

## Flow

```text
Evidence / Accepted Learning
  ↓
Hypothesis
  ↓
Growth Experiment Proposal
  ↓
Human Approval
  ↓
Manual / external execution
  ↓
Experiment Result Record + Execution Receipt
  ↓
evaluate-experiment
  ↓
Learning Candidate
  ↓
Learning Reviewer
  ↓
Human Gate
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

## Roles

### Proposal Maker

Growth Agent等がExperiment Proposalを作る。

### Human Executor

Experiment開始・停止・外部公開・配信等の明示操作を行う。

実行後はProposalをそのまま完了記録として扱わず、実際に行った変更をExecution Receiptとして残す。

### Experiment Evaluator / Candidate Maker

`evaluate-experiment` でResultを評価し、Learning Candidateを作る。

Learning CandidateにはEvaluatorを `candidate_maker_id` として記録する。

### Learning Reviewer

Candidateを独立レビューしHumanへ推薦する。

### Human Decision Owner

Accepted Learning化を最終判断する。

## Required independence

```text
candidate_maker_id = experiment evaluator
reviewer_id != candidate_maker_id
learning reviewer != final human decision substitute
```

Proposal MakerとLearning Reviewerも可能な限り分離する。ただしIteration 4で最重要なのは、**Learning Candidateを作ったEvaluatorが自分のCandidateを自己レビューしないこと**。

同一AIセッションを物理的に禁止できない場合でも、役割・入力・出力・provenanceを分離し、自己承認しない。

## Metric contract

Experiment Proposal / Result / Evaluationで使う`metric_definition_ref`は、[`ai/contracts/metric-registry.json`](../contracts/metric-registry.json) のstable IDを使う。

```text
metric:<stable-id>
```

Registryに存在しない、または`active`でないMetricを通常のExperiment判定に使わない。

## Execution fidelity contract

Experiment Result Recordの`execution`は、Proposalではなく**実際に実施した変更のReceipt**として扱う。

最低限:

```yaml
execution:
  approved_by: human
  executed_at: ISO-8601
  execution_scope: string
  implementation_ref: string
  actual_change: string
  deviations_from_proposal:
    - string
  stop_condition_triggered: boolean
  stop_reason: string | null
  execution_ref: string
```

Rules:

- Proposalの内容を実行事実としてコピーしない
- `implementation_ref`で実行内容を追跡可能にする
- `actual_change`と`deviations_from_proposal`を分離する
- 差分無しでも`deviations_from_proposal: []`を明示する
- material deviationはEvaluatorが`validity` / scope / limitationsへ反映する
- Evaluator / ReviewerはReceiptを書き換えない
- stop condition発火時は`stop_reason`を必須にする
- Raw PII / consultation text / secretsをReceiptへ保存しない

## State transitions

### Experiment

```text
proposal
  ↓ Human approval
approved
  ↓ explicit execution
running
  ├── stopped
  ├── invalid
  └── completed
        ↓
      evaluated
```

AIは`proposal → approved`と`approved → running`を自動遷移させない。

### Learning

```text
candidate
  ↓
under_review
  ├── rejected
  ├── need_more_evidence
  └── human_approved
          ↓
    accepted_learning
```

AIは`human_approved` / `accepted_learning`へ自動遷移しない。

## Evaluation rules

### Success is not a single metric

Target metricが改善しても、Safety / Trust / Helpfulness等のguardrailが悪化した場合は成功として昇格させない。

### Execution fidelity before outcome

Metric結果を見る前に、Proposalと実施内容が同一Experimentとして評価可能か確認する。

- 差分無し / 追跡可能 → `execution_fidelity: matched`
- 差分ありだが影響範囲を限定可能 → `execution_fidelity: deviated` + 原則`validity: limited`
- 実施内容不明 → `execution_fidelity: unknown` + Evidence追加要求
- 差分がcomparison条件やExperiment identityを破壊 → `validity: invalid`

Business metricが改善していてもExecution fidelity問題を上書きしない。

### Invalid experiment

以下はLearning根拠として利用しない。

- Metric Registryでrefを解決できない
- Metric definition変更
- identity requirement不成立
- comparison崩壊
- sample rule重大違反
- data lossで比較不能
- execution scopeがProposalと重大に異なる
- implementation ref / actual changeを確認できず実施事実を再現できない

### Mixed result

Segment間で結果が相反する場合、全体一般化せずscopeを限定するか`need_more_evidence`とする。

## Learning Candidate provenance

最低限を保持する。

```yaml
candidate_id: string
candidate_maker_id: string
source_evaluation_refs:
  - string
status: candidate
```

Learning Reviewでは `reviewer_id != candidate_maker_id` を必須とする。

## Human promotion record

HumanがAccepted Learningへ昇格するときは最低限を記録する。

```yaml
learning_id: string
candidate_ref: string
statement: string
scope: string
evidence_refs:
  - string
confidence: low | medium | high
accepted_by: human
accepted_at: YYYY-MM-DD
decision_reason: string
revisit_when:
  - string
next_use:
  - experience_hypothesis | mlp_polish | product | content | growth
```

## Return to MLP loop

Accepted LearningをKnowledgeへ置いて終わりにしない。

```text
Accepted Learning
  ↓
Experience Hypothesis update
  or
Polish Loop candidate
  ↓
Vertical Slice / MLP
  ↓
User Observation / Retention Validation
  ↓
Next evidence
```

## Stop conditions

- Evidence ref不足
- Metric definition ref不足 / Registry未登録
- Execution Receipt不足 / implementation ref不明
- Raw PII混入
- Safety violation未解決
- Experiment invalid
- Reviewer independence不成立
- Candidate provenance不足
- Contradicting evidence未確認
- Human promotion decision無し

## Anti-patterns

- Proposalをそのまま「実行した変更」と見なす
- Execution deviationを隠してMetric改善だけ採用する
- Experiment EvaluatorがCandidate生成→自己レビュー→自己承認→Knowledge更新
- Conversion改善だけで成功判定
- 失敗Experimentを捨てて成功だけ保存
- Candidateを大量生成することをKPI化
- Accepted Learningのscopeを後から暗黙に拡大
- Knowledge更新でループ終了し、MLP改善へ戻さない
