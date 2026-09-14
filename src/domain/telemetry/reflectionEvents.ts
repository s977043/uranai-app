import type {
  DurationBucket,
  Helpfulness,
  ProductTelemetryEvent,
} from "@/domain/telemetry/events";
import type { ReadingContext } from "@/domain/reflectionReading";

type CommonInput = {
  readonly flowId: string;
  readonly sessionId: string;
  readonly occurredAt: string;
};

export function reflectionReadingStarted(
  input: CommonInput & { readonly context: ReadingContext },
): ProductTelemetryEvent {
  return {
    event_name: "reading_started",
    event_version: 1,
    occurred_at: input.occurredAt,
    anonymous_session_id: input.sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: input.flowId,
      reading_type: "reflection",
      entry_context: input.context,
    },
  };
}

export function reflectionReadingCompleted(
  input: CommonInput & { readonly durationBucket: DurationBucket },
): ProductTelemetryEvent {
  return {
    event_name: "reading_completed",
    event_version: 1,
    occurred_at: input.occurredAt,
    anonymous_session_id: input.sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: input.flowId,
      reading_type: "reflection",
      duration_bucket: input.durationBucket,
    },
  };
}

export function reflectionReadingFeedbackSubmitted(
  input: CommonInput & { readonly helpfulness: Helpfulness },
): ProductTelemetryEvent {
  return {
    event_name: "reading_feedback_submitted",
    event_version: 1,
    occurred_at: input.occurredAt,
    anonymous_session_id: input.sessionId,
    anonymous_visitor_id: null,
    properties: {
      reading_flow_id: input.flowId,
      helpfulness: input.helpfulness,
      feedback_reason_category: "none",
    },
  };
}
