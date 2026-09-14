# Assist Iteration — Multi-perspective Review Record

Tracking: #23 / PR #25

Iteration 3 Assistを、Product / Agent Architecture / Safety / Growth / Privacy / QA / Delivery の7視点でレビューした記録。

## Review conclusion

**Approved with changes.**

方向性は妥当。ただし、Observeで固定したMetric Contractの追跡性とMaker/Reviewer独立性がAssist側で弱くなっていたため修正した。

---

## 1. Product / MLP review

### Finding

Draft生成量やExperiment数が成果化すると、MLP Firstの「Core Experience / Lovability / Retention」よりExecution量が優先されるリスクがある。

### Decision

- Content/Growthの目的をUser Value / Learning Valueへ固定
- Execution PlanをMLP Firstへ接続
- Iteration 3はProduct ReleaseではなくDraft-only Assist
- Retention/RevenueはSafety/Helpfulnessと同時評価

### Status

Resolved.

---

## 2. Agent Architecture review

### Finding A — Reading self-review risk

Reading Quality Agentが鑑定生成も担当するとMaker/Checker分離に反する。

### Fix

- Reading Quality AgentをReviewer-onlyへ変更
- `generate_final_reading` / `self_fix_and_self_approve` を禁止

### Finding B — reviewer identity ambiguity

Content/Growth workflowでIndependent Reviewの主体が曖昧だった。

### Fix

- `reviewer != maker` をWorkflow Contract化
- Content/GrowthはHuman reviewerを既定
- ReadingはReading Quality Agent → Human Gate
- Makerが修正した場合は再Review必須

### Status

Resolved.

---

## 3. Safety review

### Finding

Deterministic Message Guardrailを通過したことを包括Safetyと誤認するリスク。

### Fix / confirmation

- PR #22でAPI責務を限定済み
- Content/Growth/Readingすべてで「guardrailは一層」と明示
- Contextual Review + Human Gateを維持
- High-stakes advice / future certainty / breakup directive / fear monetizationをfixture化

### Status

Resolved.

---

## 4. Growth / Experiment review

### Finding — Metric Contract traceability

Growth Agent / Skillの`target_metric`が文字列だけで、Observeで定義したMetric Contractを追跡できなかった。

このままだと、同名KPIの定義揺れや分母・window・identity requirementの欠落が起こり得る。

### Fix

- `metric_definition_ref` をtarget metricに必須化
- guardrail metricにも`metric_definition_ref`を要求
- missing definition fixtureでは`null`を明示し`needs_metric_definition`を期待
- validatorで参照必須をmachine-check

### Status

Resolved.

---

## 5. Privacy review

### Confirmation

- Raw VoC / consultation textは禁止input
- Content fixtureでSynthetic PIIの非転載を固定
- Growthで脆弱性を直接ターゲティングする属性利用を禁止
- high-anxiety / night等のfixtureは「拒否すべきケース」としてのみ使用
- 実ユーザーデータはfixtureへコミットしない

### Residual risk

実データ連携時のidentifier lifecycle / access controlはObserveからの残課題。Assistでは実データ接続しないためBlockerではない。

### Status

Resolved for current scope.

---

## 6. QA / Eval review

### Confirmation

Regression coverage:

- Analyze VoC: 6+
- Analyze Funnel: 6+
- Content: 5+
- Growth: 5+
- Reading Quality: 6+

Validatorで以下を固定:

- Evidence / PII / Safety expectation
- Growth metric definition ref
- Growth guardrail / stop condition
- vulnerability targeting block
- Reading fact contradiction block
- guardrail violation block
- safe readingでもHuman Gate

### Residual risk

現在の`eval:contracts`はfixture contract validationであり、モデル出力assertion runnerではない。

これは意図的。Model/Harness確定後にoutput assertionsを追加する。

### Status

Resolved for Iteration 3.

---

## 7. Delivery / DX review

### Finding

PR #24 MLP Firstと`docs/ai-native/README.md`が重なる可能性があった。

### Fix

- PR #24をレビュー・CI Green後に先行merge
- Assist READMEはPR #24の内容を含む最新版を基準に更新
- PR #25はmainをbaseにmergeable状態を確認

### Status

Resolved.

---

# Residual risks / next iteration

Iteration 3で意図的に残す。

1. Model output assertion runner未実装
2. Content/Growth専用Reviewer Agent未実装（Human reviewerを既定）
3. 鑑定生成Agent未実装
4. 外部Publish / CRM / price / charge操作未接続
5. 実データAnalytics未接続

これらをIteration 3で無理に入れると、Maker/Checker境界とControlled Autonomyの段階導入を壊すためScope outとする。

# Final checklist

- [x] Product / MLP整合
- [x] Maker / Reviewer分離
- [x] Safety境界
- [x] Growth Metric Contract追跡
- [x] Privacy制約
- [x] Regression fixture / validator
- [x] Delivery競合確認
- [ ] Latest CI Green
- [ ] Final PR diff review

CIと最終差分レビューがGreenなら、Iteration 3はマージ可能。
