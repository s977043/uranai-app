# Telemetry Evidence Operations

Tracking: #46, #39

## Purpose

Operational Evidenceのraw eventを30日で管理し、中央集計を再現可能にするための最小runbook。

## Time semantics

- `ingested_at`: server-generated。Evidence window / retention / deletionの基準
- `occurred_at`: client event time。同一Reading Flow内の順序・Data Quality判定に利用

Client-controlled `occurred_at` をretention基準には使わない。

## Migration

Apply:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0001_create_telemetry_evidence.sql
```

Rollback:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0001_create_telemetry_evidence.down.sql
```

Production rollbackはraw Evidence削除を伴うため、適用前にHuman判断を必要とする。

## 30-day retention

Dry-run count:

```sql
SELECT COUNT(*)
FROM telemetry_evidence
WHERE ingested_at < now() - interval '30 days';
```

Delete:

```sql
DELETE FROM telemetry_evidence
WHERE ingested_at < now() - interval '30 days';
```

初回Pilotでは自動cron削除をまだ導入しない。削除手順と結果をHumanが確認し、Phase D/Eでschedule方式を決める。

## Evidence export

Central Evidence windowは半開区間 `[from, to)` とする。

```sql
SELECT
  event_name,
  event_version,
  occurred_at,
  ingested_at,
  anonymous_session_id,
  anonymous_visitor_id,
  properties
FROM telemetry_evidence
WHERE ingested_at >= $FROM
  AND ingested_at < $TO
ORDER BY ingested_at ASC, id ASC;
```

Application側では取得rowを再度 `validateTelemetryEvent` に通し、既存の
`calculateReadingFlowCompletion` / `calculateHelpfulFeedbackRate` へeventだけを渡す。

## Privacy boundary

保存しないもの:

- request IP
- User-Agent
- arbitrary headers
- consultation free text
- name/email/phone/address
- raw prompt/model response
- cross-session visitor identity

Provider/platform access logはProduct Evidence tableとは別にPrivacy Reviewする。
