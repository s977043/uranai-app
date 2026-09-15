import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const contractPath = path.join(
  here,
  "..",
  "contracts",
  "operational-evidence-source.json",
);
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function verified(flag, ref) {
  return flag === true && nonEmptyString(ref);
}

assert(contract.version === 1, "operational evidence: version must be 1");
assert(
  contract.status === "accepted_for_implementation",
  "operational evidence: decision must be accepted for implementation",
);

assert(
  contract.runtime?.provider === "vercel",
  "operational evidence: runtime provider must be vercel",
);
assert(
  contract.runtime?.required_plan === "pro_or_higher",
  "operational evidence: production runtime must require Pro or higher",
);

assert(
  contract.storage?.protocol === "postgresql",
  "operational evidence: storage protocol must remain postgresql",
);
assert(
  contract.storage?.connection_env === "DATABASE_URL",
  "operational evidence: DATABASE_URL must be the storage contract",
);
assert(
  Array.isArray(contract.storage?.allowed_providers) &&
    contract.storage.allowed_providers.includes("neon") &&
    contract.storage.allowed_providers.includes("supabase"),
  "operational evidence: Neon and Supabase must remain supported provider candidates",
);
assert(
  contract.storage?.browser_direct_write === false,
  "operational evidence: browser direct DB writes are prohibited",
);

assert(
  contract.ingestion?.server_route === "/api/telemetry",
  "operational evidence: telemetry server route contract mismatch",
);
assert(
  contract.ingestion?.server_validation === "validateTelemetryEvent",
  "operational evidence: server validation must reuse validateTelemetryEvent",
);
assert(
  contract.ingestion?.disable_env === "TELEMETRY_INGESTION_ENABLED",
  "operational evidence: disable switch contract mismatch",
);
assert(
  contract.ingestion?.product_failure_mode === "fail_open",
  "operational evidence: telemetry failure must not block product value flow",
);
assert(
  Number.isInteger(contract.ingestion?.request_body_max_bytes) &&
    contract.ingestion.request_body_max_bytes > 0 &&
    contract.ingestion.request_body_max_bytes <= 16384,
  "operational evidence: public telemetry request body must be capped at 16 KiB or less",
);
assert(
  contract.ingestion?.abuse_control_required === true,
  "operational evidence: public telemetry endpoint requires abuse/cost control",
);
assert(
  contract.ingestion?.durable_client_identity_for_abuse_control === false,
  "operational evidence: abuse control must not add durable client identity",
);

assert(
  contract.privacy?.identity_scope === "session_only",
  "operational evidence: first pilot must remain session-only",
);
assert(
  contract.privacy?.anonymous_visitor_id_required === null,
  "operational evidence: cross-session visitor identity is prohibited",
);
assert(
  contract.privacy?.raw_retention_days === 30,
  "operational evidence: raw retention must be 30 days for the first pilot",
);
assert(
  contract.privacy?.retention_basis === "ingested_at",
  "operational evidence: retention must use server-generated ingested_at",
);
assert(
  contract.privacy?.persist_request_ip === false,
  "operational evidence: request IP must not be persisted in product evidence",
);
assert(
  contract.privacy?.persist_user_agent === false,
  "operational evidence: user agent must not be persisted in product evidence",
);
assert(
  contract.privacy?.persist_raw_consultation === false,
  "operational evidence: raw consultation must not be persisted",
);
assert(
  contract.privacy?.persist_raw_prompt_or_response === false,
  "operational evidence: raw prompt/response must not be persisted",
);

assert(
  contract.environments?.preview_production_credentials_separate === true,
  "operational evidence: preview and production credentials must be separate by policy",
);
assert(
  contract.environments?.preview_may_write_production === false,
  "operational evidence: preview must not write production evidence",
);

if (contract.runtime.provisioned) {
  assert(
    nonEmptyString(contract.runtime.shared_surface_ref),
    "operational evidence: provisioned runtime requires shared_surface_ref",
  );
}
if (contract.runtime.production_eligible_plan_verified) {
  assert(
    nonEmptyString(contract.runtime.plan_verification_ref),
    "operational evidence: verified production plan requires plan_verification_ref",
  );
}
if (contract.storage.provider !== null) {
  assert(
    contract.storage.allowed_providers.includes(contract.storage.provider),
    "operational evidence: selected storage provider must be allowed",
  );
}
if (contract.storage.provisioned) {
  assert(
    contract.storage.provider !== null,
    "operational evidence: provisioned storage requires selected provider",
  );
  assert(
    nonEmptyString(contract.storage.provisioning_ref),
    "operational evidence: provisioned storage requires provisioning_ref",
  );
  assert(
    nonEmptyString(contract.storage.evidence_source_ref),
    "operational evidence: provisioned storage requires evidence_source_ref",
  );
}
if (contract.ingestion.operational) {
  assert(
    nonEmptyString(contract.ingestion.verification_ref),
    "operational evidence: operational ingestion requires verification_ref",
  );
}
if (contract.environments.separation_verified) {
  assert(
    nonEmptyString(contract.environments.verification_ref),
    "operational evidence: verified environment separation requires verification_ref",
  );
}
if (contract.evidence.query_export_reproducible) {
  assert(
    nonEmptyString(contract.evidence.query_export_ref),
    "operational evidence: reproducible query/export requires query_export_ref",
  );
}
if (contract.evidence.data_quality_review_complete) {
  assert(
    nonEmptyString(contract.evidence.data_quality_ref),
    "operational evidence: Data Quality review requires data_quality_ref",
  );
}
if (contract.privacy.retention_deletion_verified) {
  assert(
    nonEmptyString(contract.privacy.retention_deletion_ref),
    "operational evidence: retention/deletion verification requires evidence ref",
  );
}
if (contract.privacy.review_complete) {
  assert(
    nonEmptyString(contract.privacy.review_ref),
    "operational evidence: Privacy review requires review_ref",
  );
}

const facts = {
  runtime_provisioned:
    contract.runtime.provisioned === true &&
    nonEmptyString(contract.runtime.shared_surface_ref),
  production_eligible_plan_verified: verified(
    contract.runtime.production_eligible_plan_verified,
    contract.runtime.plan_verification_ref,
  ),
  storage_provider_selected:
    contract.storage.provider !== null &&
    contract.storage.allowed_providers.includes(contract.storage.provider),
  storage_provisioned:
    contract.storage.provisioned === true &&
    nonEmptyString(contract.storage.provisioning_ref) &&
    nonEmptyString(contract.storage.evidence_source_ref),
  environment_separation_verified:
    contract.environments.preview_production_credentials_separate === true &&
    contract.environments.preview_may_write_production === false &&
    verified(
      contract.environments.separation_verified,
      contract.environments.verification_ref,
    ),
  server_ingestion_operational: verified(
    contract.ingestion.operational,
    contract.ingestion.verification_ref,
  ),
  evidence_query_export_reproducible: verified(
    contract.evidence.query_export_reproducible,
    contract.evidence.query_export_ref,
  ),
  retention_deletion_verified: verified(
    contract.privacy.retention_deletion_verified,
    contract.privacy.retention_deletion_ref,
  ),
  privacy_review_complete: verified(
    contract.privacy.review_complete,
    contract.privacy.review_ref,
  ),
  data_quality_review_complete: verified(
    contract.evidence.data_quality_review_complete,
    contract.evidence.data_quality_ref,
  ),
};

const derivedOperational = Object.values(facts).every(Boolean);
const expectedStatus = derivedOperational ? "operational" : "blocked";
assert(
  contract.operational_gate?.status === expectedStatus,
  `operational evidence: gate status must derive to ${expectedStatus}`,
);

if (!derivedOperational) {
  assert(
    Array.isArray(contract.operational_gate?.blocking_issues) &&
      contract.operational_gate.blocking_issues.length > 0,
    "operational evidence: blocked state requires blocking issues",
  );
}

console.log(
  `✓ operational evidence decision contract: status=${expectedStatus}, provider=${contract.storage.provider ?? "unselected"}`,
);
