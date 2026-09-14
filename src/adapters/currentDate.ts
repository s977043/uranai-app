import { PROJECT_TIMEZONE } from "@/domain/constants";
import type { CalendarDate } from "@/domain/numerology";

/**
 * 時刻・タイムゾーンという外部依存をドメインから隔離する適合層。
 * 現在時刻は引数で注入できるため、テストで日付境界をfreezeできる。
 */
const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: PROJECT_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const UNAVAILABLE_TIME_MESSAGE =
  "日付を読み取れませんでした。時間をおいてお試しください。";

/** 指定時刻（既定は現在時刻）をAsia/Tokyoの暦日として返す。 */
export const getCurrentCalendarDate = (now: Date = new Date()): CalendarDate => {
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
