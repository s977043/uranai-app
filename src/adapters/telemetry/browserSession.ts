import {
  createAnonymousSessionId,
  isAnonymousSessionId,
} from "@/adapters/telemetry/identifiers";
import type { TelemetrySink } from "@/adapters/telemetry/sink";
import {
  validateTelemetryEvent,
  type ProductTelemetryEvent,
} from "@/domain/telemetry/events";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const SESSION_ID_KEY = "uranai.telemetry.session-id.v1";
const EVENTS_KEY = "uranai.telemetry.events.v1";
const MAX_SESSION_EVENTS = 100;

export function getOrCreateAnonymousSessionId(
  storage: StorageLike,
  createId: () => string = createAnonymousSessionId,
): string {
  const existing = storage.getItem(SESSION_ID_KEY);
  if (existing !== null && isAnonymousSessionId(existing)) return existing;

  const created = createId();
  if (!isAnonymousSessionId(created)) {
    throw new Error("anonymous telemetry session id must be UUID v4 based");
  }
  storage.setItem(SESSION_ID_KEY, created);
  return created;
}

export function readSessionTelemetry(
  storage: StorageLike,
): ProductTelemetryEvent[] {
  const raw = storage.getItem(EVENTS_KEY);
  if (raw === null) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const events: ProductTelemetryEvent[] = [];
    for (const item of parsed) {
      const result = validateTelemetryEvent(item);
      if (result.ok) events.push(result.event);
    }
    return events;
  } catch {
    return [];
  }
}

export class SessionStorageTelemetrySink implements TelemetrySink {
  constructor(private readonly storage: StorageLike) {}

  write(event: ProductTelemetryEvent): void {
    const events = readSessionTelemetry(this.storage);
    const next = [...events, event].slice(-MAX_SESSION_EVENTS);
    this.storage.setItem(EVENTS_KEY, JSON.stringify(next));
  }
}

export function clearSessionTelemetry(storage: StorageLike): void {
  storage.removeItem(EVENTS_KEY);
}
