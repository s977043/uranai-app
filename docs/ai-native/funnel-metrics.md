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
```

## 1. First Reading Completion

### Purpose

初回利用者が鑑定開始から結果表示まで到達できているかを見る。

### Definition

```text
初回セッションで reading_completed が1回以上発生したanonymous session数
------------------------------------------------------------------------
初回セッションで reading_started が1回以上発生したanonymous session数
```

Window:
- 同一初回session内

Exclusions:
- 明示的なテストsession
- schema validation失敗でイベント信頼性が無いsession

Segments:
- reading_type
- entry_context

Guardrails:
- `reading_feedback_submitted.helpfulness`
- `ai_output_rejected` rate

注意:
Completion改善だけで結果品質が良くなったとはみなさない。

## 2. D1 Return

### Purpose

初回鑑定後、翌日に再訪する価値が生まれているかを見る。

### Definition

```text
初回 reading_completed の翌暦日に session_returned を持つanonymous user cohort数
-------------------------------------------------------------------------------
初回 reading_completed を持つeligible anonymous user cohort数
```

Window:
- Asia/Tokyoの暦日基準で翌日

Exclusions:
- identifier保持に同意/利用条件を満たさない対象
- テストsession

Guardrails:
- Helpful Feedback Rate
- Safety rejection rate
- 過度な再鑑定誘導施策の有無

## 3. D7 Return

### Definition

```text
初回 reading_completed 後7日以内に session_returned を持つanonymous user cohort数
----------------------------------------------------------------------------
初回 reading_completed を持つeligible anonymous user cohort数
```

Window:
- day 1〜day 7

D1と重複可能。レポートでは定義を併記する。

## 4. Repeat Reading Rate

### Purpose

継続的に占い体験を利用しているかを見る。ただし利用回数の最大化を目的にしない。

### Definition

```text
観測期間内に2回以上 reading_completed を持つeligible anonymous user数
---------------------------------------------------------------------
観測期間内に1回以上 reading_completed を持つeligible anonymous user数
```

Default window:
- 7 days

Guardrails:
- Helpful Feedback Rate
- Safety violation / rejection
- `another_reading` CTA比率
- manipulation risk review

Interpretation rule:
Repeat上昇 + helpfulness低下の場合は「改善」と判定しない。

## 5. Helpful Feedback Rate

### Purpose

鑑定がユーザー自身にとって役立ったと感じられているかの直接Signalを取る。

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

### Definition

```text
観測window内に purchase_completed を持つeligible anonymous user数
------------------------------------------------------------------
paywall_viewed を1回以上持つeligible anonymous user数
```

Default window:
- paywall初回表示から7日

Segments:
- offer_id
- placement
- price_tier

Guardrails:
- Helpful Feedback Rate
- refund / complaint signal（実装後）
- Safety violation / rejection
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
reading_started
  ↓ First Reading Completion
reading_completed
  ↓ Helpful Feedback / Return
session_returned
  ↓ Repeat Reading
reading_completed (2+)
  ↓ optional monetization
paywall_viewed
  ↓ Paid Conversion
purchase_completed
```

この並びはユーザー全員に課金を要求する一本道ではない。`paywall_viewed` は条件付きbranchとして扱う。

## Analysis rules

1. 分母ゼロのKPIを0%として報告しない。`not_applicable` とする。
2. sample sizeを必ず出す。
3. 前期間比較ではwindow・definition・segmentを揃える。
4. Metric definition変更前後を同じ系列として比較しない。
5. conversion上昇を因果と解釈しない。
6. 利用増加とユーザー価値増加を同一視しない。
7. Revenue KPIはSafety / Trust guardrailと併記する。

## Future additions

実データ接続後に検討する。

- complaint rate
- refund rate
- reading abandonment reason
- time-to-value
- user-reported clarity / actionability

根拠のないKPI追加はしない。
