import { describe, expect, it } from "vitest";

import {
  calculateLifePathNumber,
  daysInMonth,
  isLeapYear,
  MASTER_NUMBERS,
} from "@/domain/numerology";

/**
 * ライフパスナンバーのドメインテスト。
 * 期待値はすべて手計算した digital root。実装には依存しない。
 */
describe("calculateLifePathNumber", () => {
  describe("1桁に還元されるケース", () => {
    it("1990-01-01 は 3 (1+9+9+0+0+1+0+1=21 -> 2+1=3)", () => {
      expect(calculateLifePathNumber({ year: 1990, month: 1, day: 1 })).toBe(3);
    });

    it("2000-12-25 は 3 (2+0+0+0+1+2+2+5=12 -> 1+2=3)", () => {
      expect(calculateLifePathNumber({ year: 2000, month: 12, day: 25 })).toBe(
        3,
      );
    });

    it("1987-06-15 は 1 (37 -> 10 -> 1) と多段還元される", () => {
      expect(calculateLifePathNumber({ year: 1987, month: 6, day: 15 })).toBe(1);
    });

    it("1969-12-29 は 3 (39 -> 12 -> 3)", () => {
      expect(calculateLifePathNumber({ year: 1969, month: 12, day: 29 })).toBe(
        3,
      );
    });
  });

  describe("マスターナンバーは還元しない", () => {
    it("2000-01-08 は 11 (2+0+0+0+0+1+0+8=11)", () => {
      expect(calculateLifePathNumber({ year: 2000, month: 1, day: 8 })).toBe(11);
    });

    it("1980-09-02 は 11 (29 -> 2+9=11 で停止する)", () => {
      expect(calculateLifePathNumber({ year: 1980, month: 9, day: 2 })).toBe(11);
    });

    it("1900-12-09 は 22 (1+9+0+0+1+2+0+9=22)", () => {
      expect(calculateLifePathNumber({ year: 1900, month: 12, day: 9 })).toBe(
        22,
      );
    });

    it("1989-12-03 は 33 (1+9+8+9+1+2+0+3=33)", () => {
      expect(calculateLifePathNumber({ year: 1989, month: 12, day: 3 })).toBe(
        33,
      );
    });
  });

  describe("うるう年", () => {
    it("2000-02-29 は有効で 6 (2+0+0+0+0+2+2+9=15 -> 1+5=6)", () => {
      expect(calculateLifePathNumber({ year: 2000, month: 2, day: 29 })).toBe(6);
    });

    it("2024-02-29 は有効で 3 (2+0+2+4+0+2+2+9=21 -> 2+1=3)", () => {
      expect(calculateLifePathNumber({ year: 2024, month: 2, day: 29 })).toBe(3);
    });

    it("平年 2023-02-29 は受け付けない", () => {
      expect(() =>
        calculateLifePathNumber({ year: 2023, month: 2, day: 29 }),
      ).toThrow();
    });

    it("100年例外 1900-02-29 は受け付けない", () => {
      expect(() =>
        calculateLifePathNumber({ year: 1900, month: 2, day: 29 }),
      ).toThrow();
    });
  });

  describe("範囲外の入力", () => {
    it("月が 13 は受け付けない", () => {
      expect(() =>
        calculateLifePathNumber({ year: 2000, month: 13, day: 1 }),
      ).toThrow();
    });

    it("月が 0 は受け付けない", () => {
      expect(() =>
        calculateLifePathNumber({ year: 2000, month: 0, day: 1 }),
      ).toThrow();
    });

    it("日が 0 は受け付けない", () => {
      expect(() =>
        calculateLifePathNumber({ year: 2000, month: 1, day: 0 }),
      ).toThrow();
    });

    it("4月31日は受け付けない", () => {
      expect(() =>
        calculateLifePathNumber({ year: 2000, month: 4, day: 31 }),
      ).toThrow();
    });

    it("整数でない値は受け付けない", () => {
      expect(() =>
        calculateLifePathNumber({ year: 2000, month: 1.5, day: 1 }),
      ).toThrow();
    });

    it("負の年 (-5) は受け付けず、NaN を返さない", () => {
      expect(() =>
        calculateLifePathNumber({ year: -5, month: 1, day: 1 }),
      ).toThrow(RangeError);
    });

    it("負の年 (-1990) は受け付けず、NaN を返さない", () => {
      expect(() =>
        calculateLifePathNumber({ year: -1990, month: 6, day: 15 }),
      ).toThrow(RangeError);
    });

    it("西暦 0 年は受け付けない (西暦に 0 年は存在しない)", () => {
      expect(() =>
        calculateLifePathNumber({ year: 0, month: 1, day: 1 }),
      ).toThrow(RangeError);
    });

    it("負の年のメッセージも既存の中立文言と同じ", () => {
      expect(() =>
        calculateLifePathNumber({ year: -1990, month: 6, day: 15 }),
      ).toThrow("日付を読み取れませんでした。年月日をもう一度ご確認ください。");
    });

    it("西暦 1 年は下限として受け付ける (1+1+1=3)", () => {
      expect(calculateLifePathNumber({ year: 1, month: 1, day: 1 })).toBe(3);
    });

    it("null は TypeError ではなく中立文言の RangeError になる", () => {
      expect(() =>
        calculateLifePathNumber(null as unknown as { year: number; month: number; day: number }),
      ).toThrow(RangeError);
      expect(() =>
        calculateLifePathNumber(null as unknown as { year: number; month: number; day: number }),
      ).toThrow("日付を読み取れませんでした。年月日をもう一度ご確認ください。");
    });

    it("undefined は TypeError ではなく中立文言の RangeError になる", () => {
      expect(() =>
        calculateLifePathNumber(undefined as unknown as { year: number; month: number; day: number }),
      ).toThrow(RangeError);
    });

    it("オブジェクトでない値 (文字列・数値) も RangeError になる", () => {
      for (const invalid of ["2000-01-01", 20000101]) {
        expect(() =>
          calculateLifePathNumber(invalid as unknown as { year: number; month: number; day: number }),
        ).toThrow(RangeError);
      }
    });

    it("エラーメッセージは断定的・不安を与える表現を含まない", () => {
      try {
        calculateLifePathNumber({ year: 2023, month: 2, day: 29 });
        expect.unreachable("例外が投げられるはず");
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("日付");
        for (const ng of ["不正", "不幸", "エラー", "失敗", "無効"]) {
          expect(message).not.toContain(ng);
        }
      }
    });
  });

  it("副作用がなく、同じ入力で常に同じ結果を返す", () => {
    const input = { year: 1990, month: 1, day: 1 };
    const first = calculateLifePathNumber(input);
    const second = calculateLifePathNumber(input);
    expect(second).toBe(first);
    expect(input).toEqual({ year: 1990, month: 1, day: 1 });
  });
});

describe("daysInMonth", () => {
  it("平年の 2 月は 28 日", () => {
    expect(daysInMonth(2023, 2)).toBe(28);
  });

  it("うるう年の 2 月は 29 日", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it("4 月は 30 日", () => {
    expect(daysInMonth(2024, 4)).toBe(30);
  });

  it("範囲外の月 (13) は undefined を返さず例外を投げる", () => {
    expect(() => daysInMonth(2024, 13)).toThrow(RangeError);
  });

  it("範囲外の月 (0) は undefined を返さず例外を投げる", () => {
    expect(() => daysInMonth(2024, 0)).toThrow(RangeError);
  });

  it("整数でない月は例外を投げる", () => {
    expect(() => daysInMonth(2024, 1.5)).toThrow(RangeError);
  });

  it("負の年は値を返さず例外を投げる", () => {
    expect(() => daysInMonth(-4, 2)).toThrow(RangeError);
  });

  it("NaN の年は値を返さず例外を投げる", () => {
    expect(() => daysInMonth(Number.NaN, 2)).toThrow(RangeError);
  });

  it("整数でない年は値を返さず例外を投げる", () => {
    expect(() => daysInMonth(2024.5, 2)).toThrow(RangeError);
  });

  it("西暦 0 年は値を返さず例外を投げる", () => {
    expect(() => daysInMonth(0, 2)).toThrow(RangeError);
  });
});

describe("isLeapYear", () => {
  it("4 で割り切れる年はうるう年", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1996)).toBe(true);
  });

  it("4 で割り切れない年は平年", () => {
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1999)).toBe(false);
  });

  it("100 で割り切れる年は平年 (100年例外)", () => {
    expect(isLeapYear(1700)).toBe(false);
    expect(isLeapYear(1800)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });

  it("400 で割り切れる年はうるう年 (400年例外)", () => {
    expect(isLeapYear(1600)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });
});

describe("MASTER_NUMBERS", () => {
  it("実行時に凍結されており、外部から書き換えられない", () => {
    expect(Object.isFrozen(MASTER_NUMBERS)).toBe(true);
    expect(() => {
      (MASTER_NUMBERS as unknown as number[]).push(12);
    }).toThrow();
    expect([...MASTER_NUMBERS]).toEqual([11, 22, 33]);
  });

  it("凍結後もマスターナンバー判定は既存どおり (1969-12-29 は 3)", () => {
    expect(calculateLifePathNumber({ year: 1969, month: 12, day: 29 })).toBe(3);
  });
});
