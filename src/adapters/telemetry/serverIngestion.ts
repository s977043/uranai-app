import type { TelemetryEvidenceRepository } from "@/adapters/telemetry/evidenceRepository";
import { validateTelemetryEvent } from "@/domain/telemetry/events";

export const MAX_TELEMETRY_REQUEST_BYTES = 16 * 1024;

export type TelemetryIngestionResult =
  | { readonly status: "disabled" }
  | { readonly status: "accepted"; readonly ingested_at: string }
  | {
      readonly status: "rejected";
      readonly reason: "body_too_large" | "invalid_json" | "invalid_event";
    }
  | {
      readonly status: "unavailable";
      readonly reason: "internal_error" | "repository_write_failed";
    };

type IngestionOptions = {
  readonly enabled: boolean;
  readonly repository: TelemetryEvidenceRepository;
  readonly now?: () => Date;
};

export function telemetryIngestionEnabledFromEnv(
  value: string | undefined,
): boolean {
  return value === "true";
}

export async function ingestTelemetryBody(
  rawBody: string,
  options: IngestionOptions,
): Promise<TelemetryIngestionResult> {
  if (!options.enabled) return { status: "disabled" };

  if (byteLength(rawBody) > MAX_TELEMETRY_REQUEST_BYTES) {
    return { status: "rejected", reason: "body_too_large" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { status: "rejected", reason: "invalid_json" };
  }

  const validation = validateTelemetryEvent(parsed);
  if (!validation.ok) {
    return { status: "rejected", reason: "invalid_event" };
  }

  const now = options.now ?? (() => new Date());
  let ingestedAt: string;
  try {
    ingestedAt = now().toISOString();
  } catch {
    return { status: "unavailable", reason: "internal_error" };
  }

  try {
    await options.repository.insert({
      event: validation.event,
      ingested_at: ingestedAt,
    });
  } catch {
    return { status: "unavailable", reason: "repository_write_failed" };
  }

  return { status: "accepted", ingested_at: ingestedAt };
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}
