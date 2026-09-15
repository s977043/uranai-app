import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.join(here, "..", "contracts", "operational-evidence-source.json");
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(contract.version === 1, "operational evidence: version must be 1");
assert(contract.status === "accepted_for_implementation", "operational evidence: decision must be accepted for implementation");

assert(contract.runtime?.provider === "vercel", "operational evidence: runtime provider must be vercel");
assert(contract.runtime?.required_plan === "pro_or_higher", "operational evidence: production runtime must require Pro or higher");

assert(contract.storage?.protocol === "postgresql", "operational evidence: storage protocol must remain postgresql");
assert(contract.storage?.connection_env === "DATABASE_URL", "operational evidence: DATABASE_URL must be the storage contract");
assert(Array.isArray(contract.storage?.allowed_providers) && contract.storage.allowed_providers.includes("neon") && contract.storage.allowed_providers.includes("supabase"), "operational evidence: Neon and Supabase must remain supported provider candidates");
assert(contract.storage?.browser_direct_write === false, "operational evidence: browser direct DB writes are prohibited");

assert(contract.ingestion?.server_route === "/api/telemetry", "operational evidence: telemetry server route contract mismatch");
assert(contract.ingestion?.server_validation === "validateTelemetryEvent", "operational evidence: server validation must reuse validateTelemetryEvent");
assert(contract.ingestion?.disable_env === "TELEMETRY_INGESTION_ENABLED", "operational evidence: disable switch contract mismatch");
assert(contract.ingestion?.product_failure_mode === "fail_open", "operational evidence: telemetry failure must not block product value flow");

assert(contract.privacy?.identity_scope === "session_only", "operational evidence: first pilot must remain session-only");
assert(contract.privacy?.anonymous_visitor_id_required === null, "operational evidence: cross-session visitor identity is prohibited");
assert(contract.privacy?.raw_retention_days === 30, "operational evidence: raw retention must be 30 days for the first pilot");
assert(contract.privacy?.persist_request_ip === false, "operational evidence: request IP must not be persisted in product evidence");
assert(contract.privacy?.persist_user_agent === false, "operational evidence: user agent must not be persisted in product evidence");
assert(contract.privacy?.persist_raw_consultation === false, "operational evidence: raw consultation must not be persisted");
assert(contract.privacy?.persist_raw_prompt_or_response === false, "operational evidence: raw prompt/response must not be persisted");

assert(contract.environments?.preview_production_credentials_separate === true, "operational evidence: preview and production credentials must be separate");
assert(contract.environments?.preview_may_write_production === false, "operational evidence: preview must not write production evidence");

const requirements = contract.operational_gate?.requirements;
assert(requirements && typeof requirements === "object", "operational evidence: operational requirements are required");

const requiredKeys = [
  "runtime_provisioned",
  "production_eligible_plan_verified",
  "storage_provider_selected",
  "storage_provisioned",
  "environment_separation_verified",
  "server_ingestion_operational",
  "evidence_query_export_reproducible",
  "retention_deletion_verified",
  "privacy_review_complete",
  "data_quality_review_complete",
];

for (const key of requiredKeys) {
  assert(typeof requirements[key] === "boolean", `operational evidence: ${key} must be boolean`);
}

const derivedOperational = requiredKeys.every((key) => requirements[key] === true);
const expectedStatus = derivedOperational ? "operational" : "blocked";
assert(contract.operational_gate.status === expectedStatus, `operational evidence: gate status must derive to ${expectedStatus}`);

if (derivedOperational) {
  assert(contract.runtime.provisioned === true, "operational evidence: operational gate requires provisioned runtime");
  assert(typeof contract.runtime.shared_surface_ref === "string" && contract.runtime.shared_surface_ref.length > 0, "operational evidence: operational gate requires shared surface ref");
  assert(contract.storage.provisioned === true, "operational evidence: operational gate requires provisioned storage");
  assert(contract.storage.allowed_providers.includes(contract.storage.provider), "operational evidence: selected storage provider must be allowed");
  assert(typeof contract.storage.evidence_source_ref === "string" && contract.storage.evidence_source_ref.length > 0, "operational evidence: operational gate requires evidence source ref");
  assert(contract.ingestion.operational === true, "operational evidence: operational gate requires ingestion operational");
} else {
  assert(contract.operational_gate.status === "blocked", "operational evidence: incomplete requirements must remain blocked");
  assert(Array.isArray(contract.operational_gate.blocking_issues) && contract.operational_gate.blocking_issues.length > 0, "operational evidence: blocked state requires blocking issues");
}

console.log(`✓ operational evidence decision contract: status=${contract.operational_gate.status}, provider=${contract.storage.provider ?? "unselected"}`);
