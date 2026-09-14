/**
 * 数秘術のライフパスナンバー。
 * 副作用・時刻依存を持たない純粋関数として実装する。
 */

/** 暦上の年月日。タイムゾーンによる日付ズレを避けるため Date ではなく値で受け取る。 */
export type CalendarDate = {
  readonly year: number;
  /** 1-12 */
  readonly month: number;
  /** 1-31（月とうるう年に応じた実在日のみ） */
  readonly day: number;
};

/**
 * このアプリのライフパス計算で、途中段階でも還元せず保持する値。
 * 流派一般の真理ではなく、versioned deterministic ruleとして扱う。
 */
export const MASTER_NUMBERS = Object.freeze([11, 22, 33] as const);

/** 日付を確認できないときのユーザー向け文言。断定・不安を与える表現は用いない。 */
const INVALID_DATE_MESSAGE =
  "日付を読み取れませんでした。年月日をもう一度ご確認ください。";

/** 有効な暦年の下限。0年・負の年はこのContractでは扱わない。 */
export const MIN_CALENDAR_YEAR = 1;

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const isMasterNumber = (value: number): boolean =>
  (MASTER_NUMBERS as readonly number[]).includes(value);

const assertValidYear = (year: number): void => {
  if (!Number.isSafeInteger(year) || year < MIN_CALENDAR_YEAR) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
};

/**
 * うるう年判定（このアプリのCalendarDateで使うグレゴリオ暦ルール）。
 * public APIのため、他の日付関数と同じyear validationを適用する。
 */
export const isLeapYear = (year: number): boolean => {
  assertValidYear(year);
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/** 指定した年月の日数。 */
export const daysInMonth = (year: number, month: number): number => {
  assertValidYear(year);
  if (!Number.isSafeInteger(month) || month < 1 || month > 12) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return MONTH_LENGTHS[month - 1];
};

/** 実在する日付かを検証する。 */
export const assertValidCalendarDate = (date: CalendarDate): void => {
  if (typeof date !== "object" || date === null) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }

  const { year, month, day } = date;
  if (
    !Number.isSafeInteger(year) ||
    !Number.isSafeInteger(month) ||
    !Number.isSafeInteger(day)
  ) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }

  assertValidYear(year);
  if (month < 1 || month > 12) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
};

/** 非負のsafe integerの各桁の和。 */
const sumDigits = (value: number): number => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }

  let remaining = value;
  let total = 0;
  while (remaining > 0) {
    total += remaining % 10;
    remaining = Math.floor(remaining / 10);
  }
  return total;
};

/**
 * 生年月日のyear/month/dayに含まれる10進数字を合計し、1桁まで還元する。
 * このアプリのruleとして、途中段階で11 / 22 / 33が現れた場合はそこで停止する。
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
