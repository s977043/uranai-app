import { describe, expect, it } from "vitest";

import operationalEvidence from "../../ai/contracts/operational-evidence-source.json";
import { MAX_TELEMETRY_REQUEST_BYTES } from "@/adapters/telemetry/serverIngestion";

describe("Operational Evidence Decision / server ingestion alignment", () => {
  it("request byte limitはmachine contractと一致する", () => {
    expect(MAX_TELEMETRY_REQUEST_BYTES).toBe(
      operationalEvidence.ingestion.request_body_max_bytes,
    );
  });

  it("Phase B coreは1 event/requestかつまだoperationalではない", () => {
    expect(operationalEvidence.ingestion.max_events_per_request).toBe(1);
    expect(operationalEvidence.ingestion.server_core_implemented).toBe(true);
    expect(operationalEvidence.ingestion.operational).toBe(false);
    expect(operationalEvidence.operational_gate.status).toBe("blocked");
  });
});
