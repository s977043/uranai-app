import fs from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PostgresTelemetryEvidenceRepository } from "@/adapters/telemetry/postgresEvidenceRepository";
import type { ProductTelemetryEvent } from "@/domain/telemetry/events";
import {
  calculateHelpfulFeedbackRate,
  calculateReadingFlowCompletion,
} from "@/domain/telemetry/metrics";

const databaseUrl = process.env.INTEGRATION_DATABASE_URL;
const describeIntegration = databaseUrl ? describe : describe.skip;

describeIntegration("PostgreSQL telemetry Evidence", () => {
  let sql: ReturnType<typeof postgres>;
  let repository: PostgresTelemetryEvidenceRepository;

  beforeAll(async () => {
    sql = postgres(databaseUrl as string, {
      max: 1,
      connect_timeout: 5,
      idle_timeout: 5,
      prepare: false,
    });
    const down = await readMigration("001_create_telemetry_evidence.down.sql");
    const up = await readMigration("001_create_telemetry_evidence.sql");
    await sql.unsafe(down);
    await sql.unsafe(up);
    repository = new PostgresTelemetryEvidenceRepository(sql);
  });

  beforeEach(async () => {
    await sql`TRUNCATE TABLE telemetry_evidence RESTART IDENTITY`;
  });

  afterAll(async () => {
    if (!databaseUrl) return;
    const down = await readMigration("001_create_telemetry_evidence.down.sql");
    await sql.unsafe(down);
    await sql.end({ timeout: 5 });
  });

  it("stores only the minimized Evidence schema", async () => {
    const rows = await sql<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'telemetry_evidence'
      ORDER BY ordinal_position
    `;

    expect(rows.map((row) => row.column_name)).toEqual([
      "id",
      "event_name",
      "event_version",
      "occurred_at",
      "ingested_at",
      "anonymous_session_id",
      "properties",
    ]);
  });

  it("rejects direct rows that miss the required reading flow identity", async () => {
    await expect(
      sql`
        INSERT INTO telemetry_evidence (
          event_name,
          event_version,
          occurred_at,
          ingested_at,
          anonymous_session_id,
          properties
        )
        VALUES (
          'reading_started',
          1,
          '2026-09-23T00:00:00.000Z',
          '2026-09-23T00:00:01.000Z',
          ${sessionId},
          ${sql.json({ reading_type: "reflection" })}
        )
      `,
    ).rejects.toThrow();
  });

  it("round-trips a window by server ingested_at and reproduces metrics", async () => {
    const start = readingStarted("2026-09-23T00:00:00.000Z");
    const completed = readingCompleted("2026-09-23T00:00:15.000Z");
    const feedback = readingFeedback("2026-09-23T00:00:20.000Z");

    await repository.insert({
      event: start,
      ingested_at: "2026-09-23T00:00:01.000Z",
    });
    await repository.insert({
      event: completed,
      ingested_at: "2026-09-23T00:00:16.000Z",
    });
    await repository.insert({
      event: feedback,
      ingested_at: "2026-09-23T00:00:21.000Z",
    });

    const records = await repository.listByIngestedAtWindow({
      from_ingested_at: "2026-09-23T00:00:00.000Z",
      to_ingested_at: "2026-09-23T00:01:00.000Z",
      limit: 100,
    });
    const events = records.map((record) => record.event);

    expect(events).toEqual([start, completed, feedback]);

    const completion = calculateReadingFlowCompletion(events);
    expect(completion.status).toBe("computed");
    if (completion.status === "computed") {
      expect(completion.rate).toBe(1);
      expect(completion.data_quality.duplicate_events).toBe(0);
    }

    const helpful = calculateHelpfulFeedbackRate(events);
    expect(helpful.status).toBe("computed");
    if (helpful.status === "computed") {
      expect(helpful.rate).toBe(1);
    }
  });

  it("preserves duplicate raw Evidence for Data Quality detection", async () => {
    const start = readingStarted("2026-09-23T00:00:00.000Z");

    await repository.insert({
      event: start,
      ingested_at: "2026-09-23T00:00:01.000Z",
    });
    await repository.insert({
      event: start,
      ingested_at: "2026-09-23T00:00:02.000Z",
    });

    const records = await repository.listByIngestedAtWindow({
      from_ingested_at: "2026-09-23T00:00:00.000Z",
      to_ingested_at: "2026-09-23T00:01:00.000Z",
      limit: 100,
    });

    expect(records).toHaveLength(2);
    const evidence = calculateReadingFlowCompletion(
      records.map((record) => record.event),
    );
    expect(evidence.status).toBe("computed");
    if (evidence.status === "computed") {
      expect(evidence.data_quality.duplicate_events).toBe(1);
    }
  });

  it("counts and deletes raw Evidence using ingested_at, not occurred_at", async () => {
    const futureOccurred = readingStarted("2099-01-01T00:00:00.000Z");

    await repository.insert({
      event: futureOccurred,
      ingested_at: "2026-08-01T00:00:00.000Z",
    });
    await repository.insert({
      event: readingCompleted("2026-08-01T00:00:10.000Z"),
      ingested_at: "2026-08-01T00:00:11.000Z",
    });
    await repository.insert({
      event: readingFeedback("2026-09-22T00:00:00.000Z"),
      ingested_at: "2026-09-22T00:00:01.000Z",
    });

    const cutoff = "2026-09-01T00:00:00.000Z";
    expect(await repository.countBeforeIngestedAt(cutoff)).toBe(2);
    expect(await repository.deleteBeforeIngestedAt(cutoff)).toBe(2);
    expect(await repository.countBeforeIngestedAt(cutoff)).toBe(0);

    const remaining = await repository.listByIngestedAtWindow({
      from_ingested_at: cutoff,
      to_ingested_at: "2026-10-01T00:00:00.000Z",
      limit: 100,
    });
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.event.event_name).toBe(
      "reading_feedback_submitted",
    );
  });

  it("rejects an unbounded export request before querying", async () => {
    await expect(
      repository.listByIngestedAtWindow({
        from_ingested_at: "2026-09-23T00:00:00.000Z",
        to_ingested_at: "2026-09-24T00:00:00.000Z",
        limit: 5_001,
      }),
    ).rejects.toThrow("export limit");
  });
});

async function readMigration(file: string): Promise<string> {
  return fs.readFile(path.join(process.cwd(), "db", "migrations", file), "utf8");
}

const sessionId = "session_550e8400-e29b-41d4-a716-446655440000";
const flowId = "reading-flow_550e8400-e29b-41d4-a716-446655440001";

function readingStarted(occurredAt: string): ProductTelemetryEvent {
  return {
    event_name: "reading_started",
    event_version: 1,
    occurred_at: occurredAt,
    anonymous_session_id: sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: flowId,
      reading_type: "reflection",
      entry_context: "self_reflection",
    },
  };
}

function readingCompleted(occurredAt: string): ProductTelemetryEvent {
  return {
    event_name: "reading_completed",
    event_version: 1,
    occurred_at: occurredAt,
    anonymous_session_id: sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: flowId,
      reading_type: "reflection",
      duration_bucket: "lt_30s",
    },
  };
}

function readingFeedback(occurredAt: string): ProductTelemetryEvent {
  return {
    event_name: "reading_feedback_submitted",
    event_version: 1,
    occurred_at: occurredAt,
    anonymous_session_id: sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: flowId,
      helpfulness: "helpful",
      feedback_reason_category: "none",
    },
  };
}
