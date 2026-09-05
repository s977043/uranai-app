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

/**
 * 指定時刻（既定は現在時刻）を Asia/Tokyo の暦日として返す。
 * UTC 15:00 を境に JST の日付が変わる点に注意。
 */
export const getCurrentCalendarDate = (now: Date = new Date()): CalendarDate => {
  const parts = formatter.formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    if (!part) {
      throw new Error("日付を読み取れませんでした。時間をおいてお試しください。");
    }
    return Number(part.value);
  };

  return { year: pick("year"), month: pick("month"), day: pick("day") };
};
