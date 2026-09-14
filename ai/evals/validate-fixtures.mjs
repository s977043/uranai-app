import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const specs = [
  {
    name: "analyze-voc",
    file: path.join(here, "analyze-voc", "fixtures.json"),
    validateFixture(fixture) {
      assert(fixture.input?.sources?.length > 0, `${fixture.id}: sources required`);
      assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);

      if (fixture.id === "voc-04-pii-redaction") {
        assert(
          Array.isArray(fixture.expect.must_not_output_literals) && fixture.expect.must_not_output_literals.length >= 2,
          `${fixture.id}: PII literals must be enumerated for regression checking`,
        );
      }

      if (fixture.id === "voc-05-high-risk") {
        assert(fixture.expect.must_flag_safety === true, `${fixture.id}: safety flag required`);
        assert(fixture.expect.must_not_recommend_monetization === true, `${fixture.id}: monetization block required`);
      }
    },
  },
  {
    name: "analyze-funnel",
    file: path.join(here, "analyze-funnel", "fixtures.json"),
    validateFixture(fixture) {
      assert(fixture.input?.analysis_goal, `${fixture.id}: analysis_goal required`);
      assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);

      if (fixture.id === "funnel-04-missing-definition") {
        assert(fixture.expect.must_abstain === true, `${fixture.id}: missing metric definition must abstain`);
      }

      if (fixture.id === "funnel-05-conversion-up-helpfulness-down") {
        assert(fixture.expect.must_include_guardrail === true, `${fixture.id}: guardrail review required`);
        assert(
          fixture.expect.must_not_recommend_rollout_without_review === true,
          `${fixture.id}: rollout must require review when guardrail worsens`,
        );
      }
    },
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validateSpec(spec) {
  const document = readJson(spec.file);

  assert(document.version === 1, `${spec.name}: version must be 1`);
  assert(document.skill === spec.name, `${spec.name}: skill field mismatch`);
  assert(Array.isArray(document.fixtures), `${spec.name}: fixtures must be an array`);
  assert(document.fixtures.length >= 6, `${spec.name}: at least 6 fixtures required`);

  const ids = new Set();
  for (const fixture of document.fixtures) {
    assert(typeof fixture.id === "string" && fixture.id.length > 0, `${spec.name}: fixture id required`);
    assert(!ids.has(fixture.id), `${spec.name}: duplicate fixture id ${fixture.id}`);
    ids.add(fixture.id);
    assert(typeof fixture.goal === "string" && fixture.goal.length > 0, `${fixture.id}: goal required`);
    assert(fixture.input && typeof fixture.input === "object", `${fixture.id}: input required`);
    spec.validateFixture(fixture);
  }

  console.log(`✓ ${spec.name}: ${document.fixtures.length} fixtures`);
}

for (const spec of specs) {
  validateSpec(spec);
}

console.log("AI eval fixture contracts are valid.");
