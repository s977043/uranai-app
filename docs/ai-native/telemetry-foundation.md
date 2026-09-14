# Pilot Telemetry Foundation

Tracking: #31  
Product integration: #33

## Purpose

Closed Learning LoopのManual Real Pilotで使うEvidenceを、安全かつ再現可能に取得するためのTelemetry基盤を定義する。

このIterationでは**Telemetry Contractを実装するが、Reading Product Flow自体は実装しない**。

したがって:

```text
Metric definition active       ✅
Telemetry Contract             ✅
Local/test Evidence compute    ✅
Product instrumentation        ❌ #33
Operational Evidence source    ❌ #33 / future adapter
Metric observable              ❌ until integration
```

`computed`と`observable`を混同しない。

## Responsibility split

### Domain — pure

`src/domain/telemetry/`

- typed event contract
- strict schema validation
- Reading Flow correlation semantics
- metric computation
- observability promotion assessment

外部SDK・Storage・Clock・乱数へ依存しない。

### Adapter — side effects / environment

`src/adapters/telemetry/`

- random session ID / reading flow ID
- Telemetry Sink port
- in-memory sink for tests / local rehearsal

外部Analytics vendor adapterはまだ追加しない。

## Implemented pilot events

Issue #31でTypeScript Contractを持つイベント:

- `reading_started`
- `reading_completed`
- `reading_feedback_submitted`

すべて次を持つ。

```yaml
event_version: 1
occurred_at: ISO-8601
anonymous_session_id: session_<random-uuid>
anonymous_visitor_id: null
properties:
  reading_flow_id: reading-flow_<random-uuid>
```

### Reading Flow correlation

`reading_flow_id`は1回のReading開始時に生成し、started / completed / feedbackで共有する。

用途はflow correlationだけ。

禁止:

- sessionを跨いで再利用
- user identityとして利用
- email / phone / auth id /相談本文から導出

## Privacy contract

Telemetry Eventはallowlist方式で検証する。

未知propertyはrejectするため、以下を追加できない。

- name
- email
- phone
- address
- consultation text
- raw prompt
- raw model response
- payment data
- arbitrary free-form text

`anonymous_visitor_id`は#31では`null`固定。

## Metric computation

### Reading Flow Completion

Definition:

```text
同一session内でreading_started後にreading_completedしたreading_flow_id数
---------------------------------------------------------------------
reading_startedの一意reading_flow_id数
```

処理:

- duplicate eventは重複計上しない
- completion onlyはorphanとして記録
- completionがstartより前ならout-of-orderとして記録
- sessionが異なるcompletionは分子へ入れない
- start分母が無い場合は0%にせず`not_computable`

### Helpful Feedback Rate

Definition:

```text
helpfulness=helpfulの一意reading_flow_id数
------------------------------------------
feedbackを持つ一意reading_flow_id数
```

同一flowの重複feedbackは重複計上しない。

## Computation status vs Registry observability

Metric computationの戻り値:

```yaml
status: computed | not_computable
```

Metric Registry:

```yaml
observability_status: uninstrumented | partial | observable
```

これらは別概念。

Synthetic / local eventsを計算できても、Product surfaceから実Eventが取得できなければRegistryを`observable`へ変更しない。

## Promotion rule

`observable`へ昇格できるのは次をすべて満たす場合のみ。

- required eventがすべてProduct surfaceへ接続
- Product surfaceから実際にemitされる
- Evidence sourceがoperational
- schema validationがGreen
- required event欠損時の扱いが定義済み
- Event → Evidence取得手順が再現可能
- Privacy review済み

状態判定は`assessMetricObservability`で機械化する。

### Current assessment

#31完了時点でもReading Vertical Sliceが未接続なので:

```yaml
metric:reading_flow_completion: uninstrumented
metric:helpful_feedback_rate: uninstrumented
```

これは失敗ではなく、正しい状態表現。

## Evidence source

`InMemoryTelemetrySink`はContract / local rehearsal用。

これはproduction Evidence sourceではない。

用途:

- schema validation
- integration test
- synthetic rehearsal
- aggregation regression

Product Metricの`evidence_source_ref`には設定しない。

## Retention / deletion

#31では永続化しない。

- in-memory sinkのみ
- process lifetimeを越えて保持しない
- external vendorへ送信しない
- cross-session identifierを保存しない

将来永続Evidence sourceを導入する際に、retention / deletion / access control / vendor destinationを別途Privacy reviewする。

## Failure rules

次の場合はMetricを正常値として報告しない。

- required event無し
- denominator無し
- schema-invalid eventのみ
- Reading Flow correlation不能

Data quality anomalyは隠さず:

- duplicate_events
- orphan_events
- out_of_order_events

として返す。

## Next dependency

#33でReading Vertical Sliceを実装し、以下をProduct Flowへ接続する。

```text
Reading Start       → reading_started
Result displayed    → reading_completed
Feedback submitted  → reading_feedback_submitted
```

その後、operational Evidence sourceとshared test surfaceを整えた時点でMetric RegistryのObservability昇格を再評価する。