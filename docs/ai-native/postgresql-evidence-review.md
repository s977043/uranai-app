# PostgreSQL Operational Evidence Phase C — Review Record

Tracking: #15 / #39 / #46 / PR #48

Status: **Approved with changes; final-head CI required before merge.**

## Review scope

Phase Cの目的は、session-level Product TelemetryをPostgreSQLへ安全に保存し、
query/export/retentionをlocal/CIで再現可能にすること。

Phase Cでは以下を証明しない。

- managed production storage is provisioned
- public endpoint abuse/cost control is production-ready
- provider access-log Privacy review is complete
- browser Product Flow sends central telemetry
- target / guardrail Metrics are observable
- Manual Real Pilot is ready

## 1. Product / MLP

### Review

Infrastructure completionをProduct successと扱っていない。

Product Flowからcentral endpointへのnetwork sinkはまだ接続せず、
User Observation前に不要なproduction exposureを増やさない。

### Result

PASS.

Current Product state remains:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
Actual User Observation: not started
```

## 2. Architecture

### Review

Boundary:

```text
HTTP route
  ↓ bounded body
server ingestion core
  ↓ validated ProductTelemetryEvent
TelemetryEvidenceRepository port
  ↓
PostgreSQL adapter
```

Postgres.jsはadapter内に隔離し、Domain / HTTP Contractへprovider固有型を漏らしていない。

### Finding A — driver dependency surface

Issue #46作成時は`pg`を第一候補にしていた。

Phase Cでは小規模adapterに対して依存数を増やす必要がないため、
runtime dependency 0のPostgres.js `postgres@3.4.9`へ変更した。

PostgreSQL / `DATABASE_URL` contractは不変。

Status: Resolved.

### Finding B — Query semantics drift between test double and PostgreSQL

初期実装では5,000件上限 / canonical timestamp validationがPostgreSQL adapterだけにあった。

Fix:

- `MAX_TELEMETRY_EVIDENCE_EXPORT_EVENTS`
- `assertTelemetryEvidenceWindow`
- `assertCanonicalEvidenceTimestamp`

をRepository port側へ移動し、InMemory / PostgreSQL双方で同じContractを利用。

Status: Resolved.

## 3. Data & Privacy

### Review

Stored columns:

```text
id
event_name
event_version
occurred_at
ingested_at
anonymous_session_id
properties
```

Not stored:

- anonymous_visitor_id
- client IP
- User-Agent
- request headers
- consultation text
- raw prompt / model response
- name / email / phone / address

`anonymous_visitor_id`はContract上null固定なので、DB列を作らずexport時にnullを復元する。

### Finding C — retention trust boundary

Retention / central windowにclient-controlled `occurred_at`を使わない。

- window / retention: server `ingested_at`
- same-flow order / DQ: `occurred_at`

Integration testではfuture `occurred_at`でも古い`ingested_at`なら削除対象になることを固定。

Status: Resolved.

## 4. Safety

Telemetry payloadは既存allowlistに限定され、free-text相談やhigh-stakes contentを新規収集しない。

Telemetry failureはProduct Value Flowを止めない。

Central ingestionはdefault disabled。

Status: PASS.

## 5. Analytics / Experimentation

### Review

Raw duplicate EvidenceはDBで削除しない。

理由:

- current metric aggregationがduplicateをData Quality signalとして扱う
- silent dedupはEvidence品質問題を隠す

Query windowは`ingested_at`でbounded selectionし、ProductTelemetryEventへ復元後に既存aggregationを利用する。

Integration CIで:

- Reading Flow Completion
- Helpful Feedback Rate
- duplicate Data Quality

を再現する。

Status: PASS.

## 6. QA / Eval

Coverage:

- unit route validation
- streamed 16 KiB limit
- UTF-8 byte counting
- disabled / invalid / unavailable
- PostgreSQL 16 integration
- migration apply / rollback
- minimized columns
- malformed direct DB row rejection
- insert / query / metric reproduction
- duplicate preservation
- retention count / delete
- export limit
- machine contract validation

### Finding D — migration could hide drift

Initial migration used `IF NOT EXISTS`.

This could allow an unexpected existing schema to be treated as success.

Fix:

- remove `IF NOT EXISTS`
- migration should fail on unexpected pre-existing schema

Status: Resolved.

### Finding E — PostgreSQL CHECK null semantics

`jsonb_typeof(properties -> 'reading_flow_id') = 'string'` alone allows a missing key because SQL CHECK accepts NULL.

Fix:

- require `properties ? 'reading_flow_id'`
- require string type
- add minimum session UUID-v4 shape constraint

Status: Resolved.

### Finding F — malformed migration introduced during review edit

A string-based migration edit temporarily duplicated index blocks / broke table syntax.

GitHub Actions PostgreSQL integration failed with a real PostgreSQL syntax error.

Fix:

- rewrite migration as one normalized SQL unit
- static validator now requires exactly one table declaration / each index exactly once
- PostgreSQL integration remains authoritative syntax/runtime check

Status: Resolved.

## 7. Delivery / Cost

### Review

- no paid Vercel action
- no managed DB provisioning
- Postgres.js runtime dependency 0
- pool max = 2 per runtime instance
- prepared statements disabled for pooled/serverless compatibility
- 5,000 event export cap
- 16 KiB HTTP body cap
- central ingestion default disabled
- destructive rollback documented as Human Gate

### Residual blocker — public abuse/cost control

Production abuse/cost control is not implemented/verified in Phase C.

Therefore:

```text
ingestion.operational = false
operational_gate.status = blocked
```

must remain unchanged.

Status: intentionally deferred to Phase D/E.

## Final conclusion

**Approved with changes**, subject to final-head CI.

Blocking findings found during review:

1. dependency surface too broad for the need
2. port/query semantics drift
3. migration drift could be hidden
4. PostgreSQL CHECK NULL semantics
5. malformed migration caught by integration CI

All were corrected in PR #48.

Residual work is not a Phase C defect; it is the next gate:

```text
Phase C PostgreSQL implementation
  ↓
Phase D managed runtime / DB provisioning
  ↓
Phase E abuse control / environment separation / shared-surface E2E
  ↓
Product central telemetry wiring
  ↓
Metric observable re-evaluation
  ↓
Actual User Observation
  ↓
Manual Real Pilot
```
