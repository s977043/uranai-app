# Execution Receipt Fidelity — Multi-perspective Review Record

Tracking: #40 / PR #41  
Source review: PR #29 (superseded by PR #28)

## Review purpose

PR #29をそのままmergeせず、現行Closed Learning Loopより良かった**Execution Receipt fidelity**だけを抽出し、現在のより強いContractを壊さず統合できているかを確認する。

## Source PR decision

PR #29はmergeしない。

理由:

- PR #28で同じIterationがより強いContractとしてmerge済み
- #29はstable Metric Registry以前の設計
- execution status / evaluation validity / outcomeの分離が弱い
- Candidate provenance / independent Learning Reviewerが現mainより弱い
- Accepted LearningをHuman-onlyとする現行境界より弱い記述がある
- current mainからdivergedしており、正本・Regressionを巻き戻す可能性がある

Carry forwardしたのはExecution Receiptの実行追跡性のみ。

## Review perspectives

### 1. Product / MLP

**Conclusion: Approve.**

Execution ReceiptはExperiment数を増やすためではなく、Learningの根拠を信頼できる状態にするための追加。

- Proposalと実施内容の差分を残せる
- 「結果が良かった」だけでLearningを作らない
- Accepted Learning → MLP Polishの再利用品質を上げる

Product runtime / UIには変更なし。

### 2. Agent Architecture

**Conclusion: Approve.**

維持できている境界:

- Proposal Maker / Evaluator / Learning Reviewer / Human Decision Owner
- `candidate_maker_id` / `source_evaluation_refs`
- Reviewer independence
- Accepted LearningのHuman-only Gate

EvaluatorはExecution Receiptを変更せず、`execution_fidelity`を評価結果として追加するだけ。

### 3. Safety

**Conclusion: Approve after manual-stop fix.**

- Safety stopをBusiness metric改善で上書きしない
- `stop_condition_triggered=true`なら`status: stopped`必須
- stop reasonを保持
- HumanがData Qualityや運用上の理由で明示停止する経路も維持

Review finding:

初期validatorは`stop_condition_triggered=false`なら`stop_reason=null`を強制し、Human manual stopを表現できなかった。

Fix:

- `status: stopped`ならstop reason必須
- predefined stop-condition stopとmanual stopを分離
- manual stop専用fixtureを追加

### 4. Data / Privacy

**Conclusion: Approve with bounded operational text.**

Execution Receiptに自由記述項目は増えるが、目的は実行事実の要約でありUser data保存ではない。

禁止をContract化:

- Raw consultation text
- PII
- secrets

`implementation_ref`を優先し、Raw EvidenceをReceiptへ複製しない。

### 5. Experimentation

**Conclusion: Approve.**

重要な改善:

```text
Proposal
  ≠
Actual Execution
```

- 差分無し: `matched`
- 差分あり、影響限定: `deviated` + 原則`limited`
- 実施内容不明: `unknown` + Evidence要求
- comparison / Experiment identity破壊: `invalid`

Deviationの存在だけで自動invalidにしないため、現実のExperiment運用を過度に硬直化しない。

### 6. QA / Eval

**Conclusion: Approve after fixes.**

Regression:

- existing 6 Evaluate Experiment casesをExecution Receipt対応
- material execution deviation case
- Human manual stop case
- triggered stop condition case
- approval/start/end順序
- canonical ISO timestamp
- real calendar date validation

Review finding:

`Date.parse`だけでは存在しない日付を正規化して通す可能性があった。

Fix:

`YYYY-MM-DD`をUTC dateへ変換後、`toISOString().slice(0, 10)`との厳密一致を要求。

Validatorは既存`validate-fixtures.mjs`へ詰め込まず、`validate-execution-receipt.mjs`として責務分離した。

### 7. Delivery

**Conclusion: Approve subject to final-head CI / merge state.**

- dependency追加なし
- DB / API / Product side effectなし
- Metric Registry変更なし
- additive Contract hardening
- PR単位でrevert可能

## Blockers found and resolved

1. Manual stopを表現できないstop reason contract
2. Impossible calendar dateを通す可能性があるdate validation

両方PR #41内で修正済み。

## Final boundary

このReviewが承認するもの:

> **Closed Learning LoopのExecution Receipt fidelity hardening**

承認しない / 変更しないもの:

- Experiment自動実行
- Accepted Learning自動承認
- Metric Registryの意味変更
- Product telemetry
- Operational Evidence Source
- Controlled Autonomy

## Next path

本線は変更しない。

```text
Execution Receipt hardening (#40)
  ↓
Operational Evidence Source (#39)
  +
Shared / production surface (#15)
  ↓
Actual User Observation
  ↓
Polish Loop
  ↓
Manual Real Pilot
  ↓
Controlled Autonomy Entry Review
```

## Final validation

PR final headで以下を確認して完了判定する。

- npm ci
- lint
- typecheck
- test
- AI eval contracts
- build
- mergeable
- unresolved review thread 0
