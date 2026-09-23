# Telemetry Evidence Operations — Phase C

Tracking: #15, #39, #46

## Scope

This runbook covers the application-owned PostgreSQL table used for session-level
Reflection Reading telemetry. It does **not** make the Operational Evidence source
production-ready by itself.

Current boundary:

- session-only identity
- no `anonymous_visitor_id` column
- no IP / User-Agent / consultation text / prompt / response
- raw Evidence retention target: 30 days from server `ingested_at`
- central ingestion remains disabled by default
- paid provider provisioning and production abuse-control verification remain later gates

## Apply migration locally

With the repository PostgreSQL 16 service running:

```bash
docker compose up -d db
docker compose exec -T db psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-uranai_app}" < db/migrations/001_create_telemetry_evidence.sql
```

The migration is additive and idempotent for the table/index creation path.

## Evidence window query

Operational metric windows must select by **server-generated `ingested_at`**.
`occurred_at` remains the client event timestamp used for same-flow ordering and
Data Quality checks.

Example bounded inspection:

```sql
SELECT
  event_name,
  event_version,
  occurred_at,
  ingested_at,
  anonymous_session_id,
  properties
FROM telemetry_evidence
WHERE ingested_at >= TIMESTAMPTZ '2026-09-01T00:00:00Z'
  AND ingested_at <  TIMESTAMPTZ '2026-10-01T00:00:00Z'
ORDER BY ingested_at, id
LIMIT 5000;
```

Application export reconstructs `anonymous_visitor_id = null` rather than storing
a meaningless column.

## 30-day retention

### 1. Dry-run count

Always count first:

```sql
SELECT COUNT(*)
FROM telemetry_evidence
WHERE ingested_at < NOW() - INTERVAL '30 days';
```

### 2. Delete

Deletion is a Human Gate operation until an independently reviewed scheduled job
exists.

```sql
BEGIN;

DELETE FROM telemetry_evidence
WHERE ingested_at < NOW() - INTERVAL '30 days';

COMMIT;
```

Do not substitute `occurred_at` for `ingested_at`. Client-controlled future
timestamps must not bypass retention.

## Duplicate semantics

Raw duplicate events are intentionally preserved. The current metric aggregation
detects duplicate flow events as Data Quality evidence.

Do not add a uniqueness constraint or silently de-duplicate without a separate
contract change and review.

## Rollback

The down migration drops the Evidence table and is destructive:

```bash
docker compose exec -T db psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-uranai_app}" < db/migrations/001_create_telemetry_evidence.down.sql
```

For any shared or production environment, require an explicit Human Gate before
running the rollback and decide whether a bounded Evidence export is needed first.

## Operational promotion

Phase C implementation does not change these states:

```yaml
metric:reading_flow_completion: partial
metric:helpful_feedback_rate: partial
Operational Evidence: blocked
Manual Real Pilot: blocked
Controlled Autonomy: blocked
```

Promotion still requires managed runtime/storage provisioning, environment
separation, abuse/cost-control verification, shared-surface E2E, Privacy review,
and Data Quality review.
