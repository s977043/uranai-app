import { PROJECT_TIMEZONE } from "@/domain/constants";
import type { CalendarDate } from "@/domain/numerology";

/**
 * 時刻・タイムゾーンという外部依存をドメインから隔離する適合層 (AGENTS.md 4.)。
 * 現在時刻は引数で注入できるため、テストで日付境界を freeze できる (AGENTS.md 5.)。
 */

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: PROJECT_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 時刻を読み取れないときのユーザー向け文言。断定・不安を与える表現は用いない。 */
const UNAVAILABLE_TIME_MESSAGE =
  "日付を読み取れませんでした。時間をおいてお試しください。";

/**
 * 指定時刻（既定は現在時刻）を Asia/Tokyo の暦日として返す。
 * UTC 15:00 を境に JST の日付が変わる点に注意。
 *
 * 注記: Asia/Tokyo が UTC+9 に固定されたのは 1888 年以降で、それ以前は
 * LMT(+9:18:59) のため「UTC 15:00 が境界」は成り立たない。
 * 本関数は「現在日」の取得を目的としており、実運用の入力範囲では影響しない。
 */
export const getCurrentCalendarDate = (now: Date = new Date()): CalendarDate => {
  // Invalid Date や Date 以外を渡された場合、formatToParts が内部の英語例外を投げる。
  // ユーザーに露出しうるため、事前に検証して中立文言へ統一する。
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new RangeError(UNAVAILABLE_TIME_MESSAGE);
  }

  const parts = formatter.formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    if (!part) {
      throw new RangeError(UNAVAILABLE_TIME_MESSAGE);
    }
    return Number(part.value);
  };

  return { year: pick("year"), month: pick("month"), day: pick("day") };
};
