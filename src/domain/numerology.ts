/**
 * 数秘術のライフパスナンバー。
 * 副作用・時刻依存を持たない純粋関数として実装する (AGENTS.md 4.)。
 */

/** 暦上の年月日。タイムゾーンによる日付ズレを避けるため Date ではなく値で受け取る。 */
export type CalendarDate = {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31（月とうるう年に応じた実在日のみ） */
  day: number;
};

/** 還元せずに保持するマスターナンバー。 */
export const MASTER_NUMBERS = [11, 22, 33] as const;

/** 日付を確認できないときのユーザー向け文言。断定・不安を与える表現は用いない。 */
const INVALID_DATE_MESSAGE =
  "日付を読み取れませんでした。年月日をもう一度ご確認ください。";

const isMasterNumber = (value: number): boolean =>
  (MASTER_NUMBERS as readonly number[]).includes(value);

/** うるう年判定（グレゴリオ暦）。 */
export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** 指定した年月の日数。 */
export const daysInMonth = (year: number, month: number): number => {
  const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return lengths[month - 1];
};

/**
 * 実在する日付かを検証する。実在しない場合は中立な文言の例外を投げる。
 */
export const assertValidCalendarDate = (date: CalendarDate): void => {
  const { year, month, day } = date;
  const allIntegers =
    Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day);
  if (!allIntegers) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (month < 1 || month > 12) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
};

/** 数値の各桁の和。 */
const sumDigits = (value: number): number =>
  String(value)
    .split("")
    .reduce((total, digit) => total + Number(digit), 0);

/**
 * 生年月日の全数字を合計し、1桁になるまで digital root を取る。
 * ただし途中段階で 11 / 22 / 33 が現れた場合はそこで停止し、還元しない。
 */
export const calculateLifePathNumber = (date: CalendarDate): number => {
  assertValidCalendarDate(date);

  let current =
    sumDigits(date.year) + sumDigits(date.month) + sumDigits(date.day);

  while (current > 9 && !isMasterNumber(current)) {
    current = sumDigits(current);
  }

  return current;
};
