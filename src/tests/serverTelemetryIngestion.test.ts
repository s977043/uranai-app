import { describe, expect, it } from "vitest";

import {
  InMemoryTelemetryEvidenceRepository,
  type TelemetryEvidenceRecord,
  type TelemetryEvidenceRepository,
} from "@/adapters/telemetry/evidenceRepository";
import {
  ingestTelemetryBody,
  MAX_TELEMETRY_REQUEST_BYTES,
  telemetryIngestionEnabledFromEnv,
} from "@/adapters/telemetry/serverIngestion";
import type { ProductTelemetryEvent } from "@/domain/telemetry/events";

const VALID_EVENT: ProductTelemetryEvent = {
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

const INGESTED_AT = "2026-09-15T00:01:00.000Z";

describe("telemetryIngestionEnabledFromEnv", () => {
  it.each([
    [undefined, false],
    ["", false],
    ["false", false],
    ["TRUE", false],
    ["1", false],
    ["true", true],
  ])("%s -> %s", (value, expected) => {
    expect(telemetryIngestionEnabledFromEnv(value)).toBe(expected);
  });
});

describe("ingestTelemetryBody", () => {
  it("disabled時はbodyを解釈せず永続化しない", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();

    const result = await ingestTelemetryBody("not-json", {
      enabled: false,
      repository,
    });

    expect(result).toEqual({ status: "disabled" });
    expect(repository.snapshot()).toEqual([]);
  });

  it("valid eventをserver-generated ingested_at付きでRepositoryへ渡す", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();

    const result = await ingestTelemetryBody(JSON.stringify(VALID_EVENT), {
      enabled: true,
      repository,
      now: () => new Date(INGESTED_AT),
    });

    expect(result).toEqual({ status: "accepted", ingested_at: INGESTED_AT });
    expect(repository.snapshot()).toEqual([
      { event: VALID_EVENT, ingested_at: INGESTED_AT },
    ]);
  });

  it("Evidence recordへrequest metadata用fieldを追加しない", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();

    await ingestTelemetryBody(JSON.stringify(VALID_EVENT), {
      enabled: true,
      repository,
      now: () => new Date(INGESTED_AT),
    });

    const [record] = repository.snapshot();
    expect(Object.keys(record ?? {}).sort()).toEqual(["event", "ingested_at"]);
    expect(Object.keys(record?.event ?? {}).sort()).toEqual([
      "anonymous_session_id",
      "anonymous_visitor_id",
      "event_name",
      "event_version",
      "occurred_at",
      "properties",
    ]);
  });

  it("invalid JSONをrejectし、raw bodyを結果へ返さない", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();
    const secretLikeBody = '{"consultation":"private text"';

    const result = await ingestTelemetryBody(secretLikeBody, {
      enabled: true,
      repository,
    });

    expect(result).toEqual({ status: "rejected", reason: "invalid_json" });
    expect(JSON.stringify(result)).not.toContain("private text");
    expect(repository.snapshot()).toEqual([]);
  });

  it("schema外fieldを含むeventをrejectする", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();
    const invalid = { ...VALID_EVENT, consultation: "do not persist" };

    const result = await ingestTelemetryBody(JSON.stringify(invalid), {
      enabled: true,
      repository,
    });

    expect(result).toEqual({ status: "rejected", reason: "invalid_event" });
    expect(repository.snapshot()).toEqual([]);
  });

  it("複数eventのarrayを1 requestで受け付けない", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();

    const result = await ingestTelemetryBody(
      JSON.stringify([VALID_EVENT, VALID_EVENT]),
      { enabled: true, repository },
    );

    expect(result).toEqual({ status: "rejected", reason: "invalid_event" });
    expect(repository.snapshot()).toEqual([]);
  });

  it("16 KiBを超えるbodyをJSON parseより先にrejectする", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();
    const oversized = "x".repeat(MAX_TELEMETRY_REQUEST_BYTES + 1);

    const result = await ingestTelemetryBody(oversized, {
      enabled: true,
      repository,
    });

    expect(result).toEqual({ status: "rejected", reason: "body_too_large" });
    expect(repository.snapshot()).toEqual([]);
  });

  it("body sizeは文字数ではなくUTF-8 byte数で判定する", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();
    const oversizedUnicode = `"${"あ".repeat(6_000)}"`;

    expect(oversizedUnicode.length).toBeLessThan(MAX_TELEMETRY_REQUEST_BYTES);

    const result = await ingestTelemetryBody(oversizedUnicode, {
      enabled: true,
      repository,
    });

    expect(result).toEqual({ status: "rejected", reason: "body_too_large" });
  });

  it("Repository例外を外へ漏らさずunavailableへ変換する", async () => {
    const repository: TelemetryEvidenceRepository = {
      async insert(): Promise<void> {
        throw new Error("postgresql://secret@example.invalid/private");
      },
    };

    const result = await ingestTelemetryBody(JSON.stringify(VALID_EVENT), {
      enabled: true,
      repository,
      now: () => new Date(INGESTED_AT),
    });

    expect(result).toEqual({
      status: "unavailable",
      reason: "repository_write_failed",
    });
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("server clock異常をRepository障害と誤分類しない", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();

    const result = await ingestTelemetryBody(JSON.stringify(VALID_EVENT), {
      enabled: true,
      repository,
      now: () => new Date(Number.NaN),
    });

    expect(result).toEqual({ status: "unavailable", reason: "internal_error" });
    expect(repository.snapshot()).toEqual([]);
  });
});

describe("InMemoryTelemetryEvidenceRepository", () => {
  it("snapshotの変更が内部recordへ逆流しない", async () => {
    const repository = new InMemoryTelemetryEvidenceRepository();
    const record: TelemetryEvidenceRecord = {
      event: VALID_EVENT,
      ingested_at: INGESTED_AT,
    };

    await repository.insert(record);
    const first = repository.snapshot();
    const storedEvent = first[0]?.event;
    if (!storedEvent || storedEvent.event_name !== "reading_started") {
      throw new Error("expected reading_started fixture");
    }
    storedEvent.properties.entry_context = "other";

    expect(repository.snapshot()[0]).toEqual(record);
  });
});
