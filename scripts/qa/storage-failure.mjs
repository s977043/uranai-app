import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

assert.ok(process.env.QA_TOOLS_DIR && process.env.QA_OUTPUT_DIR);
const { chromium } = createRequire(path.join(process.env.QA_TOOLS_DIR, "package.json"))("playwright");
const baseURL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const origin = new URL(baseURL).origin;
assert.ok(["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname));
await mkdir(process.env.QA_OUTPUT_DIR, { recursive: true });
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ja-JP", serviceWorkers: "block" });
  const violations = [];
  const errors = [];
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin || url.pathname === "/api/telemetry") {
      violations.push(url.origin + url.pathname);
      await route.abort();
    } else await route.continue();
  });
  await context.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() { throw new DOMException("Synthetic storage-denied QA fixture", "SecurityError"); },
    });
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.setDefaultTimeout(10_000);
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^今の自分/ }).click();
  await page.getByRole("status").waitFor({ state: "visible" });
  assert.match(await page.getByRole("status").innerText(), /Reading自体はそのまま利用できます/);
  await page.getByRole("button", { name: "内省カードを見る", exact: true }).click();
  await page.getByText("今日の一歩", { exact: true }).waitFor();
  await page.getByRole("button", { name: "役立った", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "役立った", exact: true }).isDisabled(), true);
  await page.screenshot({ path: path.join(process.env.QA_OUTPUT_DIR, "390-storage-denied.png"), fullPage: true });
  await page.getByRole("button", { name: "別のテーマで、もう一度", exact: true }).click();
  assert.equal(await page.getByRole("status").count(), 0, "reset clears non-fatal telemetry warning");
  assert.deepEqual(errors, []);
  assert.deepEqual(violations, []);
  await writeFile(path.join(process.env.QA_OUTPUT_DIR, "storage-denied-receipt.json"), JSON.stringify({ sha, browser: await browser.version(), scenario: "sessionStorage getter throws SecurityError", readingCompleted: true, feedbackUsable: true, resetClearsWarning: true, errors, violations, scope: "Synthetic failure injection; not actual user evidence" }, null, 2) + "\n");
  console.log("Storage-denied reading QA passed for " + sha);
} finally {
  await browser.close();
}
