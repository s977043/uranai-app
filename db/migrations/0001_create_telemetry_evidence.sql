BEGIN;

CREATE TABLE IF NOT EXISTS telemetry_evidence (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name text NOT NULL,
  event_version smallint NOT NULL,
  occurred_at timestamptz NOT NULL,
  ingested_at timestamptz NOT NULL,
  anonymous_session_id text NOT NULL,
  anonymous_visitor_id text NULL,
  properties jsonb NOT NULL,
  CONSTRAINT telemetry_evidence_event_name_check
    CHECK (event_name IN ('reading_started', 'reading_completed', 'reading_feedback_submitted')),
  CONSTRAINT telemetry_evidence_event_version_check
    CHECK (event_version = 1),
  CONSTRAINT telemetry_evidence_anonymous_visitor_check
    CHECK (anonymous_visitor_id IS NULL),
  CONSTRAINT telemetry_evidence_properties_object_check
    CHECK (jsonb_typeof(properties) = 'object')
);

CREATE INDEX IF NOT EXISTS telemetry_evidence_ingested_at_idx
  ON telemetry_evidence (ingested_at);

CREATE INDEX IF NOT EXISTS telemetry_evidence_event_ingested_idx
  ON telemetry_evidence (event_name, ingested_at);

CREATE INDEX IF NOT EXISTS telemetry_evidence_session_ingested_idx
  ON telemetry_evidence (anonymous_session_id, ingested_at);

CREATE INDEX IF NOT EXISTS telemetry_evidence_flow_ingested_idx
  ON telemetry_evidence ((properties ->> 'reading_flow_id'), ingested_at);

COMMIT;
