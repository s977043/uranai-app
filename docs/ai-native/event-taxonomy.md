# Event Taxonomy

Tracking: #20

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

## Common envelope

将来の実装では次の論理項目を持つ。

```yaml
event_name: string
event_version: 1
occurred_at: ISO-8601
anonymous_session_id: string
anonymous_visitor_id: string | null
properties: object
```

### Required

- `event_name`
- `event_version`
- `occurred_at`
- `anonymous_session_id`

### Conditional

`anonymous_visitor_id` は、D1/D7 Return・Repeat Reading・複数sessionにまたがるPaid Conversionなど、**cross-session集計が必要でPrivacy条件を満たす場合のみ**利用する。

条件:

- ランダム生成したpseudonymous identifierであること
- 氏名、メール、電話番号、端末固有情報等から決定論的に生成しない
- authentication identifierをそのまま流用しない
- 利用目的をRetention等の明示済み分析に限定する
- 保持期間・rotation・削除方針を実装前Privacy reviewで確定する
- 外部サービス間の追跡キーとして使わない

`anonymous_visitor_id` を安全に保持できない場合、cross-session KPIは `N/A` とし、session単位の指標だけを利用する。

### Forbidden by default

- name
- email
- phone
- address
- free-form consultation text
- authentication token
- payment card data
- raw AI prompt / raw model response
- deterministic hash of PII as visitor identifier

## Product events

### `app_opened`

意味: アプリ体験が開始された。

Allowed properties:

```yaml
entry_point: direct | shared_link | campaign | unknown
```

禁止:
- 「engaged」等の評価語を入れる

---

### `reading_started`

意味: ユーザーが鑑定フローを開始した。

Allowed properties:

```yaml
reading_type: tarot | numerology | maya | other
entry_context: daily | relationship | work | self_reflection | other
```

`entry_context` はユーザー入力本文ではなく粗いカテゴリのみ。

---

### `reading_completed`

意味: 鑑定フローが正常終了し、結果表示まで到達した。

Allowed properties:

```yaml
reading_type: tarot | numerology | maya | other
duration_bucket: lt_30s | 30s_2m | gt_2m | unknown
```

このイベントだけで「満足」「価値提供成功」と判断しない。

---

### `reading_feedback_submitted`

意味: 鑑定後フィードバックが送信された。

Allowed properties:

```yaml
helpfulness: helpful | neutral | not_helpful
feedback_reason_category: clear | reassuring | actionable | inaccurate | too_generic | unsafe_feeling | other | none
```

自由記述本文はanalytics eventへ載せない。別のVoC管理経路で扱う。

---

### `followup_action_selected`

意味: 鑑定後に提示した次の行動候補が選択された。

Allowed properties:

```yaml
action_type: reflect | save | share | another_reading | close | other
```

`another_reading` の増加を単独で成功指標にしない。

---

### `session_returned`

意味: Privacy条件を満たす `anonymous_visitor_id` で、過去sessionの存在を確認できる匿名訪問者が新しいsessionを開始した。

Allowed properties:

```yaml
return_window: d1 | d2_d7 | d8_d30 | gt_d30
```

Precondition:

- `anonymous_visitor_id` が利用可能
- 保持期間・rotation・削除方針がPrivacy review済み

利用できない場合、このイベントは生成せずD1/D7 Returnを `N/A` とする。

---

### `paywall_viewed`

意味: 有料導線が表示された。

Allowed properties:

```yaml
offer_id: string
placement: post_reading | feature_gate | other
```

禁止:
- 相談内容本文
- 不安度など推測した心理属性

---

### `purchase_completed`

意味: 決済完了が確認された。

Allowed properties:

```yaml
offer_id: string
price_tier: low | mid | high
currency: string
```

決済事業者のtransaction idやカード情報を分析payloadへ載せない。

## AI / Safety internal events

プロダクトイベントと別namespaceで扱う。

### `ai_output_rejected`

意味: AI出力がQuality / Safety Gateで却下された。

Allowed properties:

```yaml
gate: deterministic_guardrail | safety_judge | quality_judge | human_review
reason_code: string
```

Raw model responseはanalytics payloadへ入れない。

### `ai_output_regenerated`

意味: 出力再生成が行われた。

Allowed properties:

```yaml
trigger: safety | quality | technical | other
attempt: number
```

## Naming rules

- snake_case
- 過去形の行動 (`*_started`, `*_completed`, `*_submitted`)
- UI部品名ではなくドメイン行動を使う
- KPI名をイベント名にしない
- 意味変更はversion bump

## Change policy

Eventを変更する際は以下を記録する。

- reason
- affected metrics
- backward compatibility
- migration / mapping rule
- privacy impact
- safety impact

## Scope note

この文書は論理taxonomyです。SDK選定、DB schema、送信処理、同意管理、identifier保持/削除の実装は別Iterationで扱います。
