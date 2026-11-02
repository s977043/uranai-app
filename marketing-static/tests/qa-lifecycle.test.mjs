import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, cp, readFile, writeFile, rm } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Exercise the real QA entrypoint with a deliberately failing browser, not a live model or CDN.
test("browser startup failure exits promptly and cannot reuse a stale PASS", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "uranai-qa-failure-"));
  try {
    const repo = path.join(temporary, "repo");
    const tools = path.join(temporary, "tools");
    const output = path.join(temporary, "evidence");
    await mkdir(path.join(repo, "marketing-static", "tests"), { recursive: true });
    await mkdir(path.join(tools, "node_modules", "playwright"), { recursive: true });
    await mkdir(output);
    await cp(fileURLToPath(new URL("../public/", import.meta.url)), path.join(repo, "marketing-static", "public"), { recursive: true });
    await cp(fileURLToPath(new URL("browser-smoke.mjs", import.meta.url)), path.join(repo, "marketing-static", "tests", "browser-smoke.mjs"));
    await writeFile(path.join(tools, "package.json"), '{"private":true}\n');
    await writeFile(path.join(tools, "node_modules", "playwright", "index.js"),
      'module.exports = { chromium: { async launch() { throw new Error("synthetic browser launch failure"); } } };\n');
    await writeFile(path.join(output, "receipt.json"), '{"status":"passed","sha":"stale"}\n');
    const git = args => execFileSync("git", ["-C", repo, ...args], {
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    git(["init", "--quiet"]);
    git(["add", "."]);
    git(["-c", "user.name=QA fixture", "-c", "user.email=qa@example.invalid", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "synthetic QA fixture"]);
    const sha = git(["rev-parse", "HEAD"]);
    const child = spawnSync(process.execPath, [path.join(repo, "marketing-static", "tests", "browser-smoke.mjs")], {
      cwd: repo,
      env: { ...process.env, QA_TOOLS_DIR: tools, QA_OUTPUT_DIR: output },
      encoding: "utf8",
      timeout: 8_000,
    });
    assert.equal(child.error, undefined, "QA must terminate rather than leave its HTTP server running");
    assert.equal(child.status, 1);
    assert.match(child.stderr, /synthetic browser launch failure/);
    const receipt = JSON.parse(await readFile(path.join(output, "receipt.json"), "utf8"));
    assert.equal(receipt.status, "failed");
    assert.equal(receipt.sha, sha);
    assert.equal(receipt.error, "synthetic browser launch failure");
    assert.equal(Object.keys(receipt.sourceHashes).length, 5);
    for (const hash of Object.values(receipt.sourceHashes)) assert.match(hash, /^[a-f0-9]{64}$/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
