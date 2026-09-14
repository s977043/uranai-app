import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(here, "evaluate-experiment", "fixtures.json");
const document = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function canonicalIso(value) {
  if (!nonEmptyString(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function calendarDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));
}

assert(document.version === 1, "execution receipt: fixture version must be 1");
assert(document.skill === "evaluate-experiment", "execution receipt: skill mismatch");
assert(Array.isArray(document.fixtures) && document.fixtures.length >= 8, "execution receipt: at least 8 fixtures required");

let deviationCases = 0;
let stoppedCases = 0;
let triggeredStopCases = 0;
let manualStopCases = 0;

for (const fixture of document.fixtures) {
  const result = fixture.input?.experiment_result;
  const execution = result?.execution;

  assert(result && typeof result === "object", `${fixture.id}: experiment_result required`);
  assert(execution && typeof execution === "object", `${fixture.id}: execution receipt required`);
  assert(execution.approved_by === "human", `${fixture.id}: execution must remain human-approved`);
  assert(calendarDate(execution.approved_at), `${fixture.id}: approved_at must be YYYY-MM-DD`);
  assert(calendarDate(execution.started_at), `${fixture.id}: started_at must be YYYY-MM-DD`);
  assert(calendarDate(execution.ended_at), `${fixture.id}: ended_at must be YYYY-MM-DD`);
  assert(execution.approved_at <= execution.started_at, `${fixture.id}: approval must not be after start`);
  assert(execution.started_at <= execution.ended_at, `${fixture.id}: start must not be after end`);
  assert(canonicalIso(execution.executed_at), `${fixture.id}: executed_at must be canonical ISO-8601`);
  assert(nonEmptyString(execution.execution_scope), `${fixture.id}: execution_scope required`);
  assert(nonEmptyString(execution.implementation_ref), `${fixture.id}: implementation_ref required`);
  assert(nonEmptyString(execution.actual_change), `${fixture.id}: actual_change required`);
  assert(Array.isArray(execution.deviations_from_proposal), `${fixture.id}: deviations_from_proposal must be an array`);
  assert(execution.deviations_from_proposal.every(nonEmptyString), `${fixture.id}: deviations must be non-empty strings`);
  assert(typeof execution.stop_condition_triggered === "boolean", `${fixture.id}: stop_condition_triggered required`);
  assert(nonEmptyString(execution.execution_ref), `${fixture.id}: execution_ref required`);

  if (result.status === "stopped") {
    stoppedCases += 1;
    assert(nonEmptyString(execution.stop_reason), `${fixture.id}: stopped execution requires stop_reason`);
    if (!execution.stop_condition_triggered) {
      manualStopCases += 1;
      assert(fixture.expect?.must_preserve_manual_stop_reason === true, `${fixture.id}: manual stop case must preserve stop reason`);
    }
  } else if (!execution.stop_condition_triggered) {
    assert(execution.stop_reason === null, `${fixture.id}: non-stopped execution without triggered condition requires null stop_reason`);
  }

  if (execution.stop_condition_triggered) {
    triggeredStopCases += 1;
    assert(nonEmptyString(execution.stop_reason), `${fixture.id}: triggered stop condition requires stop_reason`);
    assert(result.status === "stopped", `${fixture.id}: triggered stop condition must have stopped execution status`);
  }

  if (execution.deviations_from_proposal.length > 0) {
    deviationCases += 1;
    assert(fixture.expect?.must_surface_execution_deviation === true, `${fixture.id}: deviation case must require surfacing the deviation`);
    assert(["limited", "invalid"].includes(fixture.expect?.validity), `${fixture.id}: material deviation must limit or invalidate validity`);
    assert(fixture.expect?.execution_fidelity === "deviated", `${fixture.id}: deviation case must expect deviated execution fidelity`);
  }
}

assert(deviationCases >= 1, "execution receipt: at least one material deviation regression case required");
assert(stoppedCases >= 2, "execution receipt: triggered and manual stopped cases required");
assert(triggeredStopCases >= 1, "execution receipt: at least one triggered stop-condition regression case required");
assert(manualStopCases >= 1, "execution receipt: at least one explicit manual stop regression case required");

console.log(`✓ execution receipt contract: ${document.fixtures.length} fixtures, deviations=${deviationCases}, stopped=${stoppedCases}, triggered_stops=${triggeredStopCases}, manual_stops=${manualStopCases}`);
