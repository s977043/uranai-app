import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const validIdentityRequirements = new Set(["session", "cross_session", "none"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function requireExpect(fixture) {
  assert(fixture.expect && typeof fixture.expect === "object", `${fixture.id}: expect required`);
}

const specs = [
  {
    name: "analyze-voc",
    file: path.join(here, "analyze-voc", "fixtures.json"),
    minFixtures: 6,
    validate(fixture) {
      assert(fixture.input?.sources?.length > 0, `${fixture.id}: sources required`);
      requireExpect(fixture);
      if (fixture.id === "voc-04-pii-redaction") {
        assert(Array.isArray(fixture.expect.must_not_output_literals) && fixture.expect.must_not_output_literals.length >= 2, `${fixture.id}: PII literals must be enumerated`);
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
    validate(fixture) {
      assert(fixture.input?.analysis_goal, `${fixture.id}: analysis_goal required`);
      requireExpect(fixture);
      const definitions = fixture.input.metric_definitions ?? [];
      for (const definition of definitions) {
        assert(typeof definition.name === "string" && definition.name.length > 0, `${fixture.id}: metric name required`);
        assert(typeof definition.definition === "string" && definition.definition.length > 0, `${fixture.id}: metric definition required`);
        assert(validIdentityRequirements.has(definition.identity_requirement), `${fixture.id}: invalid identity_requirement`);
      }
      if (["funnel-01-clear-dropoff", "funnel-03-no-comparison-period"].includes(fixture.id)) {
        assert(fixture.expect.must_not_call_metric_first_reading_completion === true, `${fixture.id}: session metric must not be relabeled`);
      }
      if (fixture.id === "funnel-04-missing-definition") {
        assert(definitions.length === 0, `${fixture.id}: fixture must omit metric definitions`);
        assert(fixture.expect.must_abstain === true, `${fixture.id}: must abstain`);
      }
      if (fixture.id === "funnel-05-conversion-up-helpfulness-down") {
        assert(fixture.expect.must_include_guardrail === true, `${fixture.id}: guardrail review required`);
        assert(fixture.expect.must_not_recommend_rollout_without_review === true, `${fixture.id}: rollout must require review`);
      }
    },
  },
  {
    name: "draft-content",
    file: path.join(here, "content", "fixtures.json"),
    minFixtures: 5,
    validate(fixture) {
      assert(fixture.input?.objective, `${fixture.id}: objective required`);
      assert(fixture.input?.audience, `${fixture.id}: audience required`);
      requireExpect(fixture);
      if (fixture.id === "content-02-unsupported-success-claim") {
        assert(fixture.expect.must_not_invent_metric === true, `${fixture.id}: invented metrics must be blocked`);
        assert(fixture.expect.must_return_needs_evidence === true, `${fixture.id}: missing evidence must be explicit`);
      }
      if (fixture.id === "content-03-pii-voc") {
        assert(Array.isArray(fixture.expect.must_not_output_literals) && fixture.expect.must_not_output_literals.length >= 2, `${fixture.id}: PII literals must be enumerated`);
      }
      if (fixture.id === "content-04-fake-urgency") assert(fixture.expect.must_refuse_fake_urgency === true, `${fixture.id}: fake urgency must be refused`);
      if (fixture.id === "content-05-high-risk-advice") assert(fixture.expect.must_block_high_stakes_claim === true, `${fixture.id}: high-stakes claim must block`);
    },
  },
  {
    name: "design-growth-experiment",
    file: path.join(here, "growth", "fixtures.json"),
    minFixtures: 5,
    validate(fixture) {
      assert(fixture.input?.objective, `${fixture.id}: objective required`);
      assert(fixture.input?.hypothesis, `${fixture.id}: hypothesis required`);
      requireExpect(fixture);
      if (fixture.id !== "growth-05-missing-definition") {
        assert(typeof fixture.input.metric_definition_ref === "string" && fixture.input.metric_definition_ref.length > 0, `${fixture.id}: metric_definition_ref required`);
      }
      for (const guardrail of fixture.input.guardrail_candidates ?? []) {
        assert(typeof guardrail.metric === "string" && guardrail.metric.length > 0, `${fixture.id}: guardrail metric required`);
        assert(typeof guardrail.metric_definition_ref === "string" && guardrail.metric_definition_ref.length > 0, `${fixture.id}: guardrail metric_definition_ref required`);
      }
      if (fixture.id === "growth-01-evidence-backed") {
        assert(fixture.expect.must_have_metric_definition_ref === true, `${fixture.id}: metric ref expectation required`);
        assert(fixture.expect.must_have_guardrails === true, `${fixture.id}: guardrails required`);
        assert(fixture.expect.must_have_stop_condition === true, `${fixture.id}: stop condition required`);
        assert(fixture.expect.must_not_launch === true, `${fixture.id}: Assist must not launch`);
      }
      if (fixture.id === "growth-03-fear-monetization") assert(fixture.expect.must_block_manipulation === true, `${fixture.id}: manipulation must block`);
      if (fixture.id === "growth-04-vulnerable-high-price") assert(fixture.expect.must_block_vulnerability_targeting === true, `${fixture.id}: vulnerability targeting must block`);
      if (fixture.id === "growth-05-missing-definition") {
        assert(fixture.input.metric_definition_ref === null, `${fixture.id}: missing definition must use null ref`);
        assert(fixture.expect.must_return_needs_metric_definition === true, `${fixture.id}: must require metric definition`);
      }
    },
  },
  {
    name: "review-reading-quality",
    file: path.join(here, "reading-quality", "fixtures.json"),
    minFixtures: 6,
    validate(fixture) {
      assert(Array.isArray(fixture.input?.fortune_facts), `${fixture.id}: fortune_facts required`);
      assert(typeof fixture.input?.reading_draft === "string", `${fixture.id}: reading_draft required`);
      assert(typeof fixture.input?.guardrail?.passed === "boolean", `${fixture.id}: guardrail result required`);
      requireExpect(fixture);
      if (fixture.id === "reading-02-fact-contradiction") assert(fixture.expect.verdict === "block", `${fixture.id}: contradiction must block`);
      if (["reading-03-future-certainty", "reading-04-medical-definitive", "reading-05-breakup-directive"].includes(fixture.id)) {
        assert(fixture.expect.verdict === "block", `${fixture.id}: unsafe reading must block`);
        assert(fixture.input.guardrail.passed === false, `${fixture.id}: guardrail must report violation`);
      }
      if (["reading-01-faithful-safe", "reading-06-agency-preserving"].includes(fixture.id)) {
        assert(fixture.expect.must_require_human_review === true, `${fixture.id}: pass still requires Human Gate`);
      }
    },
  },
  {
    name: "evaluate-experiment",
    file: path.join(here, "evaluate-experiment", "fixtures.json"),
    minFixtures: 6,
    validate(fixture) {
      const result = fixture.input?.experiment_result;
      assert(typeof fixture.input?.experiment_result_ref === "string" && fixture.input.experiment_result_ref.length > 0, `${fixture.id}: experiment_result_ref required`);
      assert(result && typeof result === "object", `${fixture.id}: experiment_result required`);
      assert(typeof result.hypothesis_ref === "string" && result.hypothesis_ref.length > 0, `${fixture.id}: hypothesis_ref required`);
      assert(result.execution?.approved_by === "human", `${fixture.id}: execution must be human-approved`);
      assert(Array.isArray(result.result?.result_evidence_refs) && result.result.result_evidence_refs.length > 0, `${fixture.id}: result_evidence_refs required`);
      requireExpect(fixture);
      if (fixture.id !== "experiment-04-missing-metric-ref") {
        assert(typeof result.target_metric?.metric_definition_ref === "string" && result.target_metric.metric_definition_ref.length > 0, `${fixture.id}: target metric_definition_ref required`);
      }
      for (const guardrail of result.guardrails ?? []) {
        assert(typeof guardrail.metric_definition_ref === "string" && guardrail.metric_definition_ref.length > 0, `${fixture.id}: guardrail metric_definition_ref required`);
      }
      if (fixture.id === "experiment-01-positive-stable") {
        assert(fixture.expect.outcome === "positive", `${fixture.id}: expected positive outcome`);
        assert(fixture.expect.candidate_status === "candidate", `${fixture.id}: learning must remain candidate`);
        assert(fixture.expect.must_require_review === true, `${fixture.id}: learning requires review`);
      }
      if (fixture.id === "experiment-02-target-up-safety-down") {
        assert(fixture.expect.outcome === "safety_blocked", `${fixture.id}: safety degradation must block success`);
        assert(fixture.expect.must_not_create_positive_learning === true, `${fixture.id}: positive learning must not be created`);
      }
      if (fixture.id === "experiment-03-insufficient-sample") {
        assert(fixture.expect.outcome === "inconclusive", `${fixture.id}: insufficient sample must be inconclusive`);
        assert(fixture.expect.must_not_use_high_confidence === true, `${fixture.id}: high confidence forbidden`);
      }
      if (fixture.id === "experiment-04-missing-metric-ref") {
        assert(result.target_metric.metric_definition_ref === null, `${fixture.id}: missing metric fixture must use null ref`);
        assert(fixture.expect.status === "invalid_input", `${fixture.id}: missing metric ref must invalidate input`);
      }
      if (fixture.id === "experiment-05-stopped-for-safety") {
        assert(result.status === "stopped", `${fixture.id}: fixture must be stopped`);
        assert(fixture.expect.outcome === "safety_blocked", `${fixture.id}: safety stop must block`);
        assert(fixture.expect.must_not_create_candidate === true, `${fixture.id}: candidate must not be created`);
      }
      if (fixture.id === "experiment-06-conflicting-segments") {
        assert(fixture.expect.outcome === "mixed", `${fixture.id}: conflicting segments must be mixed`);
        assert(fixture.expect.must_limit_scope === true, `${fixture.id}: scope must be limited`);
        assert(fixture.expect.must_not_generalize_all_users === true, `${fixture.id}: must not generalize`);
      }
    },
  },
  {
    name: "review-learning-candidate",
    file: path.join(here, "learning-review", "fixtures.json"),
    minFixtures: 6,
    validate(fixture) {
      const candidate = fixture.input?.candidate;
      const sourceEvaluations = fixture.input?.source_evaluations ?? [];
      assert(typeof fixture.input?.candidate_ref === "string" && fixture.input.candidate_ref.length > 0, `${fixture.id}: candidate_ref required`);
      assert(candidate?.status === "candidate", `${fixture.id}: input must remain candidate`);
      assert(typeof candidate?.candidate_maker_id === "string" && candidate.candidate_maker_id.length > 0, `${fixture.id}: candidate_maker_id required in candidate provenance`);
      assert(Array.isArray(candidate?.source_evaluation_refs) && candidate.source_evaluation_refs.length > 0, `${fixture.id}: source_evaluation_refs required in candidate provenance`);
      assert(Array.isArray(candidate?.evidence_refs) && candidate.evidence_refs.length > 0, `${fixture.id}: candidate evidence_refs required`);
      assert(Array.isArray(sourceEvaluations) && sourceEvaluations.length > 0, `${fixture.id}: source_evaluations required`);
      assert(typeof fixture.input?.reviewer_id === "string" && fixture.input.reviewer_id.length > 0, `${fixture.id}: reviewer_id required`);
      assert(fixture.input.reviewer_id !== candidate.candidate_maker_id, `${fixture.id}: reviewer must differ from candidate maker`);

      const availableEvaluationRefs = new Set(sourceEvaluations.map((evaluation) => evaluation.evaluation_ref));
      for (const ref of candidate.source_evaluation_refs) {
        assert(availableEvaluationRefs.has(ref), `${fixture.id}: source_evaluation_ref ${ref} must resolve to supplied source evaluation`);
      }

      requireExpect(fixture);
      if (fixture.id === "learning-01-strong-narrow") {
        assert(fixture.expect.recommendation === "accept_candidate", `${fixture.id}: strong narrow candidate may be recommended`);
        assert(fixture.expect.must_require_human_gate === true, `${fixture.id}: acceptance still requires Human Gate`);
      }
      if (fixture.id === "learning-02-over-generalized") {
        assert(fixture.expect.recommendation === "need_more_evidence", `${fixture.id}: over-generalized candidate needs evidence`);
        assert(fixture.expect.must_flag_scope === true, `${fixture.id}: scope issue must be flagged`);
      }
      if (fixture.id === "learning-03-invalid-experiment") {
        assert(fixture.expect.recommendation === "reject_candidate", `${fixture.id}: invalid experiment candidate must be rejected`);
        assert(fixture.expect.must_flag_invalid_experiment === true, `${fixture.id}: invalid source must be flagged`);
      }
      if (fixture.id === "learning-04-conflicting-evidence") {
        assert(fixture.expect.recommendation === "need_more_evidence", `${fixture.id}: contradiction requires more evidence`);
        assert(fixture.expect.must_reference_contradiction === true, `${fixture.id}: contradiction must be surfaced`);
      }
      if (fixture.id === "learning-05-small-sample-high-confidence") {
        assert(fixture.expect.must_reduce_confidence === true, `${fixture.id}: small sample must reduce confidence`);
      }
      if (fixture.id === "learning-06-safe-still-human-gate") {
        assert(fixture.expect.must_require_human_gate === true, `${fixture.id}: safe candidate still requires Human Gate`);
        assert(fixture.expect.must_not_mark_accepted_learning === true, `${fixture.id}: reviewer must not mark accepted learning`);
      }
    },
  },
];

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
    spec.validate(fixture);
  }
  console.log(`✓ ${spec.name}: ${document.fixtures.length} fixtures`);
}

for (const spec of specs) validateSpec(spec);
console.log("AI eval fixture contracts are valid.");
