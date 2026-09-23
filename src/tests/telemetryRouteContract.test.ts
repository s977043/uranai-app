import { describe, expect, it } from "vitest";

import { runtime, POST } from "@/app/api/telemetry/route";

describe("/api/telemetry route contract", () => {
  it("Node.js runtimeを明示する", () => {
    expect(runtime).toBe("nodejs");
  });

  it("ingestion disabledならDATABASE_URL無しでも204でDBを取得しない", async () => {
    const previousEnabled = process.env.TELEMETRY_INGESTION_ENABLED;
    const previousDatabaseUrl = process.env.DATABASE_URL;

    process.env.TELEMETRY_INGESTION_ENABLED = "false";
    delete process.env.DATABASE_URL;

    try {
      const response = await POST(
        new Request("http://localhost/api/telemetry", {
          method: "POST",
          headers: { "content-type": "text/plain" },
          body: "not-json",
        }),
      );
      expect(response.status).toBe(204);
    } finally {
      if (previousEnabled === undefined) {
        delete process.env.TELEMETRY_INGESTION_ENABLED;
      } else {
        process.env.TELEMETRY_INGESTION_ENABLED = previousEnabled;
      }
      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    }
  });
});
