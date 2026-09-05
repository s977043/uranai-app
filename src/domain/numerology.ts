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

/**
 * 還元せずに保持するマスターナンバー。
 * export しているため、import 側から書き換えられないよう実行時にも凍結する
 * （`as const` は型のみの保証で、実行時の変更を防げない）。
 */
export const MASTER_NUMBERS = Object.freeze([11, 22, 33] as const);

/** 日付を確認できないときのユーザー向け文言。断定・不安を与える表現は用いない。 */
const INVALID_DATE_MESSAGE =
  "日付を読み取れませんでした。年月日をもう一度ご確認ください。";

const isMasterNumber = (value: number): boolean =>
  (MASTER_NUMBERS as readonly number[]).includes(value);

/** うるう年判定（グレゴリオ暦）。 */
export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * 有効な暦年の下限。西暦（グレゴリオ暦の紀年法）に 0 年は存在せず、
 * 負の年は「桁の合計」というライフパスの計算前提そのものが成り立たないため 1 とする。
 * 上限は UI の入力仕様が固まるまで設けない。
 */
export const MIN_CALENDAR_YEAR = 1;

/**
 * 指定した年月の日数。
 * export しているため、呼び出し順に依存せず関数単体で範囲を検証する
 * （範囲外の月で undefined を返さない）。
 */
export const daysInMonth = (year: number, month: number): number => {
  if (!Number.isInteger(year) || year < MIN_CALENDAR_YEAR) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return MONTH_LENGTHS[month - 1];
};

/**
 * 実在する日付かを検証する。実在しない場合は中立な文言の例外を投げる。
 */
export const assertValidCalendarDate = (date: CalendarDate): void => {
  // null / undefined / 非オブジェクトを分解代入より先に弾く。
  // 分解代入に到達させると TypeError + 内部文言になり、例外の型と文言が入力によってブレるため。
  if (typeof date !== "object" || date === null) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  const { year, month, day } = date;
  const allIntegers =
    Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day);
  if (!allIntegers) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (year < MIN_CALENDAR_YEAR) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (month < 1 || month > 12) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError(INVALID_DATE_MESSAGE);
  }
};

/**
 * 非負整数の各桁の和。
 * 符号や小数点が混じると桁として解釈できず NaN が伝播するため、
 * 数値演算のみで桁を取り出し、前提を満たさない入力は明示的に弾く。
 */
const sumDigits = (value: number): number => {
  if (!Number.isInteger(value) || value < 0) {
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
