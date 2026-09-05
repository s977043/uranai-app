import { describe, expect, it } from "vitest";

/**
 * 開発環境そのものの前提を守るテスト。
 * 占いロジックは日付・タイムゾーンに強く依存するため、
 * 実装より先にテスト実行環境の前提を固定しておく。
 */
describe("test environment", () => {
  it("runs in Asia/Tokyo timezone", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("Asia/Tokyo");
  });

  it("resolves the @ path alias to src/", async () => {
    const { PROJECT_TIMEZONE } = await import("@/domain/constants");
    expect(PROJECT_TIMEZONE).toBe("Asia/Tokyo");
  });
});
