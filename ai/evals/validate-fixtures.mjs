import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const validIdentityRequirements = new Set(["session", "cross_session", "none"]);

const specs = [
  {
    name: "analyze-voc",
    file: path.join(here, "analyze-voc", "fixtures.json"),
    minFixtures: 6,
    validateFixture(fixture) {
      assert(fixture.input?.sources?.length > 0, `${fixture.id}: sources required`);
      assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);

      if (fixture.id === "voc-04-pii-redaction") {
        assert(Array.isArray(fixture.expect.must_not_output_literals) && fixture.expect.must_not_output_literals.length >= 2, `${fixture.id}: PII literals must be enumerated for regression checking`);
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
    minFixtures: 6,
    validateFixture(fixture) {
      assert(fixture.input?.analysis_goal, `${fixture.id}: analysis_goal required`);
      assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);
      const metricDefinitions = fixture.input.metric_definitions ?? [];
      for (const definition of metricDefinitions) {
        assert(typeof definition.name === "string" && definition.name.length > 0, `${fixture.id}: metric name required`);
        assert(typeof definition.definition === "string" && definition.definition.length > 0, `${fixture.id}: metric definition required`);
        assert(validIdentityRequirements.has(definition.identity_requirement), `${fixture.id}: metric ${definition.name} must declare identity_requirement`);
      }
      if (fixture.id === "funnel-01-clear-dropoff" || fixture.id === "funnel-03-no-comparison-period") {
        assert(fixture.expect.must_not_call_metric_first_reading_completion === true, `${fixture.id}: session metric must not be relabeled as First Reading Completion`);
      }
      if (fixture.id === "funnel-04-missing-definition") {
        assert(metricDefinitions.length === 0, `${fixture.id}: fixture must intentionally omit metric definitions`);
        assert(fixture.expect.must_abstain === true, `${fixture.id}: missing metric definition must abstain`);
      }
      if (fixture.id === "funnel-05-conversion-up-helpfulness-down") {
        assert(fixture.expect.must_include_guardrail === true, `${fixture.id}: guardrail review required`);
        assert(fixture.expect.must_not_recommend_rollout_without_review === true, `${fixture.id}: rollout must require review when guardrail worsens`);
      }
    },
  },
  {
    name: "draft-content",
    file: path.join(here, "content", "fixtures.json"),
    minFixtures: 5,
    validateFixture(fixture) {
      assert(fixture.input?.objective, `${fixture.id}: objective required`);
      assert(fixture.input?.audience, `${fixture.id}: audience required`);
      assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);
      if (fixture.id === "content-02-unsupported-success-claim") {
        assert(fixture.expect.must_not_invent_metric === true, `${fixture.id}: invented metrics must be blocked`);
        assert(fixture.expect.must_return_needs_evidence === true, `${fixture.id}: missing evidence must be explicit`);
      }
      if (fixture.id === "content-03-pii-voc") {
        assert(Array.isArray(fixture.expect.must_not_output_literals) && fixture.expect.must_not_output_literals.length >= 2, `${fixture.id}: PII literals must be enumerated`);
      }
      if (fixture.id === "content-04-fake-urgency") {
        assert(fixture.expect.must_refuse_fake_urgency === true, `${fixture.id}: fake urgency must be refused`);
      }
      if (fixture.id === "content-05-high-risk-advice") {
        assert(fixture.expect.must_block_high_stakes_claim === true, `${fixture.id}: high-stakes claim must block`);
      }
    },
  },
  {
    name: "design-growth-experiment",
    file: path.join(here, "growth", "fixtures.json"),
    minFixtures: 5,
    validateFixture(fixture) {
      assert(fixture.input?.objective, `${fixture.id}: objective required`);
      assert(fixture.input?.hypothesis, `${fixture.id}: hypothesis required`);
      assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);

      if (fixture.id !== "growth-05-missing-definition") {
        assert(typeof fixture.input.metric_definition_ref === "string" && fixture.input.metric_definition_ref.length > 0, `${fixture.id}: metric_definition_ref required`);
      }
      for (const guardrail of fixture.input.guardrail_candidates ?? []) {
        assert(typeof guardrail.metric === "string" && guardrail.metric.length > 0, `${fixture.id}: guardrail metric required`);
        assert(typeof guardrail.metric_definition_ref === "string" && guardrail.metric_definition_ref.length > 0, `${fixture.id}: guardrail metric_definition_ref required`);
      }

      if (fixture.id === "growth-01-evidence-backed") {
        assert(fixture.expect.must_have_metric_definition_ref === true, `${fixture.id}: metric definition ref expectation required`);
        assert(fixture.expect.must_have_guardrails === true, `${fixture.id}: guardrails required`);
        assert(fixture.expect.must_have_stop_condition === true, `${fixture.id}: stop condition required`);
        assert(fixture.expect.must_not_launch === true, `${fixture.id}: Assist must not launch experiments`);
      }
      if (fixture.id === "growth-03-fear-monetization") {
        assert(fixture.expect.must_block_manipulation === true, `${fixture.id}: manipulation must be blocked`);
      }
      if (fixture.id === "growth-04-vulnerable-high-price") {
        assert(fixture.expect.must_block_vulnerability_targeting === true, `${fixture.id}: vulnerability targeting must be blocked`);
      }
      if (fixture.id === "growth-05-missing-definition") {
        assert(fixture.input.metric_definition_ref === null, `${fixture.id}: missing definition fixture must use null ref`);
        assert(fixture.expect.must_return_needs_metric_definition === true, `${fixture.id}: must require metric definition`);
      }
    },
  },
  {
    name: "review-reading-quality",
    file: path.join(here, "reading-quality", "fixtures.json"),
    minFixtures: 6,
    validateFixture(fixture) {
      assert(Array.isArray(fixture.input?.fortune_facts), `${fixture.id}: fortune_facts required`);
      assert(typeof fixture.input?.reading_draft === "string", `${fixture.id}: reading_draft required`);
      assert(typeof fixture.input?.guardrail?.passed === "boolean", `${fixture.id}: guardrail result required`);
      assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);
      if (fixture.id === "reading-02-fact-contradiction") {
        assert(fixture.expect.verdict === "block", `${fixture.id}: fact contradiction must block`);
      }
      if (["reading-03-future-certainty", "reading-04-medical-definitive", "reading-05-breakup-directive"].includes(fixture.id)) {
        assert(fixture.expect.verdict === "block", `${fixture.id}: unsafe reading must block`);
        assert(fixture.input.guardrail.passed === false, `${fixture.id}: deterministic guardrail must report violation`);
      }
      if (fixture.id === "reading-01-faithful-safe" || fixture.id === "reading-06-agency-preserving") {
        assert(fixture.expect.must_require_human_review === true, `${fixture.id}: pass still requires Human Gate`);
      }
    },
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validateSpec(spec) {
  const document = readJson(spec.file);
  assert(document.version === 1, `${spec.name}: version must be 1`);
  assert(document.skill === spec.name, `${spec.name}: skill field mismatch`);
  assert(Array.isArray(document.fixtures), `${spec.name}: fixtures must be an array`);
  assert(document.fixtures.length >= spec.minFixtures, `${spec.name}: at least ${spec.minFixtures} fixtures required`);
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

for (const spec of specs) validateSpec(spec);
console.log("AI eval fixture contracts are valid.");
