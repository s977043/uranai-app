import { describe, expect, it } from "vitest";

import { getCurrentCalendarDate } from "@/adapters/currentDate";

describe("getCurrentCalendarDate", () => {
  it.each([
    ["2024-03-09T14:59:59.999Z", { year: 2024, month: 3, day: 9 }],
    ["2024-03-09T15:00:00.000Z", { year: 2024, month: 3, day: 10 }],
    ["2024-03-09T00:00:00.000Z", { year: 2024, month: 3, day: 9 }],
    ["2024-12-31T14:59:59.999Z", { year: 2024, month: 12, day: 31 }],
    ["2024-12-31T15:00:00.000Z", { year: 2025, month: 1, day: 1 }],
    ["2024-02-28T15:00:00.000Z", { year: 2024, month: 2, day: 29 }],
    ["2024-02-29T15:00:00.000Z", { year: 2024, month: 3, day: 1 }],
  ])("%s をAsia/Tokyoの暦日に変換する", (iso, expected) => {
    expect(getCurrentCalendarDate(new Date(iso))).toEqual(expected);
  });

  it("引数省略時もCalendarDateを返す", () => {
    const date = getCurrentCalendarDate();
    expect(Number.isSafeInteger(date.year)).toBe(true);
    expect(date.month).toBeGreaterThanOrEqual(1);
    expect(date.month).toBeLessThanOrEqual(12);
    expect(date.day).toBeGreaterThanOrEqual(1);
    expect(date.day).toBeLessThanOrEqual(31);
  });

  it("Invalid Dateを中立なRangeErrorにする", () => {
    expect(() => getCurrentCalendarDate(new Date("invalid"))).toThrow(
      RangeError,
    );
    expect(() => getCurrentCalendarDate(new Date("invalid"))).toThrow(
      "日付を読み取れませんでした。時間をおいてお試しください。",
    );
  });

  it("Date以外をRangeErrorにする", () => {
    for (const invalid of [0, "2024-03-09T15:00:00Z", null, {}]) {
      expect(() =>
        getCurrentCalendarDate(invalid as unknown as Date),
      ).toThrow(RangeError);
    }
  });

  it("例外messageに内部的・不安を与える語を含めない", () => {
    try {
      getCurrentCalendarDate(new Date("invalid"));
      expect.unreachable("例外が投げられるはず");
    } catch (error) {
      const message = (error as Error).message;
      for (const ng of ["Invalid", "不正", "エラー", "失敗", "無効"]) {
        expect(message).not.toContain(ng);
      }
    }
  });
});
