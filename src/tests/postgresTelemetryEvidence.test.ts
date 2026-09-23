import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

import { PostgresTelemetryEvidenceRepository } from "@/adapters/telemetry/postgresEvidenceRepository";
import type { TelemetryEvidenceRecord } from "@/adapters/telemetry/evidenceRepository";
import {
  calculateHelpfulFeedbackRate,
  calculateReadingFlowCompletion,
} from "@/domain/telemetry/metrics";
import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

const databaseUrl = process.env.TEST_DATABASE_URL;
const describePostgres = databaseUrl ? describe : describe.skip;

const SESSION_ID = "session_550e8400-e29b-41d4-a716-446655440000";
const FLOW_ID = "reading-flow_650e8400-e29b-41d4-b716-446655440000";

const started: ProductTelemetryEvent = {
  event_name: "reading_started",
  event_version: 1,
  occurred_at: "2026-09-15T00:00:00.000Z",
  anonymous_session_id: SESSION_ID,
  anonymous_visitor_id: null,
  properties: {
    reading_flow_id: FLOW_ID,
    reading_type: "reflection",
    entry_context: "self_reflection",
  },
};

const completed: ProductTelemetryEvent = {
  event_name: "reading_completed",
  event_version: 1,
  occurred_at: "2026-09-15T00:00:20.000Z",
  anonymous_session_id: SESSION_ID,
  anonymous_visitor_id: null,
  properties: {
    reading_flow_id: FLOW_ID,
    reading_type: "reflection",
    duration_bucket: "lt_30s",
  },
};

const feedback: ProductTelemetryEvent = {
  event_name: "reading_feedback_submitted",
  event_version: 1,
  occurred_at: "2026-09-15T00:00:25.000Z",
  anonymous_session_id: SESSION_ID,
  anonymous_visitor_id: null,
  properties: {
    reading_flow_id: FLOW_ID,
    helpfulness: "helpful",
    feedback_reason_category: "none",
  },
};

describePostgres("PostgreSQL telemetry evidence integration", () => {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 3_000,
  });
  const repository = new PostgresTelemetryEvidenceRepository(pool);

  beforeAll(async () => {
    await pool.query(readSql("0001_create_telemetry_evidence.down.sql"));
    await pool.query(readSql("0001_create_telemetry_evidence.sql"));
  });

  afterAll(async () => {
    await pool.query(readSql("0001_create_telemetry_evidence.down.sql"));
    await pool.end();
  });

  it("insert → ingested_at window export → existing metric aggregationを再現する", async () => {
    await insertRecord(started, "2026-09-15T00:01:00.000Z");
    await insertRecord(completed, "2026-09-15T00:01:01.000Z");
    await insertRecord(feedback, "2026-09-15T00:01:02.000Z");

    const records = await repository.list({
      from_ingested_at: "2026-09-15T00:00:00.000Z",
      to_ingested_at: "2026-09-15T00:02:00.000Z",
    });
    const events = records.map((record) => record.event);

    expect(events).toEqual([started, completed, feedback]);
    expect(calculateReadingFlowCompletion(events)).toMatchObject({
      status: "computed",
      numerator: 1,
      denominator: 1,
      rate: 1,
    });
    expect(calculateHelpfulFeedbackRate(events)).toMatchObject({
      status: "computed",
      numerator: 1,
      denominator: 1,
      rate: 1,
    });
  });

  it("逆転したEvidence windowをDB query前にrejectする", async () => {
    await expect(
      repository.list({
        from_ingested_at: "2026-09-16T00:00:00.000Z",
        to_ingested_at: "2026-09-15T00:00:00.000Z",
      }),
    ).rejects.toThrow("from_ingested_at must be earlier than to_ingested_at");
  });

  it("session / flow / event name filterをparameterized queryで再現する", async () => {
    const bySession = await repository.list({
      from_ingested_at: "2026-09-15T00:00:00.000Z",
      to_ingested_at: "2026-09-15T00:02:00.000Z",
      anonymous_session_id: SESSION_ID,
      reading_flow_id: FLOW_ID,
      event_name: "reading_completed",
    });

    expect(bySession.map((record) => record.event)).toEqual([completed]);
  });

  it("重複eventをEvidenceから消さず保存する", async () => {
    await insertRecord(started, "2026-09-15T00:01:03.000Z");

    const records = await repository.list({
      from_ingested_at: "2026-09-15T00:01:00.000Z",
      to_ingested_at: "2026-09-15T00:02:00.000Z",
      event_name: "reading_started",
    });

    expect(records).toHaveLength(2);
    const metric = calculateReadingFlowCompletion(
      records.map((record) => record.event),
    );
    expect(metric.data_quality.duplicate_events).toBe(1);
  });

  it("retention dry-run/deleteはclient occurred_atではなくingested_at基準", async () => {
    const futureOccurred: ProductTelemetryEvent = {
      ...started,
      properties: { ...started.properties },
      occurred_at: "2099-01-01T00:00:00.000Z",
    };
    await insertRecord(futureOccurred, "2026-08-01T00:00:00.000Z");

    const cutoff = "2026-09-01T00:00:00.000Z";
    expect(await repository.countBefore(cutoff)).toBe(1);
    expect(await repository.deleteBefore(cutoff)).toBe(1);
    expect(await repository.countBefore(cutoff)).toBe(0);
  });

  it("DB constraintでもanonymous_visitor_id非nullを拒否する", async () => {
    await expect(
      pool.query(
        `INSERT INTO telemetry_evidence (
          event_name, event_version, occurred_at, ingested_at,
          anonymous_session_id, anonymous_visitor_id, properties
        ) VALUES (
          'reading_started', 1, now(), now(),
          $1, 'visitor_forbidden', $2::jsonb
        )`,
        [SESSION_ID, JSON.stringify(started.properties)],
      ),
    ).rejects.toThrow();
  });

  async function insertRecord(
    event: ProductTelemetryEvent,
    ingested_at: string,
  ): Promise<void> {
    const record: TelemetryEvidenceRecord = { event, ingested_at };
    await repository.insert(record);
  }
});

function readSql(fileName: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), "db", "migrations", fileName),
    "utf8",
  );
}
