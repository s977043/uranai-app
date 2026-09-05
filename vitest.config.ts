import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // 占いロジックは日付依存のため、テストは常に Asia/Tokyo で実行する
    // (AGENTS.md 5. AI-TDD ルール)
    env: { TZ: "Asia/Tokyo" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
