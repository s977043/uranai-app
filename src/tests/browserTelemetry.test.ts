import { describe, expect, it } from "vitest";

import {
  getOrCreateAnonymousSessionId,
  readSessionTelemetry,
  SessionStorageTelemetrySink,
  type StorageLike,
} from "@/adapters/telemetry/browserSession";
import { recordTelemetryEvent } from "@/adapters/telemetry/sink";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const VALID_SESSION_ID = "session_11111111-1111-4111-8111-111111111111";
const VALID_FLOW_ID = "reading-flow_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("browser telemetry session", () => {
  it("reuses a valid session-scoped identifier", () => {
    const storage = new MemoryStorage();
    expect(getOrCreateAnonymousSessionId(storage, () => VALID_SESSION_ID)).toBe(VALID_SESSION_ID);
    expect(
      getOrCreateAnonymousSessionId(storage, () => {
        throw new Error("should not generate another id");
      }),
    ).toBe(VALID_SESSION_ID);
  });

  it("rotates an invalid stored identifier and clears stale telemetry", () => {
    const storage = new MemoryStorage();
    storage.setItem("uranai.telemetry.session-id.v1", "session_person@example.com");
    storage.setItem("uranai.telemetry.events.v1", JSON.stringify([{ stale: true }]));

    expect(getOrCreateAnonymousSessionId(storage, () => VALID_SESSION_ID)).toBe(VALID_SESSION_ID);
    expect(storage.getItem("uranai.telemetry.events.v1")).toBeNull();
  });

  it("rejects a generator that does not return a UUID v4 session id", () => {
    const storage = new MemoryStorage();
    expect(() => getOrCreateAnonymousSessionId(storage, () => "session_bad")).toThrow(
      "UUID v4",
    );
  });

  it("stores and restores only schema-valid session telemetry", async () => {
    const storage = new MemoryStorage();
    const sink = new SessionStorageTelemetrySink(storage);

    await recordTelemetryEvent(
      {
        event_name: "reading_started",
        event_version: 1,
        occurred_at: "2026-09-15T00:00:00.000Z",
        anonymous_session_id: VALID_SESSION_ID,
        anonymous_visitor_id: null,
        properties: {
          reading_flow_id: VALID_FLOW_ID,
          reading_type: "reflection",
          entry_context: "self_reflection",
        },
      },
      sink,
    );

    expect(readSessionTelemetry(storage)).toHaveLength(1);
  });

  it("drops invalid persisted events such as payloads containing PII fields", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "uranai.telemetry.events.v1",
      JSON.stringify([
        {
          event_name: "reading_started",
          event_version: 1,
          occurred_at: "2026-09-15T00:00:00.000Z",
          anonymous_session_id: VALID_SESSION_ID,
          anonymous_visitor_id: null,
          properties: {
            reading_flow_id: VALID_FLOW_ID,
            reading_type: "reflection",
            entry_context: "self_reflection",
            email: "person@example.com",
          },
        },
      ]),
    );

    expect(readSessionTelemetry(storage)).toEqual([]);
  });
});
