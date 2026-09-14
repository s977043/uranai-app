# AI-Native Fortune Business OS

このディレクトリは、`uranai-app` を単なる「AI機能付き占いアプリ」ではなく、**AIが日常Executionを進め、人間が世界観・ユーザー価値・倫理・重要判断に集中する事業OS**として育てるための設計正本です。

## 位置づけ

- 開発ルール: [`AGENTS.md`](../../AGENTS.md)
- プロダクト開発: [`docs/product-development.md`](../product-development.md)
- Product / Brand: [`docs/concept-board.md`](../concept-board.md)
- AI-Native事業運用: 本ディレクトリ

競合時は、実装手順は`AGENTS.md`、ユーザー体験は`concept-board.md`、プロダクト開発プロセスは`product-development.md`を優先します。

## North Star

> AIが日常的なExecutionを進め、人間は世界観・ユーザー価値・倫理・重要判断に集中する占い事業OSを作る。

AI稼働率や人間ゼロを目的にしません。

## Learning loop

```text
Acquire → Experience → Reading → Retain → Monetize
                         ↓
                    VoC / Behavior
                         ↓
Analyze → Hypothesis → Experiment → Evaluation → Learning
                         └──────────────→ Product / Growth / Reading
```

学習は [`product-development.md`](../product-development.md) の `Experience Hypothesis → Vertical Slice → Lovability Review → User Observation → Polish Loop → MLP Release → Retention Validation` へ戻します。

## Design principles

1. **Deterministic facts / AI interpretation** — 占術上のFactはコード、AIは解釈・分析・提案。
2. **Execution / Judgment separation** — AIはExecution、人間は重要判断。
3. **Maker / Checker separation** — 自己生成・自己承認をしない。
4. **Evidence-first learning** — 仮説をKnowledgeへ直書きしない。
5. **Controlled autonomy** — 低リスク・可逆領域から段階的に広げる。

## Core documents

- [Product Development — MLP First](../product-development.md)
- [North Star](./north-star.md)
- [Operating Model](./operating-model.md)
- [Execution Plan](./execution-plan.md)
- [Safety Policy](./safety-policy.md)
- [Metrics & Evals](./metrics-and-evals.md)
- [Experiment / Learning Contract](./experiment-contract.md)
- [`ai/evals/`](../../ai/evals/README.md)

## Iteration 2 — Observe

- [Event Taxonomy](./event-taxonomy.md)
- [Funnel Metrics](./funnel-metrics.md)
- [`Weekly Learning Report`](../../ai/workflows/templates/weekly-learning-report.md)

分析の入力・Metric・identity・Eval境界を固定しました。

## Iteration 3 — Assist

Agents:

- [`Content Agent`](../../ai/agents/content.md) — Draft Maker
- [`Growth Agent`](../../ai/agents/growth.md) — Experiment / Draft Maker
- [`Reading Quality Agent`](../../ai/agents/reading-quality.md) — Reviewer only

Skills:

- [`draft-content`](../../ai/skills/draft-content/SKILL.md)
- [`design-growth-experiment`](../../ai/skills/design-growth-experiment/SKILL.md)
- [`review-reading-quality`](../../ai/skills/review-reading-quality/SKILL.md)

Workflow:

- [`Draft → Review → Human Gate`](../../ai/workflows/draft-review-publish.md)

`reviewer != maker`を必須とし、外部Publish/Send/Price changeはHuman Gateを維持します。

## Iteration 4 — Closed Learning Loop

Humanが承認・実行したExperimentを、AIがEvidence付きで評価しLearning Candidateまで閉じます。

```text
Growth Proposal
  ↓
Human Approval / Manual Execution
  ↓
Execution Receipt
  ↓
Observation / Evidence
  ↓
Analyst Evaluation
  ↓
Learning Candidate
  ↓
Human / Independent Acceptance Gate
  ↓
Accepted Learning
  ↓
Next Experience Hypothesis / MLP Polish
```

Contracts / Skills / Workflow:

- [Experiment / Learning Contract](./experiment-contract.md)
- [`evaluate-experiment`](../../ai/skills/evaluate-experiment/SKILL.md)
- [`prepare-learning-candidate`](../../ai/skills/prepare-learning-candidate/SKILL.md)
- [`Closed Learning Loop`](../../ai/workflows/closed-learning-loop.md)

重要な境界:

- Experiment実行はIteration 4ではHuman-only
- EvaluatorはProposal Makerと別主体
- target / guardrailはMetric Contractへ追跡可能
- negative / inconclusive / stoppedもEvidenceとして保持
- AIはLearning Candidateまで。Accepted Learningへの自己昇格禁止
- Accepted LearningはMLPの次のExperience Hypothesis / Polish / Retentionへ戻す

## Safety

Deterministic Message Guardrailは既知NG表現を検出する**一層**であり、包括Safety保証ではありません。Contextual ReviewとHuman Gateを置き換えません。

## Iteration status

- Foundation: Issue #18 / PR #19 — 完了
- Observe: Issue #20 / PR #21 — 完了
- Message Guardrail: PR #22 — 完了
- MLP First: PR #24 — 完了
- Assist: Issue #23 / PR #25 — 完了
- Closed Learning Loop: Issue #26 — 実装・評価中

## 関連

- 数秘術ドメイン: PR #16
