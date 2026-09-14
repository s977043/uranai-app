import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

type ReadingStartedEvent = Extract<
  ProductTelemetryEvent,
  { event_name: "reading_started" }
>;
type ReadingCompletedEvent = Extract<
  ProductTelemetryEvent,
  { event_name: "reading_completed" }
>;
type ReadingFeedbackEvent = Extract<
  ProductTelemetryEvent,
  { event_name: "reading_feedback_submitted" }
>;

type DataQuality = {
  duplicate_events: number;
  orphan_events: number;
  out_of_order_events: number;
  dimension_mismatch_events: number;
};

type ComputedMetric = {
  status: "computed";
  numerator: number;
  denominator: number;
  rate: number;
  sample_size: number;
  data_quality: DataQuality;
};

type NotComputableMetric = {
  status: "not_computable";
  reason: "missing_required_evidence" | "zero_denominator";
  sample_size: 0;
  data_quality: DataQuality;
};

export type MetricEvidence = ComputedMetric | NotComputableMetric;

function timestamp(value: string): number {
  return Date.parse(value);
}

function dataQuality(
  duplicateEvents: number,
  orphanEvents: number,
  outOfOrderEvents: number,
  dimensionMismatchEvents = 0,
): DataQuality {
  return {
    duplicate_events: duplicateEvents,
    orphan_events: orphanEvents,
    out_of_order_events: outOfOrderEvents,
    dimension_mismatch_events: dimensionMismatchEvents,
  };
}

export function calculateReadingFlowCompletion(
  events: readonly ProductTelemetryEvent[],
): MetricEvidence {
  const starts = new Map<string, ReadingStartedEvent>();
  const completions = new Map<string, ReadingCompletedEvent>();
  let duplicateEvents = 0;

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
      data_quality: dataQuality(duplicateEvents, completions.size, 0),
    };
  }

  let completed = 0;
  let orphanEvents = 0;
  let outOfOrderEvents = 0;
  let dimensionMismatchEvents = 0;

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
    if (completion.properties.reading_type !== start.properties.reading_type) {
      dimensionMismatchEvents += 1;
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
    data_quality: dataQuality(
      duplicateEvents,
      orphanEvents,
      outOfOrderEvents,
      dimensionMismatchEvents,
    ),
  };
}

export function calculateHelpfulFeedbackRate(
  events: readonly ProductTelemetryEvent[],
): MetricEvidence {
  const completions = new Map<string, ReadingCompletedEvent>();
  const feedbackByFlow = new Map<string, ReadingFeedbackEvent>();
  let duplicateEvents = 0;

  for (const event of events) {
    if (event.event_name === "reading_completed") {
      const flowId = event.properties.reading_flow_id;
      if (!completions.has(flowId)) completions.set(flowId, event);
    }
    if (event.event_name === "reading_feedback_submitted") {
      const flowId = event.properties.reading_flow_id;
      if (feedbackByFlow.has(flowId)) {
        duplicateEvents += 1;
        continue;
      }
      feedbackByFlow.set(flowId, event);
    }
  }

  const eligibleFeedback: ReadingFeedbackEvent[] = [];
  let orphanEvents = 0;
  let outOfOrderEvents = 0;

  for (const [flowId, feedback] of feedbackByFlow) {
    const completion = completions.get(flowId);
    if (!completion || completion.anonymous_session_id !== feedback.anonymous_session_id) {
      orphanEvents += 1;
      continue;
    }
    if (timestamp(feedback.occurred_at) < timestamp(completion.occurred_at)) {
      outOfOrderEvents += 1;
      continue;
    }
    eligibleFeedback.push(feedback);
  }

  if (eligibleFeedback.length === 0) {
    return {
      status: "not_computable",
      reason: events.length === 0 ? "missing_required_evidence" : "zero_denominator",
      sample_size: 0,
      data_quality: dataQuality(
        duplicateEvents,
        orphanEvents,
        outOfOrderEvents,
      ),
    };
  }

  const helpful = eligibleFeedback.filter(
    (event) => event.properties.helpfulness === "helpful",
  ).length;

  return {
    status: "computed",
    numerator: helpful,
    denominator: eligibleFeedback.length,
    rate: helpful / eligibleFeedback.length,
    sample_size: eligibleFeedback.length,
    data_quality: dataQuality(
      duplicateEvents,
      orphanEvents,
      outOfOrderEvents,
    ),
  };
}
