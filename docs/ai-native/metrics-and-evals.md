# Metrics & Evals

## 1. Metric hierarchy

### Product value

最上位は「利用量」ではなく、ユーザー価値の流れを測ります。

初期候補:

- First Reading Completion
- D1 / D7 Retention
- Repeat Reading Rate
- User-reported helpfulness / clarity
- Paid Conversion（制約付き指標）

`Paid Conversion` や `Repeat Reading Rate` 単独では成功とみなしません。Trust / Safetyと組み合わせて評価します。

### AI operations

- AI Execution Rate
- Human Operation Time
- Decision Lead Time
- Experiment Cycle Time
- Learning Reuse Rate

#### AI Execution Rate

```text
AIだけで完了した適格タスク / AI実行可能と定義した全タスク
```

分母を「全業務」にしないこと。Human Judgmentが必要な仕事まで自動化対象として扱わないためです。

#### Learning Reuse Rate

```text
Accepted Learningを根拠として利用した施策 / 検証対象施策
```

Knowledgeを増やすだけではなく、再利用されているかを見る指標です。

## 2. Guardrail metrics

以下は悪化させてはいけない指標です。

- Safety violation rate
- Unsupported claim rate
- High-risk advice rate
- User complaint rate
- Regeneration / rejection rate
- PII leakage count

依存を直接推定する単一指標は置きません。過度な連続利用、深夜帯の高頻度利用、課金行動等を必要に応じて複数のSignalとして扱い、安易な個人プロファイリングはしません。

## 3. Eval dimensions

### Analyst / VoC

- Evidence traceability
- Fact / inference separation
- Unsupported inference
- Sample bias awareness
- Confidence calibration
- Actionability

### Reading / Content

将来追加する評価軸:

- Faithfulness to deterministic result
- Brand alignment
- Non-deterministic wording
- Specificity
- Empathy
- Actionability
- Safety

### Growth / CRM

将来追加する評価軸:

- Brand alignment
- Evidence quality
- Manipulation risk
- Unsupported urgency / scarcity
- CTA clarity
- Safety

## 4. Evidence traceability

Factを含む出力は、どの入力・集計・観測から得たかを追跡できる必要があります。

推奨形式:

```yaml
finding:
  statement: "初回鑑定後の再訪率が低下している"
  type: fact
  evidence:
    - source: analytics.daily_retention
      window: 2026-09-01..2026-09-07
      value: 0.21
    - source: analytics.daily_retention
      window: 2026-09-08..2026-09-14
      value: 0.18
  confidence: high

hypothesis:
  statement: "次行動CTAの弱さが原因かもしれない"
  type: hypothesis
  evidence:
    - ref: finding-001
  confidence: low
```

FactとHypothesisを同じ文として出さないこと。

## 5. Regression policy

次を変更したら関連Evalを再実行します。

- Prompt
- Skill
- Agent Contract
- Model
- Tool definition
- Knowledge source
- Safety policy / guardrail
- Output schema

### Minimum regression set

Iteration 1では最低限、以下のfixtureを持てる設計にします。

- Evidenceが十分なケース
- Evidence不足ケース
- 相反するEvidence
- 少数サンプル
- PIIを含むRaw VoC
- 安全上問題のある相談
- FactとHypothesisが混在しやすいケース

## 6. Promotion criteria

Agent / Skillを次の自律レベルへ昇格させる条件:

1. Contractが明確
2. Regression fixtureがある
3. Eval結果が基準を継続して満たす
4. 失敗時に停止できる
5. 操作が監査可能
6. rollback可能
7. Human Gateを外す合理的根拠がある

基準を満たさない場合は、モデル性能が高くても自律範囲を広げません。
