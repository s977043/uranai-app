import { describe, expect, it } from "vitest";

import { validateTelemetryEvent } from "@/domain/telemetry/events";

const baseEvent = {
  event_name: "reading_started",
  event_version: 1,
  occurred_at: "2026-09-15T10:00:00.000Z",
  anonymous_session_id: "session_11111111-1111-4111-8111-111111111111",
  anonymous_visitor_id: null,
  properties: {
    reading_flow_id: "reading-flow_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    reading_type: "tarot",
    entry_context: "self_reflection",
  },
} as const;

describe("telemetry canonical envelope", () => {
  it("rejects parseable but non-canonical timestamps", () => {
    expect(
      validateTelemetryEvent({
        ...baseEvent,
        occurred_at: "2026-09-15 10:00:00Z",
      }).ok,
    ).toBe(false);
  });

  it("rejects unknown top-level fields", () => {
    expect(
      validateTelemetryEvent({
        ...baseEvent,
        user_email: "person@example.com",
      }).ok,
    ).toBe(false);
  });
});
