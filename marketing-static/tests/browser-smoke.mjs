import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { samples } from "../public/app.mjs";

assert.ok(process.env.QA_TOOLS_DIR, "pinned QA tool directory is required");
const { chromium } = createRequire(path.join(process.env.QA_TOOLS_DIR, "package.json"))("playwright");
const output = process.env.QA_OUTPUT_DIR;
assert.ok(output, "screenshot destination is required");
await mkdir(output, { recursive: true });
const receiptPath = path.join(output, "receipt.json");
await rm(receiptPath, { force: true });
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const root = new URL("../public/", import.meta.url);
const sha = execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const dirty = execFileSync("git", ["-C", repoRoot, "status", "--porcelain", "--", "marketing-static", ".github/workflows/marketing-smoke.yml"], { encoding: "utf8" }).trim();
assert.equal(dirty, "", "QA evidence must be generated from committed, unchanged source");
const sourceHashes = {};
for (const name of ["index.html", "app.mjs", "styles.css", "robots.txt", "_headers"]) {
  sourceHashes[name] = createHash("sha256").update(await readFile(new URL(name, root))).digest("hex");
}
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.mjs", ["app.mjs", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/robots.txt", ["robots.txt", "text/plain; charset=utf-8"]],
]);
// This fixture intentionally supports one global block only; it is NOT a Cloudflare emulator.
const lines = (await readFile(new URL("_headers", root), "utf8")).split("\n");
assert.equal(lines[0].trim(), "/*", "unsupported header fixture: expected one global rule");
const headers = {};
for (const line of lines.slice(1)) {
  if (!line.trim()) continue;
  const match = line.match(/^\s+([^:]+):\s*(.+)$/);
  assert.ok(match, "unsupported header fixture: review new routes explicitly");
  const name = match[1].trim().toLowerCase();
  assert.equal(Object.hasOwn(headers, name), false, `duplicate header ${name}`);
  headers[name] = match[2].trim();
}
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const item = files.get(url.pathname);
    if (request.method !== "GET" || url.search || !item) {
      response.writeHead(404, headers); response.end("Not found"); return;
    }
    const bytes = await readFile(new URL(item[0], root));
    response.writeHead(200, { ...headers, "content-type": item[1] });
    response.end(bytes);
  } catch {
    response.writeHead(500); response.end("QA fixture unavailable");
  }
});
let browser;
const results = [];
const scope = "Loopback fixture and real Chromium; not Cloudflare deployed headers, authentication, user observation or publication approval";
try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const baseURL = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  const enforceRequestBoundary = async (context, unexpectedRequests) => {
    await context.route("**/*", async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== baseURL || !files.has(url.pathname) || url.search || request.method() !== "GET") {
        unexpectedRequests.push({ method: request.method(), url: url.href });
        await route.abort();
      } else await route.continue();
    });
  };
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: "ja-JP", reducedMotion: "reduce", serviceWorkers: "block" });
    const errors = [];
    const unexpectedRequests = [];
    await enforceRequestBoundary(context, unexpectedRequests);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.setDefaultTimeout(10_000);
    const response = await page.goto(baseURL, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert.match(await page.title(), /内省カード/);
    assert.match(response.headers()["content-security-policy"], /connect-src 'none'/);
    assert.match(response.headers()["x-robots-tag"], /noindex/);
    assert.equal(await page.locator('button[data-theme]').count(), 3);
    assert.equal(await page.locator('button[aria-pressed="true"]').count(), 0);
    const capture = async state => {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: path.join(output, `${viewport.width}-${state}.png`), fullPage: true });
    };
    await capture("entry");
    const links = await page.locator("a[href]").evaluateAll(nodes => nodes.map(node => node.getAttribute("href")));
    assert.ok(links.length > 0);
    for (const href of links) {
      assert.match(href, /^#[A-Za-z][\w-]*$/, "LP navigation must stay within this page");
      assert.equal(await page.locator(href).count(), 1, `Missing link destination ${href}`);
    }
    for (const link of await page.locator("a[href]").all()) {
      await link.click();
      assert.equal(new URL(page.url()).hash, await link.getAttribute("href"));
    }
    for (const [theme, expected] of Object.entries(samples)) {
      const button = page.locator(`button[data-theme="${theme}"]`);
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator('button[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator("#sample-label").innerText(), expected.label);
      assert.equal(await page.locator("#sample-question").innerText(), expected.question);
      assert.equal(await page.locator("#sample-action").innerText(), expected.action);
      await capture(theme);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpectedRequests, []);
    assert.deepEqual(await context.cookies(), []);
    assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })), { local: 0, session: 0 });
    results.push({ viewport, themes: Object.keys(samples), links, exactText: true, keyboard: true, errors, unexpectedRequests, storageEntries: 0 });
    await context.close();
  }
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, locale: "ja-JP", serviceWorkers: "block" });
  const noJSUnexpectedRequests = [];
  const noJSErrors = [];
  await enforceRequestBoundary(noJS, noJSUnexpectedRequests);
  const fallback = await noJS.newPage();
  fallback.on("pageerror", error => noJSErrors.push(error.message));
  fallback.on("console", message => { if (message.type() === "error") noJSErrors.push(message.text()); });
  const fallbackResponse = await fallback.goto(baseURL, { waitUntil: "networkidle" });
  assert.equal(fallbackResponse.status(), 200);
  assert.match(await fallback.title(), /内省カード/);
  assert.ok(await fallback.locator("noscript").isVisible());
  assert.equal(await fallback.locator('button[aria-pressed="true"]').count(), 0);
  assert.deepEqual(await noJS.cookies(), []);
  await fallback.screenshot({ path: path.join(output, "390-no-js.png"), fullPage: true });
  assert.deepEqual(noJSUnexpectedRequests, []);
  assert.deepEqual(noJSErrors, []);
  await noJS.close();
  await writeFile(receiptPath, JSON.stringify({ status: "passed", sha, sourceHashes, browser: await browser.version(), results, noJS: true, noJSPrivacy: { errors: noJSErrors, unexpectedRequests: noJSUnexpectedRequests, cookies: 0 }, scope }, null, 2) + "\n");
  console.log(`Static browser QA passed for ${sha}`);
} catch (error) {
  await writeFile(receiptPath, JSON.stringify({ status: "failed", sha, sourceHashes, results, error: error.message, scope }, null, 2) + "\n");
  throw error;
} finally {
  try {
    if (browser) await browser.close();
  } finally {
    if (server.listening) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  }
}
