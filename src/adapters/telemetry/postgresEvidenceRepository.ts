import type { Pool } from "pg";

import type {
  ProductTelemetryEvent,
} from "@/domain/telemetry/events";
import { validateTelemetryEvent } from "@/domain/telemetry/events";
import type {
  TelemetryEvidenceRecord,
  TelemetryEvidenceRepository,
} from "@/adapters/telemetry/evidenceRepository";

export const MAX_EVIDENCE_QUERY_ROWS = 5_000;

export type TelemetryEvidenceQuery = {
  readonly from_ingested_at: string;
  readonly to_ingested_at: string;
  readonly anonymous_session_id?: string;
  readonly reading_flow_id?: string;
  readonly event_name?: ProductTelemetryEvent["event_name"];
  readonly limit?: number;
};

type TelemetryEvidenceRow = {
  event_name: ProductTelemetryEvent["event_name"];
  event_version: number;
  occurred_at: Date | string;
  ingested_at: Date | string;
  anonymous_session_id: string;
  anonymous_visitor_id: null;
  properties: unknown;
};

type QueryablePool = Pick<Pool, "query">;

export class PostgresTelemetryEvidenceRepository
  implements TelemetryEvidenceRepository
{
  constructor(private readonly pool: QueryablePool) {}

  async insert(record: TelemetryEvidenceRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO telemetry_evidence (
        event_name,
        event_version,
        occurred_at,
        ingested_at,
        anonymous_session_id,
        anonymous_visitor_id,
        properties
      ) VALUES ($1, $2, $3::timestamptz, $4::timestamptz, $5, $6, $7::jsonb)`,
      [
        record.event.event_name,
        record.event.event_version,
        record.event.occurred_at,
        record.ingested_at,
        record.event.anonymous_session_id,
        record.event.anonymous_visitor_id,
        JSON.stringify(record.event.properties),
      ],
    );
  }

  async list(query: TelemetryEvidenceQuery): Promise<TelemetryEvidenceRecord[]> {
    assertCanonicalIso(query.from_ingested_at, "from_ingested_at");
    assertCanonicalIso(query.to_ingested_at, "to_ingested_at");
    if (Date.parse(query.from_ingested_at) >= Date.parse(query.to_ingested_at)) {
      throw new RangeError("from_ingested_at must be earlier than to_ingested_at");
    }

    const limit = normalizeLimit(query.limit);
    const clauses = [
      "ingested_at >= $1::timestamptz",
      "ingested_at < $2::timestamptz",
    ];
    const values: unknown[] = [
      query.from_ingested_at,
      query.to_ingested_at,
    ];

    if (query.anonymous_session_id !== undefined) {
      values.push(query.anonymous_session_id);
      clauses.push(`anonymous_session_id = $${values.length}`);
    }
    if (query.reading_flow_id !== undefined) {
      values.push(query.reading_flow_id);
      clauses.push(`properties ->> 'reading_flow_id' = $${values.length}`);
    }
    if (query.event_name !== undefined) {
      values.push(query.event_name);
      clauses.push(`event_name = $${values.length}`);
    }

    values.push(limit);
    const result = await this.pool.query<TelemetryEvidenceRow>(
      `SELECT
        event_name,
        event_version,
        occurred_at,
        ingested_at,
        anonymous_session_id,
        anonymous_visitor_id,
        properties
      FROM telemetry_evidence
      WHERE ${clauses.join(" AND ")}
      ORDER BY ingested_at ASC, id ASC
      LIMIT $${values.length}`,
      values,
    );

    return result.rows.map(rowToRecord);
  }

  async countBefore(cutoffIngestedAt: string): Promise<number> {
    assertCanonicalIso(cutoffIngestedAt, "cutoffIngestedAt");
    const result = await this.pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM telemetry_evidence WHERE ingested_at < $1::timestamptz",
      [cutoffIngestedAt],
    );
    return Number(result.rows[0]?.count ?? "0");
  }

  async deleteBefore(cutoffIngestedAt: string): Promise<number> {
    assertCanonicalIso(cutoffIngestedAt, "cutoffIngestedAt");
    const result = await this.pool.query(
      "DELETE FROM telemetry_evidence WHERE ingested_at < $1::timestamptz",
      [cutoffIngestedAt],
    );
    return result.rowCount ?? 0;
  }
}

function rowToRecord(row: TelemetryEvidenceRow): TelemetryEvidenceRecord {
  const candidate: unknown = {
    event_name: row.event_name,
    event_version: row.event_version,
    occurred_at: toCanonicalIso(row.occurred_at),
    anonymous_session_id: row.anonymous_session_id,
    anonymous_visitor_id: row.anonymous_visitor_id,
    properties: row.properties,
  };

  const validation = validateTelemetryEvent(candidate);
  if (!validation.ok) {
    throw new Error("stored telemetry evidence failed contract validation");
  }

  return {
    event: validation.event,
    ingested_at: toCanonicalIso(row.ingested_at),
  };
}

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) return 1_000;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_EVIDENCE_QUERY_ROWS) {
    throw new RangeError(
      `limit must be a safe integer between 1 and ${MAX_EVIDENCE_QUERY_ROWS}`,
    );
  }
  return limit;
}

function assertCanonicalIso(value: string, name: string): void {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed) || new Date(parsed).toISOString() !== value) {
    throw new RangeError(`${name} must be canonical ISO-8601`);
  }
}

function toCanonicalIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error("stored telemetry timestamp is invalid");
  }
  return new Date(parsed).toISOString();
}
