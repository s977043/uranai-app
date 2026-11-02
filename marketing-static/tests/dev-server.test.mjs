import test from "node:test";
import assert from "node:assert/strict";
import { createPreviewServer } from "../dev-server.mjs";

test("LP preview serves editable assets and excludes repository/private paths", async () => {
  const server = await createPreviewServer();
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const [route, type] of [["/", "text/html"], ["/styles.css", "text/css"], ["/app.mjs", "text/javascript"], ["/robots.txt", "text/plain"]]) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      assert.ok(response.headers.get("content-type").startsWith(type));
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.match(response.headers.get("content-security-policy"), /connect-src 'none'/);
      assert.match(response.headers.get("x-robots-tag"), /noindex/);
      assert.ok((await response.text()).length > 0);
    }
    for (const route of ["/.env.local", "/.git/config", "/%2e%2e/package.json", "/package.json", "/missing", "/?query=1"]) {
      assert.equal((await fetch(base + route)).status, 404);
    }
    assert.equal((await fetch(base, { method: "POST" })).status, 404);
    const head = await fetch(base, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
