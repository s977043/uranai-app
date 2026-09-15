import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

export type TelemetryEvidenceRecord = {
  readonly event: ProductTelemetryEvent;
  readonly ingested_at: string;
};

export interface TelemetryEvidenceRepository {
  insert(record: TelemetryEvidenceRecord): Promise<void>;
}

export class InMemoryTelemetryEvidenceRepository
  implements TelemetryEvidenceRepository
{
  private readonly records: TelemetryEvidenceRecord[] = [];

  async insert(record: TelemetryEvidenceRecord): Promise<void> {
    this.records.push(cloneRecord(record));
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
