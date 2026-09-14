# Observe Iteration — Multi-perspective Review Record

Tracking: #20 / PR #21

Iteration 2の実装後に、Product / Data / Privacy / Agent Architecture / QA / Safety / Delivery の7視点で再レビューした記録。

## Review conclusion

**Approved after changes.**

初期実装の方向性は妥当だったが、cross-session identityとKPI定義に実装可能性上の矛盾があり、レビュー中に修正した。最新実装はCI Green、未解決review threadなし。

---

## 1. Product review

### Finding

`First Reading Completion` をsession-levelの `reading_started → reading_completed` だけで計算していた。

しかし「ユーザーにとって初回」を判断するには過去sessionとの照合が必要で、session IDだけでは計算不能。

### Fix

- `First Reading Completion` をcross-session identity必須に変更
- cross-session identity無しで観測可能な別KPIとして `Reading Flow Completion` を定義
- 両者を相互代用しないルールを追加

### Status

Resolved.

---

## 2. Data / Analytics review

### Finding

D1 / D7 Return・Repeat Reading・7日Paid Conversionもsessionをまたぐ識別が必要だが、Event envelopeに `anonymous_session_id` しか存在しなかった。

### Fix

`anonymous_visitor_id` をconditional fieldとして追加。

条件:

- random pseudonymous identifier
- PIIから決定論的生成しない
- authentication IDをそのまま使わない
- retention等の明示目的に限定
- retention / rotation / deletionを実装前にPrivacy review

利用できない場合はcross-session KPIを `N/A` とする。

### Status

Resolved.

---

## 3. Privacy review

### Finding

Retention計測のために識別子を追加すると、過剰なユーザー追跡へ拡張されるリスクがある。

### Fix

- cross-service tracking禁止
- deterministic PII hash禁止
- consultation raw text禁止
- identifierの保持・rotation・削除は本番接続前の明示review対象
- identifierを安全に利用できない場合はKPIを計算しない

### Status

Resolved for contract phase. 実装時に再レビュー必須。

---

## 4. Agent Architecture review

### Finding

`eval:contracts` がモデル出力を評価しているように読める可能性があったが、現状はfixture contract validatorのみ。

特定モデルSDKへこの段階でrunnerを結合すると、Harness確定前に依存が固定される。

### Fix

Evalを3層に明示。

1. Fixture contract validation — 現在CI実行
2. Output assertions — Harness確定後
3. Human review — 現在利用可能

### Status

Resolved.

---

## 5. QA review

### Finding

First Reading metric修正後、既存Funnel fixtureとSynthetic Weekly Reportが旧定義を参照していた。

### Fix

- session fixtureを `Reading Flow Completion` に変更
- `must_not_call_metric_first_reading_completion` expectation追加
- metric fixtureに `identity_requirement` を追加
- validatorでidentity contractを検証
- Synthetic report / report templateを新定義へ更新

### Status

Resolved.

---

## 6. Safety / Growth review

### Finding

Paid Conversion改善fixtureでHelpfulness悪化を同時に持たせているが、KPI体系全体でもRevenueだけを成功扱いしないことが必要。

### Confirmation / Fix

- Paid ConversionにHelpfulness / Safety guardrail
- Repeat Readingにmanipulation risk
- cross-session利用増加をUser Valueと同義にしない
- High-risk VoCをmonetizationへ接続しないfixtureを維持

### Status

Resolved.

---

## 7. Delivery / Developer Experience review

### Finding

`package.json` の `verify` に `eval:contracts` を追加した一方、`AGENTS.md` とroot `README.md` が旧定義（lint → typecheck → test）のままだった。

### Fix

- `AGENTS.md` のverify定義を更新
- リリース前チェックへ `eval:contracts` を追加
- root `README.md` にcommandと責務境界を追加
- `ai/evals/*` をAI-Native変更対象に明示

### Status

Resolved.

---

# Validation

GitHub Actions:

- `npm ci` ✅
- lint ✅
- typecheck ✅
- test ✅
- AI eval contracts ✅
- build ✅

PR review state:

- mergeable ✅
- unresolved review threads: 0 ✅
- application `src/*` changes: 0 ✅
- external dependency additions: 0 ✅

# Residual risks

Iteration 2では意図的に残す。

1. **Output assertion runner未実装**
   - Model/Harness未確定のため。Iteration 3以降で実行方式確定後に追加。

2. **実データのidentifier lifecycle未実装**
   - Analytics接続前にPrivacy設計が必要。

3. **本番Event schema enforcement未実装**
   - SDK/DB導入時にschema validatorを追加する。

4. **Metric threshold未確定**
   - 実データ無しで根拠のない閾値を置かない。

これらはIteration 2のスコープ外であり、現在のPRをBlockするものではない。

# Final checklist

- [x] Product semantics reviewed
- [x] Analytics identity reviewed
- [x] Privacy constraints reviewed
- [x] Agent/Eval boundary reviewed
- [x] Regression fixtures reviewed
- [x] Safety / monetization guardrails reviewed
- [x] Developer documentation reviewed
- [x] Latest implementation CI Green
- [x] PR final diff reviewed
- [x] All blocking findings resolved

**Conclusion: Iteration 2 is ready to merge.**
