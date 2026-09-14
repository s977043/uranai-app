# Experiment / Learning Contract

Tracking: #26

## Purpose

AI-Native運用で、Experiment ProposalからAccepted Learning候補までを**追跡可能な閉ループ**にする。

Iteration 4ではAIは本番Experimentを実行しない。Humanが承認・実行し、そのExecution Receiptと観測結果をAIが評価する。

## Lifecycle

```text
Experiment Proposal
  ↓
Human Decision
  ↓
Manual Execution Receipt
  ↓
Observation / Result Evidence
  ↓
Independent Evaluation
  ↓
Learning Candidate
  ↓
Human / Independent Acceptance Gate
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

## 1. Experiment Proposal

Growth Agent / `design-growth-experiment` のProposalを入力とする。

最低限:

```yaml
experiment_id: string
proposal_ref: string
hypothesis: string
evidence_refs:
  - string
target_metric: string
metric_definition_ref: string
guardrails:
  - metric: string
    metric_definition_ref: string
comparison: string
sample_or_duration_rule: string
stop_conditions:
  - string
risk: low | medium | high
reversibility: easy | moderate | hard
status: proposal
```

## 2. Human Decision

AIは次の状態へ自己遷移できない。

```yaml
human_decision:
  decision: approve | reject | revise
  decided_by: string
  decided_at: ISO-8601
  rationale: string
```

`approve`無しでExecution Receiptを作成しない。

## 3. Manual Execution Receipt

「何を予定したか」と「実際に何をしたか」を分離する。

```yaml
execution_receipt:
  experiment_id: string
  executed_by: string
  executed_at: ISO-8601
  execution_scope: string
  implementation_ref: string
  actual_change: string
  deviations_from_proposal:
    - string
  stop_condition_triggered: boolean
  stopped_at: ISO-8601 | null
  stop_reason: string | null
```

### Rules

- `executed_by` はHumanまたは明示的に承認された外部実行主体。Iteration 4ではHumanのみ。
- AIはExecution Receiptを捏造しない。
- ProposalからのDeviationを隠さない。
- Raw相談 / PII / secretsをReceiptへ含めない。

## 4. Observation / Result Evidence

```yaml
observation:
  experiment_id: string
  window: string
  sample_size: number | null
  target_metric:
    name: string
    metric_definition_ref: string
    baseline: number | null
    result: number | null
  guardrails:
    - name: string
      metric_definition_ref: string
      baseline: number | null
      result: number | null
  evidence_refs:
    - string
  missing_data:
    - string
```

Missing dataを0として扱わない。

## 5. Evaluation

EvaluatorはProposal Makerと論理的に分離する。初期運用では既存Analyst Agent + `evaluate-experiment` Skillを使う。

```yaml
evaluation:
  experiment_id: string
  result: positive | negative | inconclusive | stopped
  facts:
    - statement: string
      evidence_refs:
        - string
  target_result: improved | worsened | unchanged | unknown
  guardrail_results:
    - metric: string
      result: improved | worsened | unchanged | unknown
  causal_claim_allowed: boolean
  limitations:
    - string
  recommendation: adopt | reject | iterate | gather_more_evidence
  learning_candidate_allowed: boolean
  evaluated_by: string
```

### Evaluation rules

- target改善 + Safety/Trust guardrail悪化 → `adopt`禁止
- Safety incident / stop condition trigger → 原則`stopped`
- baseline / metric definition / sample / windowが不足 → `inconclusive`またはABSTAIN
- randomized / controlled design等の根拠なしに因果を断定しない
- negative resultも有用なEvidenceとして保存する

## 6. Learning Candidate

AIは`candidate`まで作れる。

```yaml
learning_candidate:
  id: string
  experiment_id: string
  status: candidate
  statement: string
  evidence_refs:
    - string
  scope: string
  confidence: low | medium | high
  contradicting_evidence:
    - string
  limitations:
    - string
  revisit_when:
    - string
  accepted_by: null
  accepted_at: null
```

## 7. Acceptance Gate

Accepted Learningへの昇格はHumanまたは独立Review Gateのみ。

確認:

- Evidence traceability
- Experiment execution fidelity
- Metric Contract fidelity
- Guardrail result
- causal claim boundary
- contradicting evidence
- scope / confidence
- Safety / Brand

昇格後:

```yaml
status: accepted
accepted_by: string
accepted_at: ISO-8601
```

## 8. MLP feedback

Accepted LearningはKnowledgeへ貯めるだけで終わらせず、次のどれかへ接続する。

- Experience Hypothesis更新
- Vertical Slice改善
- Lovability Review観点
- Polish Loop
- Retention Validation
- Growth / Content方針

## Prohibited

- AIがHuman approvalを捏造
- AIがExecution Receiptを捏造
- AIがLearning Candidateを自己承認
- guardrail悪化を無視してtarget改善だけでadopt
- negative resultを削除
- PII / Raw VoCをExperiment artifactへ埋め込む
- Experiment resultから未検証の因果をAccepted Learning化
