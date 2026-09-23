import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

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
    const boundary = Date.parse(cutoff);
    return this.records.filter(
      (record) => Date.parse(record.ingested_at) < boundary,
    ).length;
  }

  async deleteBeforeIngestedAt(cutoff: string): Promise<number> {
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

function cloneRecord(record: TelemetryEvidenceRecord): TelemetryEvidenceRecord {
  return {
    ingested_at: record.ingested_at,
    event: {
      ...record.event,
      properties: { ...record.event.properties },
    } as ProductTelemetryEvent,
  };
}
