import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

assert.ok(process.env.QA_TOOLS_DIR, "pinned QA tool directory is required");
const { chromium } = createRequire(path.join(process.env.QA_TOOLS_DIR, "package.json"))("playwright");
const output = process.env.QA_OUTPUT_DIR;
assert.ok(output, "screenshot destination is required");
await mkdir(output, { recursive: true });
const root = new URL("../public/", import.meta.url);
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.mjs", ["app.mjs", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/robots.txt", ["robots.txt", "text/plain; charset=utf-8"]],
]);
// Interpret this simple static header fixture locally. This is NOT a Cloudflare emulator.
const headers = {};
for (const line of (await readFile(new URL("_headers", root), "utf8")).split("\n").slice(1)) {
  const match = line.match(/^\s+([^:]+):\s*(.+)$/);
  if (match) headers[match[1].trim()] = match[2].trim();
}
const server = createServer(async (request, response) => {
  try {
    const item = files.get(new URL(request.url, "http://127.0.0.1").pathname);
    if (!item) { response.writeHead(404, headers); response.end("Not found"); return; }
    const bytes = await readFile(new URL(item[0], root));
    response.writeHead(200, { ...headers, "Content-Type": item[1] });
    response.end(bytes);
  } catch {
    response.writeHead(500); response.end("QA fixture unavailable");
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const baseURL = `http://127.0.0.1:${server.address().port}`;
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const browser = await chromium.launch();
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: "ja-JP", reducedMotion: "reduce", serviceWorkers: "block" });
    const errors = [];
    const externalRequests = [];
    await context.route("**/*", async route => {
      if (new URL(route.request().url()).origin !== baseURL) { externalRequests.push(route.request().url()); await route.abort(); }
      else await route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.setDefaultTimeout(10_000);
    const response = await page.goto(baseURL, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert.match(await page.title(), /内省カード/);
    assert.match(response.headers()["content-security-policy"], /connect-src 'none'/);
    const capture = async state => {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: path.join(output, `${viewport.width}-${state}.png`), fullPage: true });
    };
    await capture("entry");
    for (const theme of ["self", "work", "relations"]) {
      const button = page.locator(`button[data-theme="${theme}"]`);
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator('button[aria-pressed="true"]').count(), 1);
      assert.ok((await page.locator("#sample-question").innerText()).length > 10);
      assert.match(await page.locator("#sample-action").innerText(), /今日できる一歩/);
      await capture(theme);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(externalRequests, []);
    assert.deepEqual(await context.cookies(), []);
    assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })), { local: 0, session: 0 });
    results.push({ viewport, themes: ["self", "work", "relations"], keyboard: true, errors, externalRequests, storageEntries: 0 });
    await context.close();
  }
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJS.newPage();
  await fallback.goto(baseURL);
  assert.ok(await fallback.locator("noscript").isVisible());
  await noJS.close();
  await writeFile(path.join(output, "receipt.json"), JSON.stringify({ sha, browser: await browser.version(), results, noJS: true, scope: "Loopback fixture and real Chromium; not Cloudflare deployed headers, authentication, user observation or publication approval" }, null, 2) + "\n");
  console.log(`Static browser QA passed for ${sha}`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
