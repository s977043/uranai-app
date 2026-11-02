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
  for (const mode of ["getter-denied", "event-write-denied"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ja-JP", serviceWorkers: "block" });
    try {
      const violations = [];
      const errors = [];
      await context.route("**/*", async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin || url.pathname === "/api/telemetry") {
          violations.push(url.origin + url.pathname);
          await route.abort();
        } else await route.continue();
      });
      await context.addInitScript(selectedMode => {
        window.__qaDeniedStorageOperations = 0;
        if (selectedMode === "getter-denied") {
          Object.defineProperty(window, "sessionStorage", {
            configurable: true,
            get() {
              window.__qaDeniedStorageOperations += 1;
              throw new DOMException("Synthetic storage-denied QA fixture", "SecurityError");
            },
          });
        } else {
          // Let session identity reads succeed; fail only telemetry event persistence.
          // This is a synthetic in-browser fixture, never production instrumentation.
          const storage = window.sessionStorage;
          const setItem = Storage.prototype.setItem;
          setItem.call(storage, "uranai.telemetry.session-id.v1", "session_11111111-1111-4111-8111-111111111111");
          Storage.prototype.setItem = function (key, value) {
            if (this === storage && key === "uranai.telemetry.events.v1") {
              window.__qaDeniedStorageOperations += 1;
              throw new DOMException("Synthetic event storage quota failure", "QuotaExceededError");
            }
            return setItem.call(this, key, value);
          };
        }
      }, mode);
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      page.setDefaultTimeout(10_000);
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /^今の自分/ }).click();
      await page.getByRole("status").waitFor({ state: "visible" });
      assert.match(await page.getByRole("status").innerText(), /Reading自体はそのまま利用できます/);
      await page.getByRole("button", { name: "内省カードを見る", exact: true }).click();
      await page.getByText("今日の一歩", { exact: true }).waitFor();
      await page.getByRole("button", { name: "役立った", exact: true }).click();
      assert.equal(await page.getByRole("button", { name: "役立った", exact: true }).isDisabled(), true);
      await page.waitForFunction(() => window.__qaDeniedStorageOperations >= 3);
      const deniedOperations = await page.evaluate(() => window.__qaDeniedStorageOperations);
      const prefix = mode === "getter-denied" ? "storage-denied" : "storage-write-denied";
      await page.screenshot({ path: path.join(process.env.QA_OUTPUT_DIR, `390-${prefix}.png`), fullPage: true });
      await page.getByRole("button", { name: "別のテーマで、もう一度", exact: true }).click();
      assert.equal(await page.getByRole("status").count(), 0, "reset clears non-fatal telemetry warning");
      assert.deepEqual(errors, []);
      assert.deepEqual(violations, []);
      await writeFile(path.join(process.env.QA_OUTPUT_DIR, `${prefix}-receipt.json`), JSON.stringify({ sha, browser: await browser.version(), scenario: mode, deniedOperations, readingCompleted: true, feedbackUsable: true, resetClearsWarning: true, errors, violations, scope: "Synthetic failure injection; not actual user evidence" }, null, 2) + "\n");
      console.log(`Storage failure (${mode}) reading QA passed for ${sha}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
