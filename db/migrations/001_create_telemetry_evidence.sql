-- Telemetry Evidence v1
-- Product telemetry is validated by validateTelemetryEvent before persistence.
-- anonymous_visitor_id is intentionally not stored because the first pilot contract fixes it to null.

CREATE TABLE telemetry_evidence (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name text NOT NULL
    CHECK (event_name IN (
      'reading_started',
      'reading_completed',
      'reading_feedback_submitted'
    )),
  event_version smallint NOT NULL CHECK (event_version = 1),
  occurred_at timestamptz NOT NULL,
  ingested_at timestamptz NOT NULL,
  anonymous_session_id text NOT NULL
    CHECK (
      anonymous_session_id ~* '^session_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}
);

CREATE INDEX telemetry_evidence_ingested_at_idx
  ON telemetry_evidence (ingested_at, id);

CREATE INDEX telemetry_evidence_session_ingested_at_idx
  ON telemetry_evidence (anonymous_session_id, ingested_at, id);

CREATE INDEX telemetry_evidence_flow_ingested_at_idx
  ON telemetry_evidence ((properties ->> 'reading_flow_id'), ingested_at, id);

    ),
  properties jsonb NOT NULL
    CHECK (jsonb_typeof(properties) = 'object')
    CHECK (
      properties ? 'reading_flow_id'
      AND jsonb_typeof(properties -> 'reading_flow_id') = 'string'
    )
);

CREATE INDEX telemetry_evidence_ingested_at_idx
  ON telemetry_evidence (ingested_at, id);

CREATE INDEX telemetry_evidence_session_ingested_at_idx
  ON telemetry_evidence (anonymous_session_id, ingested_at, id);

CREATE INDEX telemetry_evidence_flow_ingested_at_idx
  ON telemetry_evidence ((properties ->> 'reading_flow_id'), ingested_at, id);
