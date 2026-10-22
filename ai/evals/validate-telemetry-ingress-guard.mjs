import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const contract = JSON.parse(read("ai/contracts/operational-evidence-source.json"));
const metrics = JSON.parse(read("ai/contracts/metric-registry.json"));
const controls = read("src/adapters/telemetry/ingressControls.ts");
const handler = read("src/adapters/telemetry/httpIngestion.ts");
const route = read("src/app/api/telemetry/route.ts");
const env = read(".env.example");

function assert(ok, message) {
  if (!ok) throw new Error("Telemetry ingress gate: " + message);
}

assert(contract.ingestion.instance_local_budget_implemented === true, "missing budget fact");
assert(contract.ingestion.instance_local_budget_ref === "src/adapters/telemetry/ingressControls.ts", "missing budget ref");
assert(contract.ingestion.instance_request_limit_per_minute === 60, "request budget drift");
assert(contract.ingestion.shared_activation_guard_implemented === true, "missing shared guard fact");
assert(contract.ingestion.shared_activation_env === "TELEMETRY_SHARED_INGRESS_APPROVED", "activation env drift");
assert(contract.ingestion.shared_activation_guard_ref === "src/adapters/telemetry/ingressControls.ts", "shared guard ref drift");
assert(contract.ingestion.abuse_control_verified === false, "local budget is not globally verified abuse-control evidence");
assert(contract.ingestion.production_edge_abuse_control_verified === false, "edge protection must remain unverified");
assert(contract.ingestion.operational === false, "telemetry must remain non-operational");
assert(contract.operational_gate.status === "blocked", "operational gate must remain blocked");
assert(controls.includes("TELEMETRY_INSTANCE_REQUESTS_PER_MINUTE = 60"), "code rate limit drift");
assert(controls.includes('input.nodeEnv === "production"'), "production gating required");
assert(handler.includes("instanceRateLimiter") && handler.includes("status: 429"), "bounded HTTP budget required");
assert(route.includes("TELEMETRY_SHARED_INGRESS_APPROVED") && route.includes("VERCEL_ENV"), "route must bind platform activation guard");
assert(env.includes("TELEMETRY_INGESTION_ENABLED=false"), "ingestion must default disabled");
assert(env.includes("TELEMETRY_SHARED_INGRESS_APPROVED=false"), "shared ingress must default blocked");

for (const name of ["metric:reading_flow_completion", "metric:helpful_feedback_rate"]) {
  const metric = metrics.metrics.find((m) => m.ref === name);
  assert(metric?.observability_status === "partial", name + " must remain partial");
}

console.log("✓ Telemetry ingress activation and local budget contract; operational gate remains blocked");
