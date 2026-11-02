import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const publicRoot = new URL("../public/", import.meta.url);
const expectedNames = ["_headers", "app.mjs", "index.html", "robots.txt", "styles.css"].sort();

function assertPublicManifest(entries) {
  assert.deepEqual(entries.map(entry => entry.name).sort(), expectedNames,
    "review every public asset; secrets, debug files and unreviewed bundles must not ship");
  for (const entry of entries) {
    assert.equal(entry.isFile(), true, `${entry.name} must be a regular file, not a directory or symlink`);
  }
}

const entry = name => ({ name, isFile: () => true });

test("public artifact contains only the five reviewed regular files", async () => {
  assertPublicManifest(await readdir(publicRoot, { withFileTypes: true }));
});

test("manifest guard fails closed for accidental files, directories and symlinks", () => {
  const valid = expectedNames.map(entry);
  assert.doesNotThrow(() => assertPublicManifest(valid));
  for (const forbidden of [".env", "receipt.json", "extra.mjs", "sample.png"]) {
    assert.throws(() => assertPublicManifest([...valid, entry(forbidden)]));
  }
  assert.throws(() => assertPublicManifest(valid.slice(1)));
  assert.throws(() => assertPublicManifest(valid.map(item => item.name === "app.mjs"
    ? { ...item, isFile: () => false } : item)));
});

test("static configuration cannot silently gain a runtime, binding or automatic route", async () => {
  const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(config).sort(), ["assets", "compatibility_date", "name"]);
  assert.deepEqual(config.assets, { directory: "./public" });
  assert.match(config.compatibility_date, /^\d{4}-\d{2}-\d{2}$/);
});
