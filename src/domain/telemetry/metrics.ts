import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

type ComputedMetric = {
  status: "computed";
  numerator: number;
  denominator: number;
  rate: number;
  sample_size: number;
  data_quality: {
    duplicate_events: number;
    orphan_events: number;
    out_of_order_events: number;
  };
};

type NotComputableMetric = {
  status: "not_computable";
  reason: "missing_required_evidence" | "zero_denominator";
  sample_size: 0;
};

export type MetricEvidence = ComputedMetric | NotComputableMetric;

function timestamp(value: string): number {
  return Date.parse(value);
}

export function calculateReadingFlowCompletion(
  events: readonly ProductTelemetryEvent[],
): MetricEvidence {
  const starts = new Map<string, ProductTelemetryEvent & { event_name: "reading_started" }>();
  const completions = new Map<
    string,
    ProductTelemetryEvent & { event_name: "reading_completed" }
  >();
  let duplicateEvents = 0;
  let orphanEvents = 0;
  let outOfOrderEvents = 0;

  for (const event of events) {
    if (event.event_name === "reading_started") {
      const flowId = event.properties.reading_flow_id;
      if (starts.has(flowId)) {
        duplicateEvents += 1;
        continue;
      }
      starts.set(flowId, event);
    }

    if (event.event_name === "reading_completed") {
      const flowId = event.properties.reading_flow_id;
      if (completions.has(flowId)) {
        duplicateEvents += 1;
        continue;
      }
      completions.set(flowId, event);
    }
  }

  if (starts.size === 0) {
    return {
      status: "not_computable",
      reason: events.length === 0 ? "missing_required_evidence" : "zero_denominator",
      sample_size: 0,
    };
  }

  let completed = 0;
  for (const [flowId, completion] of completions) {
    const start = starts.get(flowId);
    if (!start) {
      orphanEvents += 1;
      continue;
    }
    if (timestamp(completion.occurred_at) < timestamp(start.occurred_at)) {
      outOfOrderEvents += 1;
      continue;
    }
    if (completion.anonymous_session_id !== start.anonymous_session_id) {
      orphanEvents += 1;
      continue;
    }
    completed += 1;
  }

  return {
    status: "computed",
    numerator: completed,
    denominator: starts.size,
    rate: completed / starts.size,
    sample_size: starts.size,
    data_quality: {
      duplicate_events: duplicateEvents,
      orphan_events: orphanEvents,
      out_of_order_events: outOfOrderEvents,
    },
  };
}

export function calculateHelpfulFeedbackRate(
  events: readonly ProductTelemetryEvent[],
): MetricEvidence {
  const feedbackByFlow = new Map<
    string,
    ProductTelemetryEvent & { event_name: "reading_feedback_submitted" }
  >();
  let duplicateEvents = 0;

  for (const event of events) {
    if (event.event_name !== "reading_feedback_submitted") continue;
    const flowId = event.properties.reading_flow_id;
    if (feedbackByFlow.has(flowId)) {
      duplicateEvents += 1;
      continue;
    }
    feedbackByFlow.set(flowId, event);
  }

  if (feedbackByFlow.size === 0) {
    return {
      status: "not_computable",
      reason: events.length === 0 ? "missing_required_evidence" : "zero_denominator",
      sample_size: 0,
    };
  }

  const helpful = [...feedbackByFlow.values()].filter(
    (event) => event.properties.helpfulness === "helpful",
  ).length;

  return {
    status: "computed",
    numerator: helpful,
    denominator: feedbackByFlow.size,
    rate: helpful / feedbackByFlow.size,
    sample_size: feedbackByFlow.size,
    data_quality: {
      duplicate_events: duplicateEvents,
      orphan_events: 0,
      out_of_order_events: 0,
    },
  };
}
