import postgres from "postgres";

import {
  assertCanonicalEvidenceTimestamp,
  assertTelemetryEvidenceWindow,
  type OperationalTelemetryEvidenceRepository,
  type TelemetryEvidenceRecord,
  type TelemetryEvidenceWindow,
} from "@/adapters/telemetry/evidenceRepository";
import {
  type ProductTelemetryEvent,
  validateTelemetryEvent,
} from "@/domain/telemetry/events";

type Sql = ReturnType<typeof postgres>;

type TelemetryRow = {
  event_name: string;
  event_version: number;
  occurred_at: Date | string;
  ingested_at: Date | string;
  anonymous_session_id: string;
  properties: unknown;
};

export class PostgresTelemetryEvidenceRepository
  implements OperationalTelemetryEvidenceRepository
{
  constructor(private readonly sql: Sql) {}

  async insert(record: TelemetryEvidenceRecord): Promise<void> {
    const event = record.event;
    await this.sql`
      INSERT INTO telemetry_evidence (
        event_name,
        event_version,
        occurred_at,
        ingested_at,
        anonymous_session_id,
        properties
      )
      VALUES (
        ${event.event_name},
        ${event.event_version},
        ${event.occurred_at},
        ${record.ingested_at},
        ${event.anonymous_session_id},
        ${this.sql.json(event.properties)}
      )
    `;
  }

  async listByIngestedAtWindow(
    window: TelemetryEvidenceWindow,
  ): Promise<TelemetryEvidenceRecord[]> {
    assertTelemetryEvidenceWindow(window);

    const rows = await this.sql<TelemetryRow[]>`
      SELECT
        event_name,
        event_version,
        occurred_at,
        ingested_at,
        anonymous_session_id,
        properties
      FROM telemetry_evidence
      WHERE ingested_at >= ${window.from_ingested_at}
        AND ingested_at < ${window.to_ingested_at}
      ORDER BY ingested_at ASC, id ASC
      LIMIT ${window.limit}
    `;

    return rows.map(rowToRecord);
  }

  async countBeforeIngestedAt(cutoff: string): Promise<number> {
    assertCanonicalEvidenceTimestamp(cutoff, "retention cutoff");
    const rows = await this.sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM telemetry_evidence
      WHERE ingested_at < ${cutoff}
    `;
    return Number(rows[0]?.count ?? 0);
  }

  async deleteBeforeIngestedAt(cutoff: string): Promise<number> {
    assertCanonicalEvidenceTimestamp(cutoff, "retention cutoff");
    const rows = await this.sql<{ count: number }[]>`
      WITH deleted AS (
        DELETE FROM telemetry_evidence
        WHERE ingested_at < ${cutoff}
        RETURNING 1
      )
      SELECT COUNT(*)::int AS count FROM deleted
    `;
    return Number(rows[0]?.count ?? 0);
  }
}

let sharedSql: Sql | undefined;
let sharedRepository: PostgresTelemetryEvidenceRepository | undefined;

export function getPostgresTelemetryEvidenceRepository(
  connectionString = process.env.DATABASE_URL,
): PostgresTelemetryEvidenceRepository {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for telemetry persistence");
  }

  if (!sharedSql) {
    sharedSql = postgres(connectionString, {
      max: 2,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      prepare: false,
    });
    sharedRepository = new PostgresTelemetryEvidenceRepository(sharedSql);
  }

  return sharedRepository as PostgresTelemetryEvidenceRepository;
}

function rowToRecord(row: TelemetryRow): TelemetryEvidenceRecord {
  const candidate = {
    event_name: row.event_name,
    event_version: row.event_version,
    occurred_at: canonicalTimestamp(row.occurred_at),
    anonymous_session_id: row.anonymous_session_id,
    anonymous_visitor_id: null,
    properties: row.properties,
  };

  const validation = validateTelemetryEvent(candidate);
  if (!validation.ok) {
    throw new Error("stored telemetry does not satisfy ProductTelemetryEvent contract");
  }

  return {
    event: validation.event as ProductTelemetryEvent,
    ingested_at: canonicalTimestamp(row.ingested_at),
  };
}

function canonicalTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("stored telemetry timestamp is invalid");
  }
  return date.toISOString();
}
