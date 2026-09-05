import { describe, expect, it } from "vitest";

import { getCurrentCalendarDate } from "@/adapters/currentDate";

/**
 * Asia/Tokyo (UTC+9) の日付境界テスト。
 * 現在時刻は引数で注入し、時刻依存を freeze する (AGENTS.md 5.)。
 */
describe("getCurrentCalendarDate", () => {
  it("UTC 14:59 は JST では同日 23:59 なので日付は進まない", () => {
    expect(
      getCurrentCalendarDate(new Date("2024-03-09T14:59:59.999Z")),
    ).toEqual({ year: 2024, month: 3, day: 9 });
  });

  it("UTC 15:00 は JST では翌日 00:00 なので日付が進む", () => {
    expect(getCurrentCalendarDate(new Date("2024-03-09T15:00:00.000Z"))).toEqual(
      { year: 2024, month: 3, day: 10 },
    );
  });

  it("UTC 00:00 は JST では同日 09:00", () => {
    expect(getCurrentCalendarDate(new Date("2024-03-09T00:00:00.000Z"))).toEqual(
      { year: 2024, month: 3, day: 9 },
    );
  });

  it("年をまたぐ境界: UTC 2024-12-31T15:00Z は JST 2025-01-01", () => {
    expect(getCurrentCalendarDate(new Date("2024-12-31T15:00:00.000Z"))).toEqual(
      { year: 2025, month: 1, day: 1 },
    );
  });

  it("年をまたぐ境界の直前: UTC 2024-12-31T14:59Z は JST 2024-12-31", () => {
    expect(getCurrentCalendarDate(new Date("2024-12-31T14:59:59.999Z"))).toEqual(
      { year: 2024, month: 12, day: 31 },
    );
  });

  it("うるう日の境界: UTC 2024-02-28T15:00Z は JST 2024-02-29", () => {
    expect(getCurrentCalendarDate(new Date("2024-02-28T15:00:00.000Z"))).toEqual(
      { year: 2024, month: 2, day: 29 },
    );
  });

  it("うるう日の翌境界: UTC 2024-02-29T15:00Z は JST 2024-03-01", () => {
    expect(getCurrentCalendarDate(new Date("2024-02-29T15:00:00.000Z"))).toEqual(
      { year: 2024, month: 3, day: 1 },
    );
  });

  it("返り値はドメインの妥当な CalendarDate である", () => {
    const date = getCurrentCalendarDate(new Date("2024-03-09T15:00:00.000Z"));
    expect(Number.isInteger(date.month)).toBe(true);
    expect(date.month).toBeGreaterThanOrEqual(1);
    expect(date.month).toBeLessThanOrEqual(12);
  });

  it("引数を省略しても妥当な日付を返す", () => {
    const date = getCurrentCalendarDate();
    expect(Number.isInteger(date.year)).toBe(true);
    expect(date.month).toBeGreaterThanOrEqual(1);
    expect(date.day).toBeGreaterThanOrEqual(1);
  });
});

describe("getCurrentCalendarDate の異常系", () => {
  const NEUTRAL_MESSAGE =
    "日付を読み取れませんでした。時間をおいてお試しください。";

  it("Invalid Date は内部の英語エラーではなく中立文言の RangeError になる", () => {
    expect(() => getCurrentCalendarDate(new Date("invalid"))).toThrow(
      RangeError,
    );
    expect(() => getCurrentCalendarDate(new Date("invalid"))).toThrow(
      NEUTRAL_MESSAGE,
    );
  });

  it("NaN 時刻の Date も中立文言の RangeError になる", () => {
    expect(() => getCurrentCalendarDate(new Date(Number.NaN))).toThrow(
      NEUTRAL_MESSAGE,
    );
  });

  // undefined は「引数省略 = 現在時刻」の既定引数に落ちるため、ここでは対象外。
  it("Date でない値 (数値・文字列・null) も中立文言の RangeError になる", () => {
    for (const invalid of [0, "2024-03-09T15:00:00Z", null, {}]) {
      expect(() => getCurrentCalendarDate(invalid as unknown as Date)).toThrow(
        RangeError,
      );
    }
  });

  it("例外メッセージに不安を与える表現を含まない", () => {
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
