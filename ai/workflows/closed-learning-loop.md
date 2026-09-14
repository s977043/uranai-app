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
Learning Reviewer (reviewer != evaluator/maker)
  ↓
Human Gate
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

## Roles

### Maker / Proposal

Growth Agent等がExperiment Proposalを作る。

### Human Executor

Experiment開始・停止・外部公開・配信等の明示操作を行う。

### Evaluator

`evaluate-experiment` でResultを評価し、Learning Candidateを作る。

### Learning Reviewer

Candidateを独立レビューしHumanへ推薦する。

### Human Decision Owner

Accepted Learning化を最終判断する。

## Required independence

```text
proposal maker != learning reviewer
experiment evaluator != learning reviewer
learning reviewer != final human decision substitute
```

同一AIセッションを物理的に禁止できない場合でも、役割・入力・出力を分離し、自己承認しない。

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

- Metric definition変更
- identity requirement不成立
- comparison崩壊
- sample rule重大違反
- data lossで比較不能
- execution scopeがProposalと異なる

### Mixed result

Segment間で結果が相反する場合、全体一般化せずscopeを限定するか`need_more_evidence`とする。

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
- Metric definition ref不足
- Raw PII混入
- Safety violation未解決
- Experiment invalid
- Reviewer independence不成立
- Contradicting evidence未確認
- Human promotion decision無し

## Anti-patterns

- Experimentを実行したAgentが自己評価→自己承認→Knowledge更新
- Conversion改善だけで成功判定
- 失敗Experimentを捨てて成功だけ保存
- Candidateを大量生成することをKPI化
- Accepted Learningのscopeを後から暗黙に拡大
- Knowledge更新でループ終了し、MLP改善へ戻さない
