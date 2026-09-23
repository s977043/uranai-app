import type { TelemetryEvidenceRepository } from "@/adapters/telemetry/evidenceRepository";
import {
  ingestTelemetryBody,
  MAX_TELEMETRY_REQUEST_BYTES,
} from "@/adapters/telemetry/serverIngestion";

type HandlerOptions = {
  readonly enabled: boolean;
  readonly repositoryFactory: () => TelemetryEvidenceRepository;
};

type BodyReadResult =
  | { readonly ok: true; readonly body: string }
  | { readonly ok: false; readonly reason: "body_too_large" | "invalid_utf8" };

export async function handleTelemetryPost(
  request: Request,
  options: HandlerOptions,
): Promise<Response> {
  if (!options.enabled) return new Response(null, { status: 204 });

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return jsonResponse(415, "unsupported_media_type");
  }

  const body = await readBoundedBody(request, MAX_TELEMETRY_REQUEST_BYTES);
  if (!body.ok) {
    return jsonResponse(
      body.reason === "body_too_large" ? 413 : 400,
      body.reason,
    );
  }

  const lazyRepository: TelemetryEvidenceRepository = {
    insert: async (record) => {
      const repository = options.repositoryFactory();
      await repository.insert(record);
    },
  };

  const result = await ingestTelemetryBody(body.body, {
    enabled: true,
    repository: lazyRepository,
  });

  switch (result.status) {
    case "accepted":
      return jsonResponse(202, "accepted");
    case "disabled":
      return new Response(null, { status: 204 });
    case "rejected":
      return jsonResponse(
        result.reason === "body_too_large" ? 413 : 400,
        result.reason,
      );
    case "unavailable":
      return jsonResponse(503, "temporarily_unavailable");
  }
}

export async function readBoundedBody(
  request: Request,
  maxBytes: number,
): Promise<BodyReadResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declared = Number(contentLength);
    if (Number.isFinite(declared) && declared > maxBytes) {
      return { ok: false, reason: "body_too_large" };
    }
  }

  if (request.body === null) return { ok: true, body: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: "body_too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: "invalid_utf8" };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      body: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    };
  } catch {
    return { ok: false, reason: "invalid_utf8" };
  }
}

function isJsonContentType(value: string | null): boolean {
  if (value === null) return false;
  return value.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

function jsonResponse(status: number, statusText: string): Response {
  return Response.json(
    { status: statusText },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
