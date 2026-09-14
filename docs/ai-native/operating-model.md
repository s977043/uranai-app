# Operating Model

## 1. Target model

```text
                         Human Owner
                             │
                  Strategy / Approval
                             │
                    Decision Queue
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     Analyst Agent      VoC Analyst       Future Agents
          │                  │         Growth / Content /
          │                  │         CRM / Product /
          └──────────┬───────┘         Reading Quality
                     │
                Evidence Layer
                     │
          Metrics / VoC / Experiments
                     │
              Accepted Learning
                     │
               Knowledge Layer
```

Iteration 1では Analyst / VoC Analyst のみを対象にします。Orchestratorは導入しません。

## 2. Why no Orchestrator yet

各AgentのInput / Output / Eval / Escalationが定まる前に司令塔を置くと、万能Agent化しやすく、失敗原因も追跡できません。

導入条件:

- 主要SkillのI/O Contractが安定している
- Evidence traceabilityが担保されている
- 各Agentの評価方法がある
- Human Gateの対象が明確
- 失敗時の停止条件がある

## 3. Agent Contract

すべてのAgentは次を明示します。

```yaml
agent:
  name: string
  purpose: string

inputs:
  - source

outputs:
  - artifact

allowed_actions:
  - read
  - analyze
  - draft

prohibited_actions:
  - publish
  - send_to_user
  - change_price
  - charge
  - modify_production

approval_required:
  - external_publish
  - user_communication
  - pricing_change
  - irreversible_action

evidence:
  required: true
  rule: "fact and inference must be distinguishable"

evaluation:
  - evidence_traceability
  - unsupported_inference
  - brand_alignment
  - safety

failure:
  on_missing_evidence: abstain
  on_policy_conflict: escalate
```

## 4. Decision Queue

AI-Native運用では、人間へ「タスク一覧」を渡すのではなく、判断が必要な項目を集約したDecision Queueを渡します。

例:

```text
P0: 初回鑑定後の離脱増加
Evidence: 直近7日で first_reading → second_session が -12%
Hypothesis: 鑑定結果後の次行動が不明確
Proposal: CTA A/B test
Expected impact: D1 retention
Risk: low
Decision: Approve / Reject / Need evidence
```

必須要素:

- Evidence
- Fact / Hypothesisの分離
- Expected impact
- Risk
- Reversibility
- Human decision

## 5. Learning model

Knowledgeへ直接書き込めるのはAccepted Learningだけです。

```text
Observation
   ↓
Evidence
   ↓
Hypothesis
   ↓
Experiment / Review
   ↓
Result
   ↓
Accepted Learning
   ↓
Knowledge
```

禁止:

- SNSで見た一般論をそのまま自社Knowledgeにする
- 単一ユーザーの発言を全体傾向として記録する
- Agentの推測を事実として保存する

## 6. Knowledge classes

| Class | 例 | Git保存 |
| --- | --- | --- |
| Brand | 世界観、文体、原則 | 可 |
| Product | 仕様、KPI定義 | 可 |
| Fortune | 占術ルール、解釈方針 | 可 |
| Decision | ADR、採用/棄却理由 | 可 |
| Experiment | 仮説、結果、学習 | 集約後可 |
| VoC insight | 匿名化・集約した傾向 | 可 |
| Raw VoC | 生の相談、問い合わせ | 原則不可 |
| PII / secrets | 氏名、連絡先、認証情報等 | 不可 |

## 7. Autonomy levels

### L0 — Manual
AIは使わない。

### L1 — Assist
AIが下書き、Humanが実行。

### L2 — Propose
AIがEvidence付き提案、Humanが判断。

### L3 — Controlled execution
低リスク・可逆操作のみAIが実行。監査可能にする。

### L4 — Autonomous loop
検知→判断→実行→評価まで自律。十分なEvalと停止条件がある領域のみ。

Iteration 1はL1〜L2です。

## 8. Planned agents

将来候補:

- Growth
- Content
- CRM
- Product
- Reading Quality
- Safety Judge
- Orchestrator

追加条件は「役割名が欲しくなったとき」ではなく、独立したInput/Output/Evalを持つ責務が確認できたときとします。
