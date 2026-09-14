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
Experiment Result Record
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

### Invalid experiment

以下はLearning根拠として利用しない。

- Metric Registryでrefを解決できない
- Metric definition変更
- identity requirement不成立
- comparison崩壊
- sample rule重大違反
- data lossで比較不能
- execution scopeがProposalと異なる

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
- Raw PII混入
- Safety violation未解決
- Experiment invalid
- Reviewer independence不成立
- Candidate provenance不足
- Contradicting evidence未確認
- Human promotion decision無し

## Anti-patterns

- Experiment EvaluatorがCandidate生成→自己レビュー→自己承認→Knowledge更新
- Conversion改善だけで成功判定
- 失敗Experimentを捨てて成功だけ保存
- Candidateを大量生成することをKPI化
- Accepted Learningのscopeを後から暗黙に拡大
- Knowledge更新でループ終了し、MLP改善へ戻さない
