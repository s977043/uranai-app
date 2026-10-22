import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getSample, renderSample, samples } from "../public/app.mjs";

const read = async (relative) => readFile(new URL(relative, import.meta.url), "utf8");

test("samples are fixed editorial examples with a strict theme allowlist", () => {
  assert.deepEqual(Object.keys(samples).sort(), ["relations", "self", "work"]);
  for (const [id, sample] of Object.entries(samples)) {
    assert.equal(getSample(id), sample);
    assert.equal(Object.isFrozen(sample), true);
    assert.ok(sample.label.length > 0 && sample.question.length > 10 && sample.action.length > 10);
  }
  for (const unsafe of ["unknown", "__proto__", "constructor", "<img src=x>"]) {
    assert.equal(getSample(unsafe), null);
  }
  assert.equal(Object.isFrozen(samples), true);
});

test("rendering only writes textContent, and invalid selection changes nothing", () => {
  const nodes = { label: { textContent: "" }, question: { textContent: "" }, action: { textContent: "" } };
  assert.equal(renderSample("self", nodes), true);
  assert.equal(nodes.label.textContent, samples.self.label);
  assert.equal(nodes.question.textContent, samples.self.question);
  assert.equal(nodes.action.textContent, samples.self.action);
  const snapshot = structuredClone(nodes);
  assert.equal(renderSample("<script>", nodes), false);
  assert.deepEqual(nodes, snapshot);
});

test("static UI is non-submitting, Japanese, accessible and clearly marked a sample", async () => {
  const html = await read("../public/index.html");
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-atomic="true"/);
  assert.match(html, /個別鑑定、カードの抽選、未来予測は行いません/);
  assert.match(html, /選択内容は送信・保存されません/);
  assert.equal((html.match(/type="button" data-theme=/g) || []).length, 3);
  assert.doesNotMatch(html, /<(form|input|textarea|iframe)\b/i);
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//i);
  assert.doesNotMatch(html, /\b(¥1,980|購入|お申し込み|送料無料)\b/);
  for (const name of Object.keys(samples)) assert.ok(html.includes('data-theme="' + name + '"'));
});

test("no model, telemetry, persistence, storage or network calls exist in site code", async () => {
  const js = await read("../public/app.mjs");
  const html = await read("../public/index.html");
  assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage)\b/);
  assert.doesNotMatch(js, /document\.cookie|navigator\.serviceWorker|innerHTML/);
  assert.doesNotMatch(html, /<link[^>]+href="https?:\/\//);
  assert.doesNotMatch(html + js, /OPENAI_API_KEY|DATABASE_URL|TELEMETRY_INGESTION_ENABLED/);
});

test("Wrangler config is asset-only, with no API Worker binding", async () => {
  const config = JSON.parse(await read("../wrangler.jsonc"));
  assert.equal(config.name, "uranai-static-pilot");
  assert.equal(config.assets.directory, "./public");
  assert.equal(typeof config.compatibility_date, "string");
  assert.equal("main" in config, false);
  assert.equal("vars" in config, false);
  assert.equal("d1_databases" in config, false);
  assert.equal("r2_buckets" in config, false);
  assert.equal("routes" in config, false);
});

test("deploy remains noindexed with restrictive security headers", async () => {
  const headers = await read("../public/_headers");
  const robots = await read("../public/robots.txt");
  const css = await read("../public/styles.css");
  assert.match(headers, /X-Robots-Tag: noindex, nofollow/);
  assert.match(headers, /Content-Security-Policy:.*connect-src 'none'.*form-action 'none'/);
  assert.match(headers, /Referrer-Policy: no-referrer/);
  assert.match(robots, /Disallow: \/\s*$/m);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
