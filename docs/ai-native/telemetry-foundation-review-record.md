# Pilot Telemetry Foundation Review Record

Tracking: #31 / PR #34  
Product integration: #33  
Shared test / deployment surface: #15

## Review conclusion

**Approved for Telemetry Foundation scope.**

Issue #31で必要なContract / Privacy境界 /集約 / Observability昇格条件は成立している。

ただし、この承認は次を意味しない。

- Reading Product Flowが実装済み
- Product Metricが`observable`
- Production Evidence sourceが存在
- Manual Real Pilotが実施可能
- Controlled Autonomyへ進める

#33 / #15とoperational Evidence sourceが成立するまで、Manual Real PilotとIteration 5はBlockedのままとする。

## 1. Product / MLP Review

### Finding

当初#31は`reading_flow_completion`をobservableへする計画だったが、最新mainはNext.js初期画面でReading Flow自体が未実装だった。

Telemetry基盤だけでobservableと主張すると、MLP Firstの「Experienceを先に成立させて観測する」という順序を逆転させる。

### Change

- FoundationとProduct instrumentationを分離
- #33にReading Vertical Slice + Telemetry wiringを切り出し
- Registryは`uninstrumented`を維持

### Verdict

OK。Telemetry導入自体を成果にせず、次のExperience実装へ接続できる。

## 2. Architecture Review

### Finding

外部Analytics SDKを先に入れると、Event ContractとVendor都合が密結合になる。

### Change

- `src/domain/telemetry/*`をpure contract / validation / aggregationへ限定
- `src/adapters/telemetry/*`にUUID生成とSinkを分離
- `TelemetrySink` port + `InMemoryTelemetrySink`
- external vendor / DB persistenceをScope out

### Verdict

OK。Domain / Adapter境界が既存`AGENTS.md`と整合し、将来adapterを差し替え可能。

## 3. Data / Privacy Review

### Findings

1. Unknown propertyを許すと相談本文・PIIが偶発的にTelemetryへ混入できる。
2. Cross-session visitor IDを今導入する必要はない。
3. UUID validatorがv1〜v5を許すと、生成側の`crypto.randomUUID()`よりContractが広く、時刻/MAC由来UUID等を受け入れる余地があった。

### Changes

- Event envelope / propertiesをstrict allowlist化
- name / email / phone / consultation text / raw prompt等を追加不能にした
- `anonymous_visitor_id = null`固定
- session / reading-flow IDをUUID v4限定
- persistent storage無し
- external vendor送信無し

### Verdict

OK for Foundation。永続Evidence source導入時はretention / deletion / access control / destinationを再レビューする。

## 4. Safety / Trust Review

### Finding

相談本文やAI raw responseを観測基盤へ持ち込むと、Safety評価のためのデータ収集が逆にセンシティブ情報の蓄積を増やす。

### Change

- free-form consultationをTelemetryへ載せない
- raw prompt / raw responseを載せない
- feedbackは`helpfulness`と粗いreason categoryだけ
- external action / pricing / CRM / user targetingを追加しない

### Verdict

OK。Telemetryは行動Signalに限定され、占い内容や心理推測を収集しない。

## 5. Analytics / Experimentation Review

### Findings

1. Session IDだけでは同一session内の複数Reading Flowを区別できない。
2. `computed`を`observable`と呼ぶとSynthetic/local計算を本番観測可能性と誤認する。
3. started / completedで`reading_type`が不一致でも完了扱いにするとsegmentを壊す。
4. feedback単独を数えると、対応するcompleted flowが無いorphan feedbackでHelpful Feedback Rateが汚染される。
5. parse可能なtimestampだけではEvidenceの表現が揺れる。

### Changes

- `reading_flow_id`を導入
- aggregation statusを`computed | not_computable`へ分離
- Registry Observabilityは`uninstrumented | partial | observable`を維持
- session / time / reading_type整合を検証
- Helpful Feedbackはcompleted flowと同一flow・同一session・正しい時系列のfeedbackだけをeligibleにする
- `occurred_at`を`Date.toISOString()` canonical形式に固定
- duplicate / orphan / out-of-order / dimension mismatchをData Qualityとして返す

### Verdict

OK。Metric定義とEvidence品質の境界が追跡可能。

## 6. QA / Eval Review

### Finding

`not_computable`時にData Qualityを落とすと、「なぜ計算不能か」の異常Evidenceを失う。

### Change

`computed` / `not_computable`の両方でData Qualityを返す。

Regression coverage:

- strict property allowlist
- PII / raw text rejection
- non-v4 identifier rejection
- canonical timestamp
- validate-before-write
- duplicate event
- orphan event
- out-of-order event
- cross-session mismatch
- reading type mismatch
- feedback flow correlation
- zero denominator / missing evidence
- Observability promotion rule

### Verdict

OK。CIの通常testに含まれ、AI Eval Contractsとは別にdeterministic regressionとして検証できる。

## 7. Delivery / Maintainability Review

### Finding

初期のREADME / Execution Plan更新がTelemetry目的以上に既存説明を圧縮しており、差分が大きくなっていた。

### Change

- 既存履歴・リンクを保持
- #31 / #33に必要な追記中心へ縮小
- 新規runtime dependency無し
- UI / DB / external service変更無し
- branch単位でrevert可能

### Verdict

OK。Foundation変更として可逆性が高く、PRの目的と差分が一致する。

## Blockers found and resolved

1. Reading Flow未実装なのにMetric observable化を計画していた
2. Reading flow correlation keyが無かった
3. ComputationとProduct Observabilityの語義が混同していた
4. started / completed dimension mismatchを検出していなかった
5. canonical timestampが未固定だった
6. UUID validatorがv4以外も許可していた
7. orphan / out-of-order feedbackをHelpful Feedbackへ入れられた
8. `not_computable`でData Qualityが消えていた
9. docs diffが目的以上に広がっていた

すべてPR #34内で修正済み。

## Residual risks / next gates

Foundation完了後も以下は未検証。

- Product surfaceからのevent emit: #33
- browser / runtimeでのend-to-end telemetry wiring: #33
- production/shared test surface: #15
- operational / persistent Evidence source
- persistent storageのretention / deletion / access control
- consent / disclosure requirements when external collection is introduced
- cross-session identity / D1 / D7 / Repeat Reading
- Real Pilot human wait time / handoff friction

これらを#31の完了条件へ混ぜず、後段Entry Gateとして保持する。

## Final decision

```text
Telemetry Foundation                 APPROVED
Registry observable promotion        NOT YET
Reading Vertical Slice               #33
Operational Evidence / shared surface BLOCKED
Manual Real Pilot                    BLOCKED
Controlled Autonomy                  BLOCKED
```

PR #34のfinal headでCI Green・mergeable・未解決review thread 0を確認してからmergeする。
