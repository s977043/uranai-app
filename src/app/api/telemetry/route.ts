import { handleTelemetryPost } from "@/adapters/telemetry/httpIngestion";
import { getPostgresTelemetryEvidenceRepository } from "@/adapters/telemetry/postgresEvidenceRepository";
import { telemetryIngestionEnabledFromEnv } from "@/adapters/telemetry/serverIngestion";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleTelemetryPost(request, {
    enabled: telemetryIngestionEnabledFromEnv(
      process.env.TELEMETRY_INGESTION_ENABLED,
    ),
    repositoryFactory: () => getPostgresTelemetryEvidenceRepository(),
  });
}
