import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pkg = readJson("package.json");
const lock = readJson("package-lock.json");
const contract = readJson("ai/contracts/operational-evidence-source.json");
const migration = read("db/migrations/0001_create_telemetry_evidence.sql");
const rollback = read("db/migrations/0001_create_telemetry_evidence.down.sql");
const route = read("src/app/api/telemetry/route.ts");
const repository = read("src/adapters/telemetry/postgresEvidenceRepository.ts");
const operations = read("docs/ai-native/telemetry-evidence-operations.md");
const envExample = read(".env.example");

assert(pkg.dependencies?.pg === "8.23.0", "postgres evidence: pg must be pinned to 8.23.0");
assert(pkg.devDependencies?.["@types/pg"] === "8.23.1", "postgres evidence: @types/pg must be pinned to 8.23.1");
assert(lock.packages?.[""]?.dependencies?.pg === "8.23.0", "postgres evidence: package-lock root pg mismatch");
assert(lock.packages?.[""]?.devDependencies?.["@types/pg"] === "8.23.1", "postgres evidence: package-lock root @types/pg mismatch");
assert(lock.packages?.["node_modules/pg"]?.version === "8.23.0", "postgres evidence: locked pg version mismatch");
assert(lock.packages?.["node_modules/@types/pg"]?.version === "8.23.1", "postgres evidence: locked @types/pg version mismatch");

assert(contract.storage?.local_adapter_implemented === true, "postgres evidence: local adapter must be tracked");
assert(contract.storage?.local_adapter_ref === "src/adapters/telemetry/postgresEvidenceRepository.ts", "postgres evidence: adapter ref mismatch");
assert(contract.storage?.migration_ref === "db/migrations/0001_create_telemetry_evidence.sql", "postgres evidence: migration ref mismatch");
assert(contract.storage?.rollback_ref === "db/migrations/0001_create_telemetry_evidence.down.sql", "postgres evidence: rollback ref mismatch");
assert(contract.ingestion?.route_implemented === true, "postgres evidence: route must be tracked");
assert(contract.ingestion?.route_ref === "src/app/api/telemetry/route.ts", "postgres evidence: route ref mismatch");
assert(contract.evidence?.operations_ref === "docs/ai-native/telemetry-evidence-operations.md", "postgres evidence: operations ref mismatch");
assert(typeof contract.evidence?.local_integration_verified === "boolean", "postgres evidence: local integration flag must be boolean");
if (contract.evidence.local_integration_verified) {
  assert(
    typeof contract.evidence.local_integration_ref === "string" &&
      contract.evidence.local_integration_ref.trim().length > 0,
    "postgres evidence: verified local integration requires evidence ref",
  );
}
assert(contract.operational_gate?.status === "blocked", "postgres evidence: Phase C must not open the operational gate");
assert(contract.ingestion?.operational === false, "postgres evidence: route implementation is not operational evidence");

for (const required of [
  "ingested_at timestamptz NOT NULL",
  "anonymous_visitor_id text NULL",
  "CHECK (anonymous_visitor_id IS NULL)",
  "properties jsonb NOT NULL",
  "telemetry_evidence_flow_ingested_idx",
]) {
  assert(migration.includes(required), `postgres evidence: migration missing ${required}`);
}

for (const forbidden of [
  "user_agent",
  "ip_address",
  "client_ip",
  "consultation_text",
  "raw_prompt",
  "model_response",
]) {
  assert(!migration.toLowerCase().includes(forbidden), `postgres evidence: migration must not persist ${forbidden}`);
}

assert(rollback.includes("DROP TABLE IF EXISTS telemetry_evidence"), "postgres evidence: rollback must drop telemetry table");
assert(route.includes('export const runtime = "nodejs"'), "postgres evidence: route must use Node.js runtime");
assert(route.includes("TELEMETRY_INGESTION_ENABLED"), "postgres evidence: route must use the explicit ingestion gate");
assert(repository.includes("ingested_at >= $1::timestamptz"), "postgres evidence: export window must use ingested_at");
assert(repository.includes("DELETE FROM telemetry_evidence WHERE ingested_at < $1::timestamptz"), "postgres evidence: deletion must use ingested_at");
assert(operations.includes("30-day retention"), "postgres evidence: retention runbook missing");
assert(envExample.includes("TELEMETRY_INGESTION_ENABLED=false"), "postgres evidence: ingestion must default off in env example");

console.log(
  `✓ PostgreSQL evidence contract: route=implemented, local_integration=${contract.evidence.local_integration_verified}, operational=blocked`,
);
