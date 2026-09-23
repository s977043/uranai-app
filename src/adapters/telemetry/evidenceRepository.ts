import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

export const MAX_TELEMETRY_EVIDENCE_EXPORT_EVENTS = 5_000;

export type TelemetryEvidenceRecord = {
  readonly event: ProductTelemetryEvent;
  readonly ingested_at: string;
};

export type TelemetryEvidenceWindow = {
  readonly from_ingested_at: string;
  readonly to_ingested_at: string;
  readonly limit: number;
};

export interface TelemetryEvidenceRepository {
  insert(record: TelemetryEvidenceRecord): Promise<void>;
}

export interface TelemetryEvidenceReader {
  listByIngestedAtWindow(
    window: TelemetryEvidenceWindow,
  ): Promise<TelemetryEvidenceRecord[]>;
}

export interface TelemetryEvidenceRetentionRepository {
  countBeforeIngestedAt(cutoff: string): Promise<number>;
  deleteBeforeIngestedAt(cutoff: string): Promise<number>;
}

export type OperationalTelemetryEvidenceRepository =
  TelemetryEvidenceRepository &
    TelemetryEvidenceReader &
    TelemetryEvidenceRetentionRepository;

export class InMemoryTelemetryEvidenceRepository
  implements OperationalTelemetryEvidenceRepository
{
  private readonly records: TelemetryEvidenceRecord[] = [];

  async insert(record: TelemetryEvidenceRecord): Promise<void> {
    this.records.push(cloneRecord(record));
  }

  async listByIngestedAtWindow(
    window: TelemetryEvidenceWindow,
  ): Promise<TelemetryEvidenceRecord[]> {
    assertTelemetryEvidenceWindow(window);
    const from = Date.parse(window.from_ingested_at);
    const to = Date.parse(window.to_ingested_at);
    return this.records
      .filter((record) => {
        const timestamp = Date.parse(record.ingested_at);
        return timestamp >= from && timestamp < to;
      })
      .sort(
        (left, right) =>
          Date.parse(left.ingested_at) - Date.parse(right.ingested_at),
      )
      .slice(0, window.limit)
      .map(cloneRecord);
  }

  async countBeforeIngestedAt(cutoff: string): Promise<number> {
    assertCanonicalEvidenceTimestamp(cutoff, "retention cutoff");
    const boundary = Date.parse(cutoff);
    return this.records.filter(
      (record) => Date.parse(record.ingested_at) < boundary,
    ).length;
  }

  async deleteBeforeIngestedAt(cutoff: string): Promise<number> {
    assertCanonicalEvidenceTimestamp(cutoff, "retention cutoff");
    const boundary = Date.parse(cutoff);
    const retained = this.records.filter(
      (record) => Date.parse(record.ingested_at) >= boundary,
    );
    const deleted = this.records.length - retained.length;
    this.records.length = 0;
    this.records.push(...retained);
    return deleted;
  }

  snapshot(): TelemetryEvidenceRecord[] {
    return this.records.map(cloneRecord);
  }

  clear(): void {
    this.records.length = 0;
  }
}

export function assertTelemetryEvidenceWindow(
  window: TelemetryEvidenceWindow,
): void {
  assertCanonicalEvidenceTimestamp(window.from_ingested_at, "window start");
  assertCanonicalEvidenceTimestamp(window.to_ingested_at, "window end");

  if (
    Date.parse(window.from_ingested_at) >= Date.parse(window.to_ingested_at)
  ) {
    throw new RangeError("telemetry evidence window start must be before end");
  }

  if (
    !Number.isInteger(window.limit) ||
    window.limit < 1 ||
    window.limit > MAX_TELEMETRY_EVIDENCE_EXPORT_EVENTS
  ) {
    throw new RangeError(
      `telemetry evidence export limit must be 1..${MAX_TELEMETRY_EVIDENCE_EXPORT_EVENTS}`,
    );
  }
}

export function assertCanonicalEvidenceTimestamp(
  value: string,
  label: string,
): void {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed) || new Date(parsed).toISOString() !== value) {
    throw new RangeError(`${label} must be canonical ISO-8601`);
  }
}

function cloneRecord(record: TelemetryEvidenceRecord): TelemetryEvidenceRecord {
  return {
    ingested_at: record.ingested_at,
    event: {
      ...record.event,
      properties: { ...record.event.properties },
    } as ProductTelemetryEvent,
  };
}
