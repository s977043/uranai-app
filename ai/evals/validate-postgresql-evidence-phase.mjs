import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(root, relativePath), "utf8"),
  );
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertRef(relativePath, label) {
  assert(
    typeof relativePath === "string" && relativePath.length > 0,
    `postgres telemetry: ${label} ref is required`,
  );
  assert(
    fs.existsSync(path.join(root, relativePath)),
    `postgres telemetry: ${label} ref does not exist: ${relativePath}`,
  );
}

const contract = readJson("ai/contracts/operational-evidence-source.json");
const metrics = readJson("ai/contracts/metric-registry.json");
const pkg = readJson("package.json");
const lock = readJson("package-lock.json");

assert(
  contract.storage?.schema_implemented === true,
  "postgres telemetry: schema implementation fact is required",
);
assertRef(contract.storage?.schema_ref, "schema");
assert(
  contract.storage?.adapter_implemented === true,
  "postgres telemetry: adapter implementation fact is required",
);
assertRef(contract.storage?.adapter_ref, "adapter");

assert(
  contract.ingestion?.route_implemented === true,
  "postgres telemetry: route implementation fact is required",
);
assertRef(contract.ingestion?.route_ref, "route");
assert(
  contract.ingestion?.operational === false,
  "postgres telemetry: Phase C must not claim operational ingestion",
);

assert(
  contract.evidence?.query_export_implemented === true,
  "postgres telemetry: query/export implementation fact is required",
);
assertRef(contract.evidence?.query_export_implementation_ref, "query/export");
assertRef(contract.evidence?.local_integration_test_ref, "integration test");

assert(
  contract.privacy?.retention_deletion_implemented === true,
  "postgres telemetry: retention/deletion implementation fact is required",
);
assertRef(
  contract.privacy?.retention_deletion_implementation_ref,
  "retention/deletion",
);

assert(
  contract.operational_gate?.status === "blocked",
  "postgres telemetry: Phase C must keep Operational Evidence blocked",
);
assert(
  Array.isArray(contract.operational_gate?.blocking_issues) &&
    contract.operational_gate.blocking_issues.length > 0,
  "postgres telemetry: blocked state requires blockers",
);

assert(
  pkg.dependencies?.postgres === "3.4.9",
  "postgres telemetry: postgres dependency must be pinned to 3.4.9",
);
assert(
  lock.packages?.["node_modules/postgres"]?.version === "3.4.9",
  "postgres telemetry: package lock must contain postgres 3.4.9",
);

const migration = readText(contract.storage.schema_ref);
assert(
  (migration.match(/CREATE TABLE\\s+telemetry_evidence/gi) ?? []).length === 1,
  "postgres telemetry: migration must create telemetry_evidence exactly once",
);
assert(
  !/IF NOT EXISTS/i.test(migration),
  "postgres telemetry: migration must fail rather than hide unexpected schema drift",
);
assert(
  /occurred_at\s+timestamptz\s+NOT NULL/i.test(migration),
  "postgres telemetry: migration must store occurred_at",
);
assert(
  /ingested_at\s+timestamptz\s+NOT NULL/i.test(migration),
  "postgres telemetry: migration must store ingested_at",
);
for (const disallowedColumn of [
  "anonymous_visitor_id",
  "client_ip",
  "user_agent",
  "consultation",
  "raw_prompt",
  "raw_response",
]) {
  const columnPattern = new RegExp(
    `^\\s*${disallowedColumn}\\s+`,
    "im",
  );
  assert(
    !columnPattern.test(migration),
    `postgres telemetry: disallowed column found: ${disallowedColumn}`,
  );
}
assert(
  !/\bUNIQUE\b/i.test(migration),
  "postgres telemetry: raw duplicate Evidence must not be silently constrained away",
);

const route = readText(contract.ingestion.route_ref);
assert(
  /export const runtime = "nodejs"/.test(route),
  "postgres telemetry: route must use Node.js runtime",
);
assert(
  /export async function POST/.test(route),
  "postgres telemetry: route must expose POST",
);

const envExample = readText(".env.example");
assert(
  /TELEMETRY_INGESTION_ENABLED=false/.test(envExample),
  "postgres telemetry: central ingestion must stay disabled by default",
);

const workflow = readText(".github/workflows/ci.yml");
assert(
  /image: postgres:16-alpine/.test(workflow) &&
    /npm run test:integration/.test(workflow),
  "postgres telemetry: CI must exercise PostgreSQL 16 integration",
);

for (const ref of [
  "metric:reading_flow_completion",
  "metric:helpful_feedback_rate",
]) {
  const metric = metrics.metrics.find((entry) => entry.ref === ref);
  assert(metric, `postgres telemetry: missing metric ${ref}`);
  assert(
    metric.observability_status === "partial",
    `postgres telemetry: ${ref} must remain partial in Phase C`,
  );
}

console.log(
  "✓ PostgreSQL telemetry Phase C contracts: persistence/query/retention/route implemented; operational gate remains blocked",
);
