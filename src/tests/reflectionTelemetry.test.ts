import { describe, expect, it } from "vitest";

import { validateTelemetryEvent } from "@/domain/telemetry/events";
import {
  reflectionReadingCompleted,
  reflectionReadingFeedbackSubmitted,
  reflectionReadingStarted,
} from "@/domain/telemetry/reflectionEvents";

const FLOW_ID = "reading-flow_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SESSION_ID = "session_11111111-1111-4111-8111-111111111111";

describe("reflection telemetry lifecycle", () => {
  it("keeps reading_type, session and flow correlation stable across the three product events", () => {
    const started = reflectionReadingStarted({
      flowId: FLOW_ID,
      sessionId: SESSION_ID,
      occurredAt: "2026-09-15T00:00:00.000Z",
      context: "work",
    });
    const completed = reflectionReadingCompleted({
      flowId: FLOW_ID,
      sessionId: SESSION_ID,
      occurredAt: "2026-09-15T00:00:05.000Z",
      durationBucket: "lt_30s",
    });
    const feedback = reflectionReadingFeedbackSubmitted({
      flowId: FLOW_ID,
      sessionId: SESSION_ID,
      occurredAt: "2026-09-15T00:00:06.000Z",
      helpfulness: "helpful",
    });

    for (const event of [started, completed, feedback]) {
      expect(validateTelemetryEvent(event).ok).toBe(true);
      expect(event.anonymous_session_id).toBe(SESSION_ID);
      expect(event.properties.reading_flow_id).toBe(FLOW_ID);
    }

    expect(started.properties.reading_type).toBe("reflection");
    expect(completed.properties.reading_type).toBe("reflection");
    expect(feedback.properties.feedback_reason_category).toBe("none");
  });

  it("does not infer a feedback reason from helpfulness", () => {
    for (const helpfulness of ["helpful", "neutral", "not_helpful"] as const) {
      const feedback = reflectionReadingFeedbackSubmitted({
        flowId: FLOW_ID,
        sessionId: SESSION_ID,
        occurredAt: "2026-09-15T00:00:06.000Z",
        helpfulness,
      });
      expect(feedback.properties.feedback_reason_category).toBe("none");
    }
  });
});
