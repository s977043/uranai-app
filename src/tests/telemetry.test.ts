import { describe, expect, it } from "vitest";

import {
  createAnonymousSessionId,
  createReadingFlowId,
} from "@/adapters/telemetry/identifiers";
import {
  InMemoryTelemetrySink,
  recordTelemetryEvent,
} from "@/adapters/telemetry/sink";
import {
  validateTelemetryEvent,
  type ProductTelemetryEvent,
} from "@/domain/telemetry/events";
import {
  calculateHelpfulFeedbackRate,
  calculateReadingFlowCompletion,
} from "@/domain/telemetry/metrics";

const SESSION_ID = "session_11111111-1111-4111-8111-111111111111";
const SESSION_ID_2 = "session_22222222-2222-4222-8222-222222222222";
const FLOW_ID = "reading-flow_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const FLOW_ID_2 = "reading-flow_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const FLOW_ID_3 = "reading-flow_cccccccc-cccc-4ccc-8ccc-cccccccccccc";

function started(
  flowId: string,
  occurredAt = "2026-09-15T10:00:00.000Z",
  sessionId = SESSION_ID,
): ProductTelemetryEvent {
  return {
    event_name: "reading_started",
    event_version: 1,
    occurred_at: occurredAt,
    anonymous_session_id: sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: flowId,
      reading_type: "tarot",
      entry_context: "self_reflection",
    },
  };
}

function completed(
  flowId: string,
  occurredAt = "2026-09-15T10:01:00.000Z",
  sessionId = SESSION_ID,
): ProductTelemetryEvent {
  return {
    event_name: "reading_completed",
    event_version: 1,
    occurred_at: occurredAt,
    anonymous_session_id: sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: flowId,
      reading_type: "tarot",
      duration_bucket: "30s_2m",
    },
  };
}

function feedback(
  flowId: string,
  helpfulness: "helpful" | "neutral" | "not_helpful",
  occurredAt = "2026-09-15T10:02:00.000Z",
): ProductTelemetryEvent {
  return {
    event_name: "reading_feedback_submitted",
    event_version: 1,
    occurred_at: occurredAt,
    anonymous_session_id: SESSION_ID,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: flowId,
      helpfulness,
      feedback_reason_category: helpfulness === "helpful" ? "actionable" : "too_generic",
    },
  };
}

describe("telemetry event contract", () => {
  it("allows only the documented reading_started properties", () => {
    expect(validateTelemetryEvent(started(FLOW_ID))).toEqual({
      ok: true,
      event: started(FLOW_ID),
    });
  });

  it.each([
    ["email", "person@example.com"],
    ["name", "Example User"],
    ["consultation_text", "raw consultation"],
    ["raw_prompt", "secret prompt"],
  ])("rejects unknown / sensitive property %s", (key, value) => {
    const event = started(FLOW_ID) as ProductTelemetryEvent & {
      properties: Record<string, unknown>;
    };
    const unsafe = {
      ...event,
      properties: { ...event.properties, [key]: value },
    };

    const result = validateTelemetryEvent(unsafe);
    expect(result.ok).toBe(false);
  });

  it("rejects cross-session visitor identity", () => {
    const unsafe = {
      ...started(FLOW_ID),
      anonymous_visitor_id: "visitor-123",
    };
    const result = validateTelemetryEvent(unsafe);
    expect(result.ok).toBe(false);
  });

  it("rejects non-random-looking session and reading-flow identifiers", () => {
    const unsafe = {
      ...started(FLOW_ID),
      anonymous_session_id: "session_person@example.com",
      properties: {
        ...started(FLOW_ID).properties,
        reading_flow_id: "reading-flow_user-123",
      },
    };
    const result = validateTelemetryEvent(unsafe);
    expect(result.ok).toBe(false);
  });
});

describe("telemetry anonymous identifiers", () => {
  it("creates prefixed IDs from an injected random UUID source", () => {
    const uuid = () => "12345678-1234-4234-8234-123456789abc";
    expect(createAnonymousSessionId(uuid)).toBe(
      "session_12345678-1234-4234-8234-123456789abc",
    );
    expect(createReadingFlowId(uuid)).toBe(
      "reading-flow_12345678-1234-4234-8234-123456789abc",
    );
  });
});

describe("telemetry sink", () => {
  it("validates before writing and returns an isolated snapshot", async () => {
    const sink = new InMemoryTelemetrySink();
    await recordTelemetryEvent(started(FLOW_ID), sink);

    const snapshot = sink.snapshot();
    expect(snapshot).toEqual([started(FLOW_ID)]);

    snapshot[0].occurred_at = "2030-01-01T00:00:00.000Z";
    expect(sink.snapshot()[0].occurred_at).toBe("2026-09-15T10:00:00.000Z");
  });

  it("does not persist invalid telemetry", async () => {
    const sink = new InMemoryTelemetrySink();
    await expect(
      recordTelemetryEvent(
        { ...started(FLOW_ID), anonymous_visitor_id: "visitor-123" },
        sink,
      ),
    ).rejects.toThrow("invalid telemetry event");
    expect(sink.snapshot()).toEqual([]);
  });
});

describe("Reading Flow Completion", () => {
  it("counts flows, not sessions, and reports data-quality anomalies", () => {
    const result = calculateReadingFlowCompletion([
      started(FLOW_ID),
      completed(FLOW_ID),
      started(FLOW_ID_2, "2026-09-15T10:03:00.000Z"),
      started(FLOW_ID_2, "2026-09-15T10:03:01.000Z"),
      completed(FLOW_ID_3, "2026-09-15T10:04:00.000Z"),
    ]);

    expect(result).toEqual({
      status: "observable",
      numerator: 1,
      denominator: 2,
      rate: 0.5,
      sample_size: 2,
      data_quality: {
        duplicate_events: 1,
        orphan_events: 1,
        out_of_order_events: 0,
      },
    });
  });

  it("does not count completion before start or across sessions", () => {
    const result = calculateReadingFlowCompletion([
      completed(FLOW_ID, "2026-09-15T09:59:00.000Z"),
      started(FLOW_ID),
      started(FLOW_ID_2),
      completed(FLOW_ID_2, "2026-09-15T10:01:00.000Z", SESSION_ID_2),
    ]);

    expect(result.status).toBe("observable");
    if (result.status === "observable") {
      expect(result.numerator).toBe(0);
      expect(result.denominator).toBe(2);
      expect(result.data_quality.out_of_order_events).toBe(1);
      expect(result.data_quality.orphan_events).toBe(1);
    }
  });

  it("returns not_observable instead of 0% when no start evidence exists", () => {
    expect(calculateReadingFlowCompletion([])).toEqual({
      status: "not_observable",
      reason: "missing_required_evidence",
      sample_size: 0,
    });
  });
});

describe("Helpful Feedback Rate", () => {
  it("deduplicates feedback by reading flow and keeps sample size explicit", () => {
    const result = calculateHelpfulFeedbackRate([
      feedback(FLOW_ID, "helpful"),
      feedback(FLOW_ID, "not_helpful", "2026-09-15T10:03:00.000Z"),
      feedback(FLOW_ID_2, "not_helpful"),
    ]);

    expect(result).toEqual({
      status: "observable",
      numerator: 1,
      denominator: 2,
      rate: 0.5,
      sample_size: 2,
      data_quality: {
        duplicate_events: 1,
        orphan_events: 0,
        out_of_order_events: 0,
      },
    });
  });

  it("returns not_observable when feedback evidence is absent", () => {
    expect(calculateHelpfulFeedbackRate([started(FLOW_ID)])).toEqual({
      status: "not_observable",
      reason: "zero_denominator",
      sample_size: 0,
    });
  });
});
