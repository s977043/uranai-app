export type MetricObservabilityStatus =
  | "uninstrumented"
  | "partial"
  | "observable";

export type MetricObservabilityInput = {
  required_events: readonly string[];
  instrumented_events: readonly string[];
  product_surface_connected: boolean;
  evidence_source_operational: boolean;
  schema_validation_green: boolean;
};

export type MetricObservabilityAssessment = {
  status: MetricObservabilityStatus;
  blockers: string[];
};

export function assessMetricObservability(
  input: MetricObservabilityInput,
): MetricObservabilityAssessment {
  const instrumented = new Set(input.instrumented_events);
  const missingEvents = input.required_events.filter(
    (eventName) => !instrumented.has(eventName),
  );
  const blockers: string[] = [];

  if (!input.product_surface_connected) {
    blockers.push("product_surface_not_connected");
  }
  for (const eventName of missingEvents) {
    blockers.push(`missing_event:${eventName}`);
  }
  if (!input.evidence_source_operational) {
    blockers.push("evidence_source_not_operational");
  }
  if (!input.schema_validation_green) {
    blockers.push("schema_validation_not_green");
  }

  if (blockers.length === 0) {
    return { status: "observable", blockers: [] };
  }

  const hasAnyInstrumentation = input.instrumented_events.some((eventName) =>
    input.required_events.includes(eventName),
  );

  return {
    status: hasAnyInstrumentation ? "partial" : "uninstrumented",
    blockers,
  };
}
