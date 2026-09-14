import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const registryPath = path.join(repoRoot, "ai/contracts/metric-registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const validIdentityRequirements = new Set(["session", "cross_session", "none"]);
const validStatuses = new Set(["active", "provisional"]);
const validObservabilityStatuses = new Set(["uninstrumented", "partial", "observable"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(registry.version === 1, "metric registry: version must be 1");
assert(Array.isArray(registry.metrics) && registry.metrics.length > 0, "metric registry: metrics required");

const refs = new Map();
for (const metric of registry.metrics) {
  assert(typeof metric.ref === "string" && metric.ref.startsWith("metric:"), `metric registry: invalid ref ${metric.ref}`);
  assert(!refs.has(metric.ref), `metric registry: duplicate ref ${metric.ref}`);
  assert(typeof metric.name === "string" && metric.name.length > 0, `${metric.ref}: name required`);
  assert(validIdentityRequirements.has(metric.identity_requirement), `${metric.ref}: invalid identity_requirement`);
  assert(validStatuses.has(metric.status), `${metric.ref}: invalid status`);
  assert(validObservabilityStatuses.has(metric.observability_status), `${metric.ref}: invalid observability_status`);
  assert(Array.isArray(metric.required_events), `${metric.ref}: required_events must be an array`);
  assert(metric.required_events.every((eventName) => typeof eventName === "string" && eventName.length > 0), `${metric.ref}: required_events must contain non-empty strings`);
  assert(metric.evidence_source_ref === null || typeof metric.evidence_source_ref === "string", `${metric.ref}: evidence_source_ref must be string or null`);
  if (metric.observability_status === "observable") {
    assert(typeof metric.evidence_source_ref === "string" && metric.evidence_source_ref.length > 0, `${metric.ref}: observable metric requires evidence_source_ref`);
  }
  assert(typeof metric.definition_source === "string" && metric.definition_source.length > 0, `${metric.ref}: definition_source required`);

  const [sourceFile] = metric.definition_source.split("#");
  assert(fs.existsSync(path.join(repoRoot, sourceFile)), `${metric.ref}: definition source file not found: ${sourceFile}`);
  refs.set(metric.ref, metric);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name === "fixtures.json") files.push(full);
  }
  return files;
}

function collectMetricRefs(value, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectMetricRefs(item, found);
    return found;
  }
  if (!value || typeof value !== "object") return found;

  for (const [key, child] of Object.entries(value)) {
    if (key === "metric_definition_ref" && child !== null) found.push(child);
    else collectMetricRefs(child, found);
  }
  return found;
}

const fixtureFiles = walk(here);
let checkedRefs = 0;
for (const fixtureFile of fixtureFiles) {
  const document = JSON.parse(fs.readFileSync(fixtureFile, "utf8"));
  for (const ref of collectMetricRefs(document)) {
    assert(typeof ref === "string", `${fixtureFile}: metric_definition_ref must be string or null`);
    const metric = refs.get(ref);
    assert(metric, `${fixtureFile}: unknown metric_definition_ref ${ref}`);
    assert(metric.status === "active", `${fixtureFile}: metric_definition_ref ${ref} is not active`);
    checkedRefs += 1;
  }
}

const observableCount = registry.metrics.filter((metric) => metric.observability_status === "observable").length;
console.log(`✓ metric registry: ${refs.size} metrics, ${checkedRefs} fixture refs validated, ${observableCount} observable`);
