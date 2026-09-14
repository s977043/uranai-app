import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, "ai/contracts/metric-registry.json"), "utf8"));
const rehearsal = JSON.parse(fs.readFileSync(path.join(repoRoot, "ai/workflows/examples/closed-loop-pilot-synthetic.json"), "utf8"));
const readiness = JSON.parse(fs.readFileSync(path.join(repoRoot, "ai/workflows/examples/closed-loop-pilot-readiness.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const metricRefs = new Map(registry.metrics.map((metric) => [metric.ref, metric]));

function activeMetric(ref, context) {
  const metric = metricRefs.get(ref);
  assert(metric, `${context}: unknown metric ref ${ref}`);
  assert(metric.status === "active", `${context}: metric ref ${ref} must have active definition`);
  return metric;
}

assert(rehearsal.version === 1, "pilot rehearsal: version must be 1");
assert(rehearsal.workflow === "closed-loop-operational-pilot", "pilot rehearsal: workflow mismatch");
assert(Array.isArray(rehearsal.cases) && rehearsal.cases.length >= 2, "pilot rehearsal: at least two cases required");

let positiveCount = 0;
let safetyBlockedCount = 0;

for (const pilotCase of rehearsal.cases) {
  assert(typeof pilotCase.id === "string" && pilotCase.id.length > 0, "pilot rehearsal: case id required");
  assert(pilotCase.mode === "synthetic", `${pilotCase.id}: only synthetic cases are allowed in rehearsal fixture`);
  assert(pilotCase.owner === "human", `${pilotCase.id}: owner must remain human`);
  assert(pilotCase.risk === "low", `${pilotCase.id}: rehearsal must stay low risk`);
  assert(pilotCase.start_decision === "approve", `${pilotCase.id}: synthetic execution requires explicit approval`);
  assert(pilotCase.start_decided_by === "human", `${pilotCase.id}: start decision must be human`);
  assert(typeof pilotCase.rollback === "string" && pilotCase.rollback.length > 0, `${pilotCase.id}: rollback required`);
  assert(Array.isArray(pilotCase.stop_conditions) && pilotCase.stop_conditions.length > 0, `${pilotCase.id}: stop_conditions required`);
  assert(Array.isArray(pilotCase.evidence_source_refs) && pilotCase.evidence_source_refs.length > 0, `${pilotCase.id}: evidence_source_refs required`);
  assert(pilotCase.evidence_source_refs.every((ref) => typeof ref === "string" && ref.startsWith("synthetic:")), `${pilotCase.id}: rehearsal evidence must be synthetic`);
  assert(Array.isArray(pilotCase.result?.result_evidence_refs) && pilotCase.result.result_evidence_refs.length > 0, `${pilotCase.id}: result evidence required`);
  assert(pilotCase.result.result_evidence_refs.every((ref) => typeof ref === "string" && ref.startsWith("synthetic:")), `${pilotCase.id}: result evidence must be synthetic`);

  activeMetric(pilotCase.target_metric_ref, pilotCase.id);
  for (const ref of pilotCase.guardrail_metric_refs ?? []) activeMetric(ref, pilotCase.id);

  const humanDecision = pilotCase.human_learning_decision;
  assert(humanDecision && typeof humanDecision === "object", `${pilotCase.id}: human learning decision required`);
  assert(humanDecision.accepted_learning_ref === null, `${pilotCase.id}: synthetic rehearsal must never create Accepted Learning`);

  if (pilotCase.evaluation?.outcome === "positive") {
    positiveCount += 1;
    assert(pilotCase.execution_status === "completed", `${pilotCase.id}: positive case must complete`);
    assert(pilotCase.evaluation.validity === "valid", `${pilotCase.id}: positive case must be valid`);
    assert(pilotCase.learning_candidate?.status === "candidate", `${pilotCase.id}: positive case requires candidate`);
    assert(typeof pilotCase.learning_candidate?.candidate_maker_id === "string", `${pilotCase.id}: candidate_maker_id required`);
    assert(Array.isArray(pilotCase.learning_candidate?.source_evaluation_refs) && pilotCase.learning_candidate.source_evaluation_refs.includes(pilotCase.evaluation.evaluation_ref), `${pilotCase.id}: candidate must reference source evaluation`);
    assert(pilotCase.learning_review?.human_gate_required === true, `${pilotCase.id}: learning review must require Human Gate`);
    assert(pilotCase.learning_review?.reviewer_id !== pilotCase.learning_candidate.candidate_maker_id, `${pilotCase.id}: reviewer must differ from candidate maker`);
    assert(humanDecision.decision === "reject", `${pilotCase.id}: synthetic positive learning must be rejected for product promotion`);
  }

  if (pilotCase.evaluation?.outcome === "safety_blocked") {
    safetyBlockedCount += 1;
    assert(pilotCase.execution_status === "stopped", `${pilotCase.id}: safety-blocked case must stop`);
    assert(Array.isArray(pilotCase.result?.safety_findings) && pilotCase.result.safety_findings.length > 0, `${pilotCase.id}: safety finding required`);
    assert(pilotCase.learning_candidate === null, `${pilotCase.id}: safety-blocked case must not create candidate`);
    assert(pilotCase.learning_review === null, `${pilotCase.id}: no candidate means no learning review`);
    assert(humanDecision.decision === "not_applicable", `${pilotCase.id}: learning decision should be not_applicable`);
  }
}

assert(positiveCount >= 1, "pilot rehearsal: positive path required");
assert(safetyBlockedCount >= 1, "pilot rehearsal: safety-blocked path required");

assert(readiness.version === 1, "pilot readiness: version must be 1");
assert(readiness.mode === "manual_real", "pilot readiness: mode must be manual_real");
assert(readiness.owner === "human", "pilot readiness: owner must remain human");
assert(readiness.risk === "low", "pilot readiness: first real pilot must be low risk");
assert(readiness.status === "blocked", "pilot readiness: current assessment must remain blocked");
assert(readiness.readiness_status === "blocked", "pilot readiness: readiness_status must remain blocked");
assert(readiness.start_decision === "need_evidence", "pilot readiness: blocked pilot must not be approved to start");
assert(readiness.start_decided_by === "human", "pilot readiness: start decision owner must be human");
assert(Array.isArray(readiness.blocking_dependencies) && readiness.blocking_dependencies.length > 0, "pilot readiness: blocking dependencies required");
assert(readiness.execution_ref === null, "pilot readiness: blocked pilot must not have execution_ref");
assert(readiness.experiment_result_ref === null, "pilot readiness: blocked pilot must not have result");
assert(readiness.accepted_learning_ref === null, "pilot readiness: blocked pilot must not have Accepted Learning");

const targetMetric = activeMetric(readiness.target_metric_ref, "pilot readiness target");
assert(readiness.metric_observability?.target === targetMetric.observability_status, "pilot readiness: target observability must match registry");

for (const guardrailRef of readiness.guardrail_metric_refs ?? []) {
  const metric = activeMetric(guardrailRef, "pilot readiness guardrail");
  const recorded = readiness.metric_observability?.guardrails?.find((item) => item.ref === guardrailRef);
  assert(recorded, `pilot readiness: observability entry missing for ${guardrailRef}`);
  assert(recorded.status === metric.observability_status, `pilot readiness: observability mismatch for ${guardrailRef}`);
}

const allMetricRefs = [readiness.target_metric_ref, ...(readiness.guardrail_metric_refs ?? [])];
const allObservable = allMetricRefs.every((ref) => metricRefs.get(ref)?.observability_status === "observable");
const realPilotReady = allObservable && readiness.evidence_source_operational === true && readiness.execution_surface_available === true;
assert(realPilotReady === false, "pilot readiness: fixture should demonstrate a blocked real pilot");
assert(readiness.evidence_source_operational === false, "pilot readiness: current Evidence source is not operational");
assert(readiness.execution_surface_available === false, "pilot readiness: current execution surface is not available");

console.log(`✓ pilot rehearsal: ${rehearsal.cases.length} cases, positive=${positiveCount}, safety_blocked=${safetyBlockedCount}`);
console.log(`✓ pilot readiness: blocked as expected, target=${targetMetric.observability_status}, dependencies=${readiness.blocking_dependencies.length}`);
