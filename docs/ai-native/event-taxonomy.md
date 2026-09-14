# Event Taxonomy

Tracking: #20, #31, #33

## Purpose

AI-Native Observe フェーズで使う、**プロダクト行動の論理イベント定義**です。

特定のAnalytics製品には依存しません。将来 GA4 / PostHog / 自前イベント基盤などへ実装する際も、この論理taxonomyを正本としてマッピングします。

## Principles

1. イベント名は観測した事実を表す。成功・価値判断をイベント名に埋め込まない。
2. `reading_completed` と「役に立った」は別のSignalとして扱う。
3. 相談本文、氏名、メール、電話番号などのPIIをpayloadへ入れない。
4. 占い結果そのものを全文payloadへ入れない。分析に必要な低粒度カテゴリだけを使う。
5. 必要な属性だけを収集し、将来使うかもしれないという理由で過収集しない。
6. Event schemaはversionを持ち、意味変更を黙って行わない。
7. Safety / AI qualityの内部イベントと、ユーザー行動イベントを区別する。
8. セッション横断識別が必要なKPIは、Privacy条件を満たす場合だけ計算する。
9. Reading単位のMetricは`reading_flow_id`で相関し、session IDだけからflow数を推定しない。

## Common envelope

```yaml
event_name: string
event_version: 1
occurred_at: canonical ISO-8601
anonymous_session_id: session_<uuid-v4>
anonymous_visitor_id: string | null
properties: object
```

`anonymous_visitor_id` はcross-session集計が必要でPrivacy条件を満たす場合のみ利用する。#31 / #33ではsession-level telemetryに限定し、`null`固定とする。

### Forbidden by default

- name / email / phone / address
- free-form consultation text
- authentication token
- payment card data
- raw AI prompt / raw model response
- deterministic hash of PII as visitor identifier

## Reading flow correlation

`reading_started` / `reading_completed` / `reading_feedback_submitted` は1回のReadingを識別する `reading_flow_id` を共有する。

```yaml
reading_flow_id: reading-flow_<uuid-v4>
```

- Reading開始時にランダム生成
- 同一Flowのstarted / completed / feedbackで共有
- sessionを跨いで再利用しない
- user identityやPIIから導出しない
- cross-session identityとして利用しない

## Product events

### `reading_started`

```yaml
reading_flow_id: reading-flow_<uuid-v4>
reading_type: tarot | numerology | maya | reflection | other
entry_context: daily | relationship | work | self_reflection | other
```

`reflection` はIssue #33の1枚リフレクションReadingを表す独立dimension。

### `reading_completed`

```yaml
reading_flow_id: reading-flow_<uuid-v4>
reading_type: tarot | numerology | maya | reflection | other
duration_bucket: lt_30s | 30s_2m | gt_2m | unknown
```

このイベント単独で満足・価値提供成功とは判断しない。

### `reading_feedback_submitted`

```yaml
reading_flow_id: reading-flow_<uuid-v4>
helpfulness: helpful | neutral | not_helpful
feedback_reason_category: clear | reassuring | actionable | inaccurate | too_generic | unsafe_feeling | other | none
```

自由記述は載せない。Helpful Feedback集約では、対応する`reading_completed`と同一flow / sessionで相関できるfeedbackだけをeligibleとする。

## Other logical events

将来利用する論理taxonomyとして以下を維持する。

- `app_opened`
- `followup_action_selected`
- `session_returned`
- `paywall_viewed`
- `purchase_completed`
- `ai_output_rejected`
- `ai_output_regenerated`

これらは#33のVertical Sliceではemitしない。

## Browser session surface — #33

#33では3つのReading Eventを実Product Flowからemitし、browser `sessionStorage`へsession-localに保持する。

- process / browser sessionを越える中央集約ではない
- Product instrumentationの成立確認には使える
- Manual Real Pilot用のoperational Evidence sourceとはみなさない
- Metric Registryは`partial`まで。`observable`にはしない

## Naming / change rules

- snake_case
- 過去形の行動 (`*_started`, `*_completed`, `*_submitted`)
- UI部品名ではなくドメイン行動を使う
- KPI名をイベント名にしない
- 意味変更はversion bump
- 変更時はaffected metrics / compatibility / privacy / safety影響を記録する
