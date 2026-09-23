import { handleTelemetryPost } from "@/adapters/telemetry/httpIngestion";
import { PostgresTelemetryEvidenceRepository } from "@/adapters/telemetry/postgresEvidenceRepository";
import { getTelemetryPool } from "@/adapters/telemetry/postgresPool";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleTelemetryPost(request, {
    enabledEnv: process.env.TELEMETRY_INGESTION_ENABLED,
    abuseControlVerifiedEnv: process.env.TELEMETRY_ABUSE_CONTROL_VERIFIED,
    deploymentEnv: process.env.VERCEL_ENV,
    repositoryFactory: () =>
      new PostgresTelemetryEvidenceRepository(getTelemetryPool()),
  });
}
