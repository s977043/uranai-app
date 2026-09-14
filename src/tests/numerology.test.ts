import { describe, expect, it } from "vitest";

import {
  assertValidCalendarDate,
  calculateLifePathNumber,
  daysInMonth,
  isLeapYear,
  MASTER_NUMBERS,
} from "@/domain/numerology";

const NEUTRAL_DATE_MESSAGE =
  "日付を読み取れませんでした。年月日をもう一度ご確認ください。";

describe("calculateLifePathNumber", () => {
  it.each([
    [{ year: 1990, month: 1, day: 1 }, 3],
    [{ year: 2000, month: 12, day: 25 }, 3],
    [{ year: 1987, month: 6, day: 15 }, 1],
    [{ year: 1969, month: 12, day: 29 }, 3],
  ])("%o を1桁へ還元する", (date, expected) => {
    expect(calculateLifePathNumber(date)).toBe(expected);
  });

  it.each([
    [{ year: 2000, month: 1, day: 8 }, 11],
    [{ year: 1980, month: 9, day: 2 }, 11],
    [{ year: 1900, month: 12, day: 9 }, 22],
    [{ year: 1989, month: 12, day: 3 }, 33],
  ])("このアプリのmaster number ruleを維持する: %o", (date, expected) => {
    expect(calculateLifePathNumber(date)).toBe(expected);
  });

  it("うるう日の実在日を受け付ける", () => {
    expect(calculateLifePathNumber({ year: 2000, month: 2, day: 29 })).toBe(6);
    expect(calculateLifePathNumber({ year: 2024, month: 2, day: 29 })).toBe(3);
  });

  it.each([
    { year: 2023, month: 2, day: 29 },
    { year: 1900, month: 2, day: 29 },
    { year: 2000, month: 13, day: 1 },
    { year: 2000, month: 0, day: 1 },
    { year: 2000, month: 1, day: 0 },
    { year: 2000, month: 4, day: 31 },
    { year: 0, month: 1, day: 1 },
    { year: -5, month: 1, day: 1 },
  ])("実在しないCalendarDateを拒否する: %o", (date) => {
    expect(() => calculateLifePathNumber(date)).toThrow(RangeError);
  });

  it("unsafe integer yearを拒否し、数値精度の曖昧さを許さない", () => {
    expect(() =>
      calculateLifePathNumber({
        year: Number.MAX_SAFE_INTEGER + 1,
        month: 1,
        day: 1,
      }),
    ).toThrow(RangeError);
  });

  it("非整数・NaN・Infinityを拒否する", () => {
    for (const date of [
      { year: 2000.5, month: 1, day: 1 },
      { year: 2000, month: Number.NaN, day: 1 },
      { year: 2000, month: 1, day: Number.POSITIVE_INFINITY },
    ]) {
      expect(() => calculateLifePathNumber(date)).toThrow(RangeError);
    }
  });

  it("null / undefined / 非objectを同じ中立RangeErrorで拒否する", () => {
    for (const value of [null, undefined, "2000-01-01", 20000101]) {
      expect(() =>
        calculateLifePathNumber(
          value as unknown as { year: number; month: number; day: number },
        ),
      ).toThrow(RangeError);
    }
  });

  it("invalid inputのmessageは中立文言に固定する", () => {
    expect(() =>
      calculateLifePathNumber({ year: 2023, month: 2, day: 29 }),
    ).toThrow(NEUTRAL_DATE_MESSAGE);
  });

  it("入力を変更せず同じ入力で同じ結果を返す", () => {
    const input = { year: 1990, month: 1, day: 1 };
    expect(calculateLifePathNumber(input)).toBe(3);
    expect(calculateLifePathNumber(input)).toBe(3);
    expect(input).toEqual({ year: 1990, month: 1, day: 1 });
  });
});

describe("CalendarDate validation", () => {
  it("西暦1年を下限として受け付ける", () => {
    expect(() =>
      assertValidCalendarDate({ year: 1, month: 1, day: 1 }),
    ).not.toThrow();
  });

  it("unsafe integerをyear/month/dayで拒否する", () => {
    const unsafe = Number.MAX_SAFE_INTEGER + 1;
    expect(() =>
      assertValidCalendarDate({ year: unsafe, month: 1, day: 1 }),
    ).toThrow(RangeError);
    expect(() =>
      assertValidCalendarDate({ year: 2026, month: unsafe, day: 1 }),
    ).toThrow(RangeError);
    expect(() =>
      assertValidCalendarDate({ year: 2026, month: 1, day: unsafe }),
    ).toThrow(RangeError);
  });
});

describe("daysInMonth", () => {
  it.each([
    [2023, 2, 28],
    [2024, 2, 29],
    [2024, 4, 30],
    [2024, 1, 31],
  ])("%i-%i の日数は %i", (year, month, expected) => {
    expect(daysInMonth(year, month)).toBe(expected);
  });

  it.each([
    [2024, 0],
    [2024, 13],
    [2024, 1.5],
    [0, 2],
    [-4, 2],
    [Number.NaN, 2],
    [Number.MAX_SAFE_INTEGER + 1, 2],
  ])("invalid year/monthをRangeErrorにする: %s, %s", (year, month) => {
    expect(() => daysInMonth(year, month)).toThrow(RangeError);
  });
});

describe("isLeapYear", () => {
  it.each([
    [2024, true],
    [1996, true],
    [2023, false],
    [1900, false],
    [2000, true],
    [2100, false],
    [2400, true],
  ])("%i -> %s", (year, expected) => {
    expect(isLeapYear(year)).toBe(expected);
  });

  it.each([0, -4, 2024.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1])(
    "public APIでもinvalid yearをbooleanへ黙って変換しない: %s",
    (year) => {
      expect(() => isLeapYear(year)).toThrow(RangeError);
    },
  );
});

describe("MASTER_NUMBERS", () => {
  it("runtimeでも固定される", () => {
    expect(Object.isFrozen(MASTER_NUMBERS)).toBe(true);
    expect(() => {
      (MASTER_NUMBERS as unknown as number[]).push(12);
    }).toThrow();
    expect([...MASTER_NUMBERS]).toEqual([11, 22, 33]);
  });
});
