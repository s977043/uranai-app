# Funnel Metrics

Tracking: #20

## Purpose

`Analyst` / `analyze-funnel` が、曖昧なKPI名ではなく **numerator / denominator / window / exclusions / guardrail** を明示した定義で分析できるようにする。

## Metric contract

すべてのKPIは最低限、次を持つ。

```yaml
name: string
purpose: string
numerator: string
denominator: string
window: string
exclusions:
  - string
segments:
  - string
guardrails:
  - string
source_events:
  - string
identity_requirement: session | cross_session | none
```

`cross_session` 指標は、Privacy review済みの `anonymous_visitor_id` が利用可能な場合だけ計算する。利用できない場合は推測せず `N/A` とする。

## 1. First Reading Completion

### Purpose

匿名訪問者にとって**初回の鑑定開始**から結果表示まで到達できているかを見る。

Identity requirement:
- cross_session

### Definition

```text
初回 reading_started と同一session内で reading_completed に到達したeligible anonymous visitor数
----------------------------------------------------------------------------------------
初回 reading_started を持つeligible anonymous visitor数
```

Window:
- visitorの初回 `reading_started` が発生したsession内

Preconditions:
- Privacy条件を満たす `anonymous_visitor_id` が存在
- 過去利用の有無を判断できる保持windowが定義済み

Exclusions:
- cross-session識別条件を満たさない対象
- 明示的なテストsession
- schema validation失敗でイベント信頼性が無いsession

Segments:
- reading_type
- entry_context

Guardrails:
- `reading_feedback_submitted.helpfulness`
- `ai_output_rejected` signal

識別条件を満たさない場合:
- First Reading Completionは `N/A`
- 以下のsession-level参考指標へ勝手に読み替えない

### Reference metric: Reading Flow Completion

cross-session識別を使わず、観測期間内のreading flow完了状況を見る参考指標。

```text
同一session内で reading_started 後に reading_completed に到達したreading flow数
-------------------------------------------------------------------------
reading_started flow数
```

Identity requirement:
- session

これは「ユーザー初回鑑定完了率」とは別KPIとしてレポートする。

注意:
Completion改善だけで結果品質が良くなったとはみなさない。

## 2. D1 Return

### Purpose

初回鑑定後、翌日に再訪する価値が生まれているかを見る。

Identity requirement:
- cross_session

### Definition

```text
初回 reading_completed の翌暦日に session_returned を持つeligible anonymous visitor数
---------------------------------------------------------------------------------
初回 reading_completed を持つeligible anonymous visitor数
```

Window:
- Asia/Tokyoの暦日基準で翌日

Preconditions:
- Privacy条件を満たす `anonymous_visitor_id` が存在
- identifier保持/rotation/削除方針がレビュー済み

Exclusions:
- cross-session識別条件を満たさない対象
- テストsession

Guardrails:
- Helpful Feedback Rate
- Safety rejection signal
- 過度な再鑑定誘導施策の有無

識別条件を満たさない場合:
- `N/A`
- session_idから擬似的に推定しない

## 3. D7 Return

Identity requirement:
- cross_session

### Definition

```text
初回 reading_completed 後7日以内に session_returned を持つeligible anonymous visitor数
----------------------------------------------------------------------------------
初回 reading_completed を持つeligible anonymous visitor数
```

Window:
- day 1〜day 7

Preconditions / exclusions:
- D1 Returnと同じ

D1と重複可能。レポートでは定義を併記する。

## 4. Repeat Reading Rate

### Purpose

継続的に占い体験を利用しているかを見る。ただし利用回数の最大化を目的にしない。

Identity requirement:
- cross_session（複数sessionをまとめる場合）
- 同一session内だけを対象にする別指標へ勝手に置き換えない

### Definition

```text
観測期間内に2回以上 reading_completed を持つeligible anonymous visitor数
------------------------------------------------------------------------
観測期間内に1回以上 reading_completed を持つeligible anonymous visitor数
```

Default window:
- 7 days

Guardrails:
- Helpful Feedback Rate
- Safety violation / rejection signal
- `another_reading` CTA比率
- manipulation risk review

Interpretation rule:
Repeat上昇 + helpfulness低下の場合は「改善」と判定しない。

## 5. Helpful Feedback Rate

### Purpose

鑑定がユーザー自身にとって役立ったと感じられているかの直接Signalを取る。

Identity requirement:
- none（feedback event単位）

### Definition

```text
helpfulness = helpful の feedback数
-----------------------------------
helpfulness が入力された feedback総数
```

Window:
- reporting period

Limitations:
- feedback回答者バイアス
- 未回答者をneutralとして扱わない
- 「helpful」は真実性や長期的価値を保証しない

## 6. Paid Conversion

### Purpose

無料体験から有料価値へ移行しているかを見る。

Identity requirement:
- cross_session（7日window）

### Definition

```text
paywall初回表示後7日以内に purchase_completed を持つeligible anonymous visitor数
-----------------------------------------------------------------------------
paywall_viewed を1回以上持つeligible anonymous visitor数
```

Default window:
- paywall初回表示から7日

Preconditions:
- Privacy条件を満たすcross-session identity

Cross-session identityを使わない場合:
- session内conversionを別KPIとして明示定義する
- 7日Paid Conversionと混同しない

Segments:
- offer_id
- placement
- price_tier

Guardrails:
- Helpful Feedback Rate
- refund / complaint signal（実装後）
- Safety violation / rejection signal
- high-risk contextへの販売誘導が無いこと

Interpretation rule:
Paid Conversion上昇だけでは採用判断しない。

## 7. Safety Rejection Rate

### Purpose

AI出力や施策でSafety Gateに抵触する比率を監視する。

### Definition

実装時に「評価対象AI出力数」を観測できる内部イベントを追加した上で定義する。

現時点では `ai_output_rejected` の件数を観測Signalとして扱い、率の正式KPI化は保留する。

理由:
分母イベントが未定義のまま率を定義すると誤った比較になるため。

## Funnel stage mapping

```text
cross-session identity available:
first reading_started
  ↓ First Reading Completion
first reading_completed
  ↓ D1/D7 Return / Repeat Reading
session_returned

session-only fallback:
reading_started
  ↓ Reading Flow Completion
reading_completed
  ↓ Helpful Feedback
reading_feedback_submitted

optional monetization branch:
paywall_viewed
  ↓ Paid Conversion
purchase_completed
```

この並びはユーザー全員に課金を要求する一本道ではない。`paywall_viewed` は条件付きbranchとして扱う。

## Analysis rules

1. 分母ゼロのKPIを0%として報告しない。`N/A` とする。
2. identity requirementを満たさないKPIを推定・代替しない。
3. First Reading CompletionとReading Flow Completionを同一KPIとして比較しない。
4. sample sizeを必ず出す。
5. 前期間比較ではwindow・definition・segmentを揃える。
6. Metric definition変更前後を同じ系列として比較しない。
7. conversion上昇を因果と解釈しない。
8. 利用増加とユーザー価値増加を同一視しない。
9. Revenue KPIはSafety / Trust guardrailと併記する。

## Future additions

実データ接続後に検討する。

- complaint rate
- refund rate
- reading abandonment reason
- time-to-value
- user-reported clarity / actionability

根拠のないKPI追加はしない。
