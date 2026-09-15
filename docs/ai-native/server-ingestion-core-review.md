# Server Telemetry Ingestion Core — Multi-perspective Review

Tracking: #44 / PR #45  
Depends on: #15, #39, PR #43

## Conclusion

**Approved with changes.**

Phase BはHTTP endpointやDBを完成させるIterationではない。安全なserver-side ingestion coreとprovider-neutral Repository portを確立し、Phase CでPostgreSQL persistence + route compositionを行える状態にする。

現在の正しい状態:

```text
Server ingestion core            implemented / regression covered
Repository port                  implemented
Public /api/telemetry            not exposed
PostgreSQL persistence           not implemented
Abuse control                    not verified
Operational Evidence gate        blocked
Metric observable                no
Manual Real Pilot                blocked
```

## 1. Product / MLP

### Review

Telemetry実装がReadingのUser Value Flowを止めないか確認した。

### Result

- Product UI / Reading flowへの変更なし
- telemetry coreはProductから未接続
- future repository failureはsanitized `unavailable`へ閉じる
- fail-open Product policyを維持
- infrastructure completionをProduct successとして扱わない

Blockerなし。

## 2. Architecture

### Finding A — routeの先行公開

Original Phase B planでは`/api/telemetry` routeまで作る予定だった。

PostgreSQL adapterが無い状態でrouteだけ公開すると、受け口は存在するが永続化できないhalf-configured surfaceになる。

### Fix

Phase Bを以下へ限定。

```text
raw body
→ server ingestion core
→ validateTelemetryEvent
→ TelemetryEvidenceRepository port
```

Next.js route compositionはPhase CでPostgreSQL adapterと同時に追加する。

### Finding B — failure classification

初期coreではinvalid server clockを`repository_write_failed`として返していた。

### Fix

- internal clock / internal generation failure → `internal_error`
- repository insert failure → `repository_write_failed`

Raw exceptionはどちらも外へ返さない。

## 3. Privacy

### Review

Server boundaryで不要なrequest metadataをEvidenceへ取り込めないか確認した。

### Result

`ingestTelemetryBody`のAPIは受け取るものを次に限定している。

- raw body string
- enabled flag
- Repository port
- testable server clock

IP / User-Agent / arbitrary headersを引数に持たない。

Evidence recordも:

```text
event
ingested_at
```

だけ。

Regressionでschema外`consultation` fieldをrejectし、invalid body / repository exceptionをresultへ転載しないことを固定した。

## 4. Safety

### Review

新たな相談本文、高リスク判断、課金・価格操作、Agent autonomyを導入していないか確認した。

### Result

Blockerなし。

- existing allowlisted ProductTelemetryEventのみ
- free-text consultationなし
- cross-session identityなし
- AI prompt/model responseなし
- Agent DB credentialなし
- Human Gate変更なし

## 5. Analytics

### Finding — client timestamp semantics

Central Evidenceでclient-controlled `occurred_at`を信頼windowとして使うとtimestamp abuseや端末clock driftの影響を受ける。

### Decision

Phase Cでは:

- Evidence query window / 30-day retention: **server-generated `ingested_at`**
- same-flow sequence / out-of-order Data Quality: `occurred_at`

Phase B coreはserver `ingested_at`を必ず付加する。

Metric Registryは引き続き:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
```

## 6. QA / Eval

### Regression coverage

- enable env exact semantics
- disabled path skips parse/write
- valid event persistence contract
- server-generated canonical `ingested_at`
- record field minimization
- invalid JSON
- unknown field
- multiple-event array rejection
- 16 KiB body limit
- UTF-8 byte-length enforcement
- repository exception sanitization
- internal clock failure classification
- InMemory snapshot isolation
- machine Decision Contract / code request-size alignment

### Machine contract

`server_core_implemented=true`を追加し、core / repository refsが実ファイルへ解決することをCIで確認する。

ただし:

```text
ingestion.operational = false
operational_gate.status = blocked
```

を維持する。

## 7. Delivery / Cost

### Review

Public endpoint・DB・paid infrastructureを早期に有効化していないか確認した。

### Result

- public routeなし
- DB dependency追加なし
- schema/migrationなし
- Vercel project/plan変更なし
- DB provider選択/課金なし
- browser network sinkなし
- retry queueなし

16 KiB limitはcoreでも検証するが、routeがbody全体を先に読み込めばcost protectionとして不十分。

そのためPhase CのEntry条件として**HTTP bodyを読み込む前/途中で上限を守る実装**を明記した。

Abuse/cost controlはまだ未verifiedであり、Operational GateのBlockerのまま。

## Plan updates

Before:

```text
Phase B: route + core + port
Phase C: PostgreSQL
```

After review:

```text
Phase B: core + provider-neutral port
Phase C: PostgreSQL adapter + schema + route composition + HTTP mapping
Phase D: Human provisioning
Phase E: shared-surface / abuse / Privacy / Data Quality E2E
```

## Phase B acceptance criteria

- [x] provider-neutral Repository port
- [x] InMemory regression implementation
- [x] one event/request contract
- [x] UTF-8 body cap
- [x] strict existing event validator reuse
- [x] server-generated `ingested_at`
- [x] sanitized rejection/unavailable results
- [x] no request metadata Evidence surface
- [x] Decision Contract alignment regression
- [x] dedicated AI contract validator
- [x] route exposure deferred until persistence exists
- [x] Metric remains partial
- [x] Operational Gate remains blocked
- [x] 7-perspective review complete

## Residual gates

Deliberately not completed by Phase B:

- PostgreSQL adapter
- schema / migration
- idempotency semantics
- `/api/telemetry` route
- HTTP body streaming/cap enforcement
- HTTP response mapping
- abuse/cost control implementation + verification
- deletion query/runbook
- Evidence query/export
- DB provider provisioning
- Vercel production-eligible plan/project
- Preview / Production wiring
- browser network sink
- shared surface E2E
- Privacy / Data Quality verification
- Metric observable promotion
- User Observation
- Manual Real Pilot
