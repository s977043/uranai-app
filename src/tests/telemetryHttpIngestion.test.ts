import { describe, expect, it } from "vitest";

import { InMemoryTelemetryEvidenceRepository } from "@/adapters/telemetry/evidenceRepository";
import {
  handleTelemetryPost,
  readBoundedUtf8Body,
} from "@/adapters/telemetry/httpIngestion";
import { MAX_TELEMETRY_REQUEST_BYTES } from "@/adapters/telemetry/serverIngestion";
import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

const EVENT: ProductTelemetryEvent = {
  event_name: "reading_started",
  event_version: 1,
  occurred_at: "2026-09-15T00:00:00.000Z",
  anonymous_session_id: "session_550e8400-e29b-41d4-a716-446655440000",
  anonymous_visitor_id: null,
  properties: {
    reading_flow_id: "reading-flow_650e8400-e29b-41d4-b716-446655440000",
    reading_type: "reflection",
    entry_context: "self_reflection",
  },
};

function jsonRequest(body: string): Request {
  return new Request("http://localhost/api/telemetry", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body,
  });
}

describe("handleTelemetryPost", () => {
  it("disabled時はbodyもRepository factoryも評価しない", async () => {
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "not-json",
      }),
      {
        enabledEnv: "false",
        repositoryFactory: () => {
          factoryCalls += 1;
          throw new Error("must not acquire database");
        },
      },
    );

    expect(response.status).toBe(204);
    expect(factoryCalls).toBe(0);
  });

  it("application/json以外をRepository取得前にrejectする", async () => {
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "{}",
      }),
      {
        enabledEnv: "true",
        repositoryFactory: () => {
          factoryCalls += 1;
          return new InMemoryTelemetryEvidenceRepository();
        },
      },
    );

    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ error: "unsupported_media_type" });
    expect(factoryCalls).toBe(0);
  });

  it("valid eventは204を返して永続化する", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();
    const response = await handleTelemetryPost(jsonRequest(JSON.stringify(EVENT)), {
      enabledEnv: "true",
      repositoryFactory: () => repository,
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(repository.snapshot()).toHaveLength(1);
  });

  it("invalid JSONは400でraw bodyを返さない", async () => {
    const response = await handleTelemetryPost(
      jsonRequest('{"consultation":"secret"'),
      {
        enabledEnv: "true",
        repositoryFactory: () => new InMemoryTelemetryEvidenceRepository(),
      },
    );

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("invalid_telemetry_event");
    expect(text).not.toContain("secret");
  });

  it("16 KiB超過はRepository取得前に413にする", async () => {
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      jsonRequest("x".repeat(MAX_TELEMETRY_REQUEST_BYTES + 1)),
      {
        enabledEnv: "true",
        repositoryFactory: () => {
          factoryCalls += 1;
          return new InMemoryTelemetryEvidenceRepository();
        },
      },
    );

    expect(response.status).toBe(413);
    expect(factoryCalls).toBe(0);
  });

  it("Repository factory failureを503へsanitizeする", async () => {
    const response = await handleTelemetryPost(jsonRequest(JSON.stringify(EVENT)), {
      enabledEnv: "true",
      repositoryFactory: () => {
        throw new Error("postgresql://secret@example.invalid/private");
      },
    });

    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).toContain("telemetry_unavailable");
    expect(text).not.toContain("secret");
  });

  it("Repository write failureを503へsanitizeする", async () => {
    const response = await handleTelemetryPost(jsonRequest(JSON.stringify(EVENT)), {
      enabledEnv: "true",
      repositoryFactory: () => ({
        async insert() {
          throw new Error("sensitive database failure");
        },
      }),
    });

    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).toContain("telemetry_unavailable");
    expect(text).not.toContain("sensitive");
  });
});

describe("readBoundedUtf8Body", () => {
  it("content-lengthが上限超過ならbodyを読む前にrejectする", async () => {
    const request = new Request("http://localhost/api/telemetry", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(MAX_TELEMETRY_REQUEST_BYTES + 1),
      },
      body: "{}",
    });

    await expect(
      readBoundedUtf8Body(request, MAX_TELEMETRY_REQUEST_BYTES),
    ).resolves.toEqual({ status: "too_large" });
  });

  it("content-lengthが無くてもstream実測byte数で上限を守る", async () => {
    const request = jsonRequest("あ".repeat(6_000));
    await expect(
      readBoundedUtf8Body(request, MAX_TELEMETRY_REQUEST_BYTES),
    ).resolves.toEqual({ status: "too_large" });
  });
});
