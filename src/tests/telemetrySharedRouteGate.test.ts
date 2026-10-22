import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/telemetry/route";

describe("telemetry shared-route fail-closed regression", () => {
  const before = {
    enabled: process.env.TELEMETRY_INGESTION_ENABLED,
    approval: process.env.TELEMETRY_SHARED_INGRESS_APPROVED,
    vercelEnv: process.env.VERCEL_ENV,
  };

  afterEach(() => {
    if (before.enabled === undefined) delete process.env.TELEMETRY_INGESTION_ENABLED;
    else process.env.TELEMETRY_INGESTION_ENABLED = before.enabled;

    if (before.approval === undefined) delete process.env.TELEMETRY_SHARED_INGRESS_APPROVED;
    else process.env.TELEMETRY_SHARED_INGRESS_APPROVED = before.approval;

    if (before.vercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = before.vercelEnv;
  });

  it("does not touch DB even if ingress=true when shared approval is absent", async () => {
    process.env.TELEMETRY_INGESTION_ENABLED = "true";
    delete process.env.TELEMETRY_SHARED_INGRESS_APPROVED;
    process.env.VERCEL_ENV = "preview";
    delete process.env.DATABASE_URL;

    const response = await POST(
      new Request("https://test.example/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json",
      }),
    );

    expect(response.status).toBe(204);
  });

  it("fails closed when shared approval has an unexpected value", async () => {
    process.env.TELEMETRY_INGESTION_ENABLED = "true";
    process.env.TELEMETRY_SHARED_INGRESS_APPROVED = "TRUE";
    process.env.VERCEL_ENV = "production";
    const response = await POST(
      new Request("https://test.example/api/telemetry", {
        method: "POST",
        body: "bad event",
      }),
    );
    expect(response.status).toBe(204);
  });
});
