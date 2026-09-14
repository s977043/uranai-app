export type ReadingType = "tarot" | "numerology" | "maya" | "other";
export type EntryContext =
  | "daily"
  | "relationship"
  | "work"
  | "self_reflection"
  | "other";
export type DurationBucket = "lt_30s" | "30s_2m" | "gt_2m" | "unknown";
export type Helpfulness = "helpful" | "neutral" | "not_helpful";
export type FeedbackReasonCategory =
  | "clear"
  | "reassuring"
  | "actionable"
  | "inaccurate"
  | "too_generic"
  | "unsafe_feeling"
  | "other"
  | "none";

export type ReadingStartedEvent = TelemetryEvent<
  "reading_started",
  {
    reading_flow_id: string;
    reading_type: ReadingType;
    entry_context: EntryContext;
  }
>;

export type ReadingCompletedEvent = TelemetryEvent<
  "reading_completed",
  {
    reading_flow_id: string;
    reading_type: ReadingType;
    duration_bucket: DurationBucket;
  }
>;

export type ReadingFeedbackSubmittedEvent = TelemetryEvent<
  "reading_feedback_submitted",
  {
    reading_flow_id: string;
    helpfulness: Helpfulness;
    feedback_reason_category: FeedbackReasonCategory;
  }
>;

export type ProductTelemetryEvent =
  | ReadingStartedEvent
  | ReadingCompletedEvent
  | ReadingFeedbackSubmittedEvent;

type TelemetryEvent<Name extends string, Properties> = {
  event_name: Name;
  event_version: 1;
  occurred_at: string;
  anonymous_session_id: string;
  anonymous_visitor_id: null;
  properties: Properties;
};

export type TelemetryValidationResult =
  | { ok: true; event: ProductTelemetryEvent }
  | { ok: false; errors: string[] };

const SESSION_ID_PATTERN =
  /^session_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const READING_FLOW_ID_PATTERN =
  /^reading-flow_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const readingTypes = new Set<ReadingType>([
  "tarot",
  "numerology",
  "maya",
  "other",
]);
const entryContexts = new Set<EntryContext>([
  "daily",
  "relationship",
  "work",
  "self_reflection",
  "other",
]);
const durationBuckets = new Set<DurationBucket>([
  "lt_30s",
  "30s_2m",
  "gt_2m",
  "unknown",
]);
const helpfulnessValues = new Set<Helpfulness>([
  "helpful",
  "neutral",
  "not_helpful",
]);
const feedbackReasons = new Set<FeedbackReasonCategory>([
  "clear",
  "reassuring",
  "actionable",
  "inaccurate",
  "too_generic",
  "unsafe_feeling",
  "other",
  "none",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactlyKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const allowed = [...allowedKeys].sort();
  return actual.length === allowed.length && actual.every((key, i) => key === allowed[i]);
}

function isCanonicalIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString() === value;
}

function isSessionId(value: unknown): value is string {
  return typeof value === "string" && SESSION_ID_PATTERN.test(value);
}

function isReadingFlowId(value: unknown): value is string {
  return typeof value === "string" && READING_FLOW_ID_PATTERN.test(value);
}

function validateCommonEnvelope(
  input: Record<string, unknown>,
  errors: string[],
): input is Record<string, unknown> & {
  event_name: string;
  event_version: 1;
  occurred_at: string;
  anonymous_session_id: string;
  anonymous_visitor_id: null;
  properties: Record<string, unknown>;
} {
  if (
    !hasExactlyKeys(input, [
      "event_name",
      "event_version",
      "occurred_at",
      "anonymous_session_id",
      "anonymous_visitor_id",
      "properties",
    ])
  ) {
    errors.push("event envelope contains missing or unknown fields");
  }
  if (input.event_version !== 1) errors.push("event_version must be 1");
  if (!isCanonicalIsoDate(input.occurred_at)) {
    errors.push("occurred_at must be canonical ISO-8601 from Date.toISOString()");
  }
  if (!isSessionId(input.anonymous_session_id)) {
    errors.push("anonymous_session_id must be a random session UUID");
  }
  if (input.anonymous_visitor_id !== null) {
    errors.push("anonymous_visitor_id must remain null in session-only telemetry");
  }
  if (!isRecord(input.properties)) errors.push("properties must be an object");
  return errors.length === 0;
}

function validateReadingStarted(
  properties: Record<string, unknown>,
  errors: string[],
): boolean {
  if (!hasExactlyKeys(properties, ["reading_flow_id", "reading_type", "entry_context"])) {
    errors.push("reading_started properties contain missing or unknown fields");
  }
  if (!isReadingFlowId(properties.reading_flow_id)) errors.push("reading_flow_id is invalid");
  if (!readingTypes.has(properties.reading_type as ReadingType)) errors.push("reading_type is invalid");
  if (!entryContexts.has(properties.entry_context as EntryContext)) errors.push("entry_context is invalid");
  return errors.length === 0;
}

function validateReadingCompleted(
  properties: Record<string, unknown>,
  errors: string[],
): boolean {
  if (!hasExactlyKeys(properties, ["reading_flow_id", "reading_type", "duration_bucket"])) {
    errors.push("reading_completed properties contain missing or unknown fields");
  }
  if (!isReadingFlowId(properties.reading_flow_id)) errors.push("reading_flow_id is invalid");
  if (!readingTypes.has(properties.reading_type as ReadingType)) errors.push("reading_type is invalid");
  if (!durationBuckets.has(properties.duration_bucket as DurationBucket)) {
    errors.push("duration_bucket is invalid");
  }
  return errors.length === 0;
}

function validateReadingFeedback(
  properties: Record<string, unknown>,
  errors: string[],
): boolean {
  if (
    !hasExactlyKeys(properties, [
      "reading_flow_id",
      "helpfulness",
      "feedback_reason_category",
    ])
  ) {
    errors.push("reading_feedback_submitted properties contain missing or unknown fields");
  }
  if (!isReadingFlowId(properties.reading_flow_id)) errors.push("reading_flow_id is invalid");
  if (!helpfulnessValues.has(properties.helpfulness as Helpfulness)) {
    errors.push("helpfulness is invalid");
  }
  if (!feedbackReasons.has(properties.feedback_reason_category as FeedbackReasonCategory)) {
    errors.push("feedback_reason_category is invalid");
  }
  return errors.length === 0;
}

export function validateTelemetryEvent(input: unknown): TelemetryValidationResult {
  if (!isRecord(input)) return { ok: false, errors: ["event must be an object"] };

  const errors: string[] = [];
  if (!validateCommonEnvelope(input, errors)) return { ok: false, errors };

  const properties = input.properties;
  switch (input.event_name) {
    case "reading_started":
      validateReadingStarted(properties, errors);
      break;
    case "reading_completed":
      validateReadingCompleted(properties, errors);
      break;
    case "reading_feedback_submitted":
      validateReadingFeedback(properties, errors);
      break;
    default:
      errors.push("event_name is not supported by the pilot telemetry foundation");
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, event: input as ProductTelemetryEvent };
}
