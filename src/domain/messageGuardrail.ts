import {
  NG_EXPRESSION_RULES,
  type NgExpressionCategory,
  type NgExpressionRule,
} from "@/domain/ngExpressions";

/**
 * ユーザーに表示する占い文言が、concept-board の NG 表現を踏んでいないかを
 * 検証する純粋関数群（副作用・時刻依存・ネットワークなし: AGENTS.md 4.）。
 *
 * 想定する使い方:
 *   const report = inspectMessage(generatedText);
 *   if (!report.ok) {
 *     // 違反ルールをログに残し、再生成またはフォールバック文言へ切り替える
 *   }
 *
 * 文章生成そのものはこのモジュールの責務ではない。生成器（将来の OpenAI 連携）と
 * 表示層の間に挟む検査だけを担う。
 */

/** 検出された違反 1 件。 */
export interface GuardrailViolation {
  /** 違反したルールの ID（NG_EXPRESSION_RULES と対応）。 */
  readonly ruleId: string;
  /** ルールの分類。 */
  readonly category: NgExpressionCategory;
  /** 根拠となる concept-board の NG 表現。 */
  readonly conceptBoardPhrase: string;
  /** ルールの説明。再生成プロンプトにそのまま添えられる粒度で持つ。 */
  readonly description: string;
  /** 実際にマッチした文字列（正規化後のテキスト上の表現）。 */
  readonly matchedText: string;
  /** 正規化後テキストにおけるマッチ開始位置。原文の位置とは一致しない場合がある。 */
  readonly index: number;
}

/** 検査結果。真偽値だけでなく、どのルールに引っかかったかを返す。 */
export interface GuardrailReport {
  /** 違反が 1 件もなければ true。 */
  readonly ok: boolean;
  /** 検出された違反（ルール定義順）。 */
  readonly violations: readonly GuardrailViolation[];
}

/**
 * 表記ゆれを吸収する正規化。
 * - NFKC で全角英数字・半角カナ・全角記号を畳む（例: `１００％` → `100%`）
 * - 空白（改行・タブ・全角スペースを含む）を除去し、語の分断を防ぐ
 *
 * 正規化により文字位置が原文とずれるため、GuardrailViolation.index は
 * 正規化後テキスト上の位置である点に注意。
 */
export function normalizeMessage(text: string): string {
  return text.normalize("NFKC").replace(/\s+/gu, "");
}

function toViolation(
  rule: NgExpressionRule,
  match: RegExpExecArray,
): GuardrailViolation {
  return {
    ruleId: rule.id,
    category: rule.category,
    conceptBoardPhrase: rule.conceptBoardPhrase,
    description: rule.description,
    matchedText: match[0],
    index: match.index,
  };
}

/**
 * 文言を検査し、違反したルールの一覧を返す。
 *
 * @param text 検査対象の文言（未加工でよい。内部で正規化する）
 * @returns 違反の有無と、違反したルールの詳細
 */
export function inspectMessage(text: string): GuardrailReport {
  const normalized = normalizeMessage(text);
  const violations: GuardrailViolation[] = [];

  if (normalized.length > 0) {
    for (const rule of NG_EXPRESSION_RULES) {
      const match = rule.pattern.exec(normalized);
      if (match !== null) {
        violations.push(toViolation(rule, match));
      }
    }
  }

  return { ok: violations.length === 0, violations };
}

/**
 * 表示してよい文言かどうかだけを判定する簡易版。
 * どのルールに引っかかったかが必要なら inspectMessage を使う。
 */
export function isSafeMessage(text: string): boolean {
  return inspectMessage(text).ok;
}
