import { handleTelemetryPost } from "@/adapters/telemetry/httpIngestion";
import { getPostgresTelemetryEvidenceRepository } from "@/adapters/telemetry/postgresEvidenceRepository";
import { telemetryIngressEnabled } from "@/adapters/telemetry/ingressControls";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleTelemetryPost(request, {
    enabled: telemetryIngressEnabled({
      enabled: process.env.TELEMETRY_INGESTION_ENABLED,
      sharedApproved: process.env.TELEMETRY_SHARED_INGRESS_APPROVED,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }),
    repositoryFactory: () => getPostgresTelemetryEvidenceRepository(),
  });
}
