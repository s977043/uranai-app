import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const root = new URL("./public/", import.meta.url);
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.mjs", ["app.mjs", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/robots.txt", ["robots.txt", "text/plain; charset=utf-8"]],
]);

// Local editing preview only, not a Cloudflare routing/header emulator.
export async function createPreviewServer() {
  const lines = (await readFile(new URL("_headers", root), "utf8")).split("\n");
  if (lines.shift().trim() !== "/*") throw new Error("Expected one global header rule");
  const headers = { "cache-control": "no-store" };
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^\s+([^:]+):\s*(.+)$/);
    if (!match) throw new Error("Unsupported header rule; review preview server");
    const name = match[1].trim().toLowerCase();
    if (Object.hasOwn(headers, name)) throw new Error(`Duplicate preview header: ${name}`);
    headers[name] = match[2].trim();
  }
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");
      const file = files.get(url.pathname);
      if (!["GET", "HEAD"].includes(request.method) || url.search || !file) {
        response.writeHead(404, headers).end("Not found");
        return;
      }
      const bytes = await readFile(new URL(file[0], root));
      response.writeHead(200, { ...headers, "content-type": file[1] });
      response.end(request.method === "HEAD" ? undefined : bytes);
    } catch {
      response.writeHead(500, headers).end("Preview unavailable");
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.LP_PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid LP_PORT");
  const server = await createPreviewServer();
  server.listen(port, "127.0.0.1", () => console.log(`LP preview: http://127.0.0.1:${port}`));
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => {
    server.closeAllConnections();
    server.close();
  });
}
