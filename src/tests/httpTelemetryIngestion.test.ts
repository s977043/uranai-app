import { describe, expect, it } from "vitest";

import { InMemoryTelemetryEvidenceRepository } from "@/adapters/telemetry/evidenceRepository";
import {
  handleTelemetryPost,
  readBoundedBody,
} from "@/adapters/telemetry/httpIngestion";
import { MAX_TELEMETRY_REQUEST_BYTES } from "@/adapters/telemetry/serverIngestion";

const validEvent = {
  event_name: "reading_started",
  event_version: 1,
  occurred_at: "2026-09-23T00:00:00.000Z",
  anonymous_session_id:
    "session_550e8400-e29b-41d4-a716-446655440000",
  anonymous_visitor_id: null,
  properties: {
    reading_flow_id:
      "reading-flow_550e8400-e29b-41d4-a716-446655440001",
    reading_type: "reflection",
    entry_context: "self_reflection",
  },
};

describe("telemetry HTTP ingestion", () => {
  it("does not read or create a repository while disabled", async () => {
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        body: "{not-json",
      }),
      {
        enabled: false,
        repositoryFactory: () => {
          factoryCalls += 1;
          throw new Error("must not be called");
        },
      },
    );

    expect(response.status).toBe(204);
    expect(factoryCalls).toBe(0);
  });

  it("requires application/json before reading the body", async () => {
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(validEvent),
      }),
      {
        enabled: true,
        repositoryFactory: () => {
          factoryCalls += 1;
          return new InMemoryTelemetryEvidenceRepository();
        },
      },
    );

    expect(response.status).toBe(415);
    expect(factoryCalls).toBe(0);
  });

  it("accepts one valid event and persists only after validation", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      jsonRequest(JSON.stringify(validEvent)),
      {
        enabled: true,
        repositoryFactory: () => {
          factoryCalls += 1;
          return repository;
        },
      },
    );

    expect(response.status).toBe(202);
    expect(factoryCalls).toBe(1);
    expect(repository.snapshot()).toHaveLength(1);
    expect(repository.snapshot()[0]?.event).toEqual(validEvent);
  });

  it("rejects invalid JSON without acquiring the repository", async () => {
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      jsonRequest("{not-json"),
      {
        enabled: true,
        repositoryFactory: () => {
          factoryCalls += 1;
          return new InMemoryTelemetryEvidenceRepository();
        },
      },
    );

    expect(response.status).toBe(400);
    expect(factoryCalls).toBe(0);
  });

  it("rejects arrays because the endpoint accepts exactly one event", async () => {
    let factoryCalls = 0;
    const response = await handleTelemetryPost(
      jsonRequest(JSON.stringify([validEvent])),
      {
        enabled: true,
        repositoryFactory: () => {
          factoryCalls += 1;
          return new InMemoryTelemetryEvidenceRepository();
        },
      },
    );

    expect(response.status).toBe(400);
    expect(factoryCalls).toBe(0);
  });

  it("rejects a declared oversized body without acquiring the repository", async () => {
    let factoryCalls = 0;
    const request = new Request("http://localhost/api/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(MAX_TELEMETRY_REQUEST_BYTES + 1),
      },
      body: "{}",
    });

    const response = await handleTelemetryPost(request, {
      enabled: true,
      repositoryFactory: () => {
        factoryCalls += 1;
        return new InMemoryTelemetryEvidenceRepository();
      },
    });

    expect(response.status).toBe(413);
    expect(factoryCalls).toBe(0);
  });

  it("stops a streamed body after the byte limit", async () => {
    const request = jsonRequest("x".repeat(MAX_TELEMETRY_REQUEST_BYTES + 1));
    const result = await readBoundedBody(
      request,
      MAX_TELEMETRY_REQUEST_BYTES,
    );

    expect(result).toEqual({ ok: false, reason: "body_too_large" });
  });

  it("counts UTF-8 bytes rather than JavaScript characters", async () => {
    const maxBytes = 4;
    const request = jsonRequest("ああ");
    const result = await readBoundedBody(request, maxBytes);

    expect(result).toEqual({ ok: false, reason: "body_too_large" });
  });

  it("contains repository failures behind a generic 503", async () => {
    const response = await handleTelemetryPost(
      jsonRequest(JSON.stringify(validEvent)),
      {
        enabled: true,
        repositoryFactory: () => ({
          async insert() {
            throw new Error("postgresql://secret@db/private");
          },
        }),
      },
    );

    expect(response.status).toBe(503);
    const body = await response.text();
    expect(body).not.toContain("secret");
    expect(body).not.toContain("postgresql");
  });
});

function jsonRequest(body: string): Request {
  return new Request("http://localhost/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });
}
