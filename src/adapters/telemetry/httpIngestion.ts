import type { TelemetryEvidenceRepository } from "@/adapters/telemetry/evidenceRepository";
import {
  ingestTelemetryBody,
  MAX_TELEMETRY_REQUEST_BYTES,
  telemetryIngestionEnabledFromEnv,
} from "@/adapters/telemetry/serverIngestion";

type TelemetryHttpOptions = {
  readonly enabledEnv: string | undefined;
  readonly repositoryFactory: () => TelemetryEvidenceRepository;
};

export async function handleTelemetryPost(
  request: Request,
  options: TelemetryHttpOptions,
): Promise<Response> {
  const enabled = telemetryIngestionEnabledFromEnv(options.enabledEnv);
  if (!enabled) return noContent();

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return errorResponse(415, "unsupported_media_type");
  }

  let bodyResult: BodyReadResult;
  try {
    bodyResult = await readBoundedUtf8Body(
      request,
      MAX_TELEMETRY_REQUEST_BYTES,
    );
  } catch {
    return errorResponse(400, "invalid_telemetry_event");
  }
  if (bodyResult.status === "too_large") {
    return errorResponse(413, "payload_too_large");
  }
  if (bodyResult.status === "invalid_utf8") {
    return errorResponse(400, "invalid_telemetry_event");
  }

  let repository: TelemetryEvidenceRepository;
  try {
    repository = options.repositoryFactory();
  } catch {
    return errorResponse(503, "telemetry_unavailable");
  }

  const result = await ingestTelemetryBody(bodyResult.body, {
    enabled: true,
    repository,
  });

  switch (result.status) {
    case "accepted":
    case "disabled":
      return noContent();
    case "rejected":
      if (result.reason === "body_too_large") {
        return errorResponse(413, "payload_too_large");
      }
      return errorResponse(400, "invalid_telemetry_event");
    case "unavailable":
      return errorResponse(503, "telemetry_unavailable");
  }
}

type BodyReadResult =
  | { readonly status: "ok"; readonly body: string }
  | { readonly status: "too_large" }
  | { readonly status: "invalid_utf8" };

export async function readBoundedUtf8Body(
  request: Request,
  maxBytes: number,
): Promise<BodyReadResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const parsed = Number(contentLength);
    if (Number.isFinite(parsed) && parsed > maxBytes) {
      return { status: "too_large" };
    }
  }

  const reader = request.body?.getReader();
  if (reader === undefined) return { status: "ok", body: "" };

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value === undefined) continue;

    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // Size rejection is authoritative even if stream cancellation fails.
      }
      return { status: "too_large" };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      status: "ok",
      body: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    };
  } catch {
    return { status: "invalid_utf8" };
  }
}

function isJsonContentType(value: string | null): boolean {
  if (value === null) return false;
  return value.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

function noContent(): Response {
  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}

function errorResponse(status: number, error: string): Response {
  return Response.json(
    { error },
    {
      status,
      headers: { "cache-control": "no-store" },
    },
  );
}
