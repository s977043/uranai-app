import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getSample } from "../public/app.mjs";

const read = relative => readFile(new URL(relative, import.meta.url), "utf8");

test("theme input must be a string, not a coercible object", () => {
  for (const input of [null, undefined, 1, true, ["self"], { toString: () => "work" }]) {
    assert.equal(getSample(input), null);
  }
  assert.equal(getSample({ toString() { throw new Error("must not coerce user input"); } }), null);
});

test("recovery preserves all current main contract checks and explicit static CI", async () => {
  const pkg = JSON.parse(await read("../../package.json"));
  for (const name of ["validate-fixtures", "validate-metric-registry", "validate-pilot-rehearsal", "validate-execution-receipt", "validate-operational-evidence-decision", "validate-server-ingestion-core", "validate-postgresql-evidence-phase", "validate-telemetry-ingress-guard", "validate-community-health"]) {
    assert.ok(pkg.scripts["eval:contracts"].includes(`ai/evals/${name}.mjs`), name);
  }
  assert.ok(pkg.scripts.verify.includes("npm run test:marketing"));
  assert.match(await read("../../.github/workflows/ci.yml"), /run: npm run test:marketing/);
  const readme = await read("../../README.md");
  for (const file of ["SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md"]) assert.ok(readme.includes(file));
});

test("source documentation must not present noindex as access control", async () => {
  const readme = await read("../README.md");
  assert.match(readme, /Indexing is NOT access control/);
  assert.match(readme, /no deployment and no deployment workflow/);
  assert.match(readme, /not a Cloudflare emulator/);
});
