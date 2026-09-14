# Multi-perspective Review Record

AI-Native Foundation計画を、異なる失敗モードを持つ7視点でレビューした記録です。

## Review summary

初期案の最大の問題は、**最初から多数AgentとOrchestratorを作ろうとしていたこと**です。

レビュー後は、Iteration 1を以下へ縮小しました。

- North Star / 非目標
- Deterministic / AI / Human境界
- Safety
- Metrics / Evals
- Analyst / VoC Analyst
- analyze-voc / analyze-funnel
- Weekly Learning Loop

これにより既存のアプリ開発を止めず、将来の自律化に必要な契約を先に検証できます。

---

## 1. Product / Strategy review

### Concern

Agent数や自動化率が成功指標になると、ユーザー価値と関係の薄いExecutionが増える。

占いアプリは `concept-board.md` で「当てるより、整う」を掲げており、単純な利用量最大化とは一致しない。

### Decision

- User Value Flowを最優先
- AI Execution Rateは補助指標
- Repeat / Paid ConversionはTrust / Safetyとセットで評価
- Orchestratorを後回し

### Status

Resolved.

---

## 2. Architecture / Agent Engineering review

### Concern

万能Agentに次を持たせると自己承認構造になる。

```text
Generate
→ Evaluate
→ Execute
→ Learn
→ Rewrite own policy
```

原因分析・Regression・権限境界が弱くなる。

### Decision

- Maker / Checker分離
- Agentは自分のcandidateをAccepted Learningへ昇格不可
- Iteration 1はL2 Proposeまで
- Agent追加は独立I/O/Evalが定義できる場合のみ

### Status

Resolved.

---

## 3. Safety / Ethics review

### Concern

占いは不安、孤独、重要な意思決定、高額課金と近く、Growth最適化だけで危険な体験になり得る。

### Decision

SafetyをGrowth / CRM / Readingより上位制約にする。

Hard Block:

- 未来断定
- 医療 / 法律 / 投資等のHigh-stakes advice
- 恐怖による課金
- 依存促進
- AIを人間鑑定と偽る

PR #17の文言ガードレールはSafetyの決定論的一層として将来利用する。

### Status

Resolved.

---

## 4. Growth / Revenue review

### Concern

CVR / LTV / 投稿反応を強く最適化すると、不安を刺激する方が短期成果を出す可能性がある。

### Decision

- Revenueは制約付きKPI
- Manipulation riskを将来Growth Evalへ含める
- High-risk状態を高額商品へ直接Routingしない
- 架空の緊急性・希少性は禁止

### Status

Resolved.

---

## 5. Data / Privacy / Security review

### Concern

VoCや相談本文には、本人が明示していなくても健康、恋愛、家族、金銭等のセンシティブ情報やPIIが含まれ得る。

Git Knowledgeへそのまま保存すると、長期保持・複製・アクセス範囲の問題が生まれる。

### Decision

- Raw VoCとAccepted Knowledgeを分離
- Raw VoCは原則Gitへ保存しない
- Knowledgeは匿名化・集約したInsight中心
- PII / secretsはGit Knowledge禁止
- Agent inputは目的に不要な識別子を除去

### Remaining

実データ接続前にRetention / deletion / access controlの実装設計が必要。

### Status

FoundationとしてResolved. 実データ接続時に再レビュー。

---

## 6. QA / Eval review

### Concern

「良さそうな出力」の目視だけでは、Model / Prompt / Skill変更時のRegressionを検知できない。

### Decision

Eval軸:

- Evidence traceability
- Unsupported inference
- Fact / hypothesis separation
- Safety
- Brand alignment
- PII handling

変更トリガー:

- Prompt
- Skill
- Agent Contract
- Model
- Tool definition
- Knowledge source
- Safety policy

### Remaining

Iteration 2で匿名fixtureとpass/fail基準を実測して固定する。

### Status

Partially resolved; fixture実装はIteration 2。

---

## 7. Developer Experience / Delivery review

### Concern

`AGENTS.md`、Copilot instructions、AI-Native docsの複数正本化。

またPR #16 / #17と同時進行のため、同じアプリコードを触ると競合しやすい。

### Decision

正本を役割で分離する。

- 開発ルール: `AGENTS.md`
- Product / Brand: `docs/concept-board.md`
- AI-Native運用: `docs/ai-native/`

Iteration 1はアプリ実行コードを変更せず `docs/` / `ai/` を中心にする。

### Status

Resolved.

---

# Review conclusion

## Approved with changes

初期案の方向性は妥当。ただし、「複数Agentをまず作る」から「**Contract / Evidence / Safety / Eval / Learning Loopをまず作る**」へ順序を変更した。

## Key changes from initial plan

1. 8 Agent同時導入 → Analyst / VoC Analystのみ
2. Orchestrator初期導入 → 最終フェーズへ延期
3. Knowledge蓄積 → Accepted Learning Gateを追加
4. 自動実行 → L1/L2から開始
5. Engagement/Revenue中心 → User Value + Trust/Safety制約
6. Raw VoC保存 → Git保存禁止、匿名/集約Insightのみ
7. Promptレビュー中心 → Regression Evalを設計要件化

この変更後の計画でIteration 1を進める。
