import { describe, expect, it } from "vitest";

import { calculateLifePathNumber } from "@/domain/numerology";

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
