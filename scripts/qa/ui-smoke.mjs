import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const toolsDir = process.env.QA_TOOLS_DIR;
assert.ok(toolsDir, "QA_TOOLS_DIR must point at the isolated, pinned Playwright install");
const requireTool = createRequire(path.join(toolsDir, "package.json"));
const { chromium } = requireTool("playwright");
const baseURL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const target = new URL(baseURL);
assert.ok(["127.0.0.1", "localhost"].includes(target.hostname), "QA must stay on loopback; no production navigation");
const output = process.env.QA_OUTPUT_DIR ?? path.join(process.cwd(), "qa-evidence");
await mkdir(output, { recursive: true });
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const browser = await chromium.launch();
const receipts = [];

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: "ja-JP", reducedMotion: "reduce", serviceWorkers: "block" });
    const errors = [];
    const unexpectedRequests = [];
    const telemetryRequests = [];
    // Block, not merely observe, unintended requests. Only synthetic input is used.
    await context.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (url.origin !== target.origin) {
        unexpectedRequests.push(url.origin);
        await route.abort();
      } else if (url.pathname === "/api/telemetry") {
        telemetryRequests.push(route.request().method());
        await route.abort();
      } else {
        await route.continue();
      }
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.setDefaultTimeout(10_000);
    const response = await page.goto(baseURL, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200);
    assert.equal(new URL(page.url()).origin, target.origin);
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    assert.ok((await page.locator("main").innerText()).includes("6種類の内省カード"));
    assert.ok((await page.locator("main").innerText()).includes("未来を予測する鑑定ではありません"));

    const label = `${viewport.width}x${viewport.height}`;
    const capture = async state => {
      const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      assert.ok(noOverflow, `${label}/${state}: horizontal overflow`);
      await page.screenshot({ path: path.join(output, `${label}-${state}.png`), fullPage: true });
    };
    await capture("entry");
    const firstTheme = page.getByRole("button", { name: /^今の自分/ });
    await page.keyboard.press("Tab");
    assert.equal(await firstTheme.evaluate(node => node === document.activeElement), true, "first action reachable by keyboard");
    await page.keyboard.press("Enter");
    assert.ok((await page.locator("main").innerText()).includes("タロットカードの抽選ではなく"));
    await capture("before-card");
    await page.getByRole("button", { name: "内省カードを見る", exact: true }).click();
    await page.getByText("今日の一歩", { exact: true }).waitFor({ state: "visible" });
    await capture("result");
    await page.getByRole("button", { name: "役立った", exact: true }).click();
    await page.getByText("ありがとう。現在、この回答はこの端末から外部へ送信されません。", { exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "役立った", exact: true }).isDisabled(), true);
    await capture("feedback");
    await page.getByRole("button", { name: "別のテーマで、もう一度", exact: true }).click();
    for (const theme of [/^仕事/, /^人間関係/]) {
      await page.getByRole("button", { name: theme }).click();
      await page.getByRole("button", { name: "内省カードを見る", exact: true }).click();
      await page.getByText("今日の一歩", { exact: true }).waitFor({ state: "visible" });
      await page.getByRole("button", { name: "別のテーマで、もう一度", exact: true }).click();
    }
    assert.deepEqual(errors, [], `${label}: browser errors`);
    assert.deepEqual(unexpectedRequests, [], `${label}: external network request`);
    assert.deepEqual(telemetryRequests, [], `${label}: central telemetry must remain disconnected`);
    assert.deepEqual(await context.cookies(), [], "no tracking cookie");
    assert.equal(await page.evaluate(() => localStorage.length), 0, "no cross-session persistence");
    receipts.push({ viewport, states: ["entry", "keyboard-start", "before-card", "result", "feedback", "reset", "work", "relationship"], errors, externalRequests: unexpectedRequests.length, centralTelemetryRequests: telemetryRequests.length });
    await context.close();
  }
  await writeFile(path.join(output, "receipt.json"), JSON.stringify({ sha, browser: await browser.version(), baseURL, checks: receipts, scope: "Synthetic browser QA only; not user research, cloud deployment, CSP certification or production approval" }, null, 2) + "\n");
  console.log(`UI smoke passed for ${sha}: ${receipts.length} viewports`);
} finally {
  await browser.close();
}
