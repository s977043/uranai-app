import { describe, expect, it } from "vitest";

import { NG_EXPRESSION_RULES } from "@/domain/ngExpressions";
import { inspectMessage, isSafeMessage } from "@/domain/messageGuardrail";

/**
 * docs/concept-board.md 「ブランド人格 > NG表現」を機械的に検証するテスト。
 * 将来 OpenAI で本文を生成する際、生成物をこのガードレールに通してから表示する。
 */
describe("inspectMessage: concept-board の NG 表現を検出する", () => {
  it.each([
    ["assertion", "絶対にこの恋は叶います。"],
    ["assertion", "来月には必ず成功します。"],
    ["assertion", "この流れは変わらないに決まっています。"],
    ["fatalism", "この人はあなたの運命の相手です。"],
    ["fatalism", "逃れられない宿命なので受け入れましょう。"],
    ["breakup-directive", "いますぐ別れるべきです。"],
    ["breakup-directive", "その人とは縁を切るべきです。"],
    ["misfortune", "このままだとあなたは不幸になります。"],
    ["misfortune", "来週、災いが訪れます。"],
    ["medical-advice", "その症状は占いで治りますので通院は不要です。"],
    ["legal-advice", "その契約は違法ではないので裁判に勝てます。"],
    ["investment-advice", "この株は必ず値上がりしますので買うべきです。"],
  ])("%s カテゴリの文言を検出する: %s", (category, text) => {
    const report = inspectMessage(text);
    expect(report.ok).toBe(false);
    expect(report.violations.map((violation) => violation.category)).toContain(
      category,
    );
  });

  it("どのルールに違反したかを呼び出し側へ返す", () => {
    const report = inspectMessage("いますぐ別れるべきです。");
    expect(report.violations).toHaveLength(1);

    const [violation] = report.violations;
    expect(violation.ruleId).toBe("breakup-directive");
    expect(violation.category).toBe("breakup-directive");
    expect(violation.matchedText).toContain("別れるべき");
    expect(violation.index).toBeGreaterThanOrEqual(0);
    expect(violation.conceptBoardPhrase).toBe("いますぐ別れるべき");
  });

  it("複数の NG 表現を含む文言はすべて報告する", () => {
    const report = inspectMessage(
      "この人は運命の相手です。いますぐ別れるべきです。",
    );
    const ruleIds = report.violations.map((violation) => violation.ruleId);
    expect(ruleIds).toContain("fatalism-destined-partner");
    expect(ruleIds).toContain("breakup-directive");
  });
});

describe("inspectMessage: 表記ゆれ", () => {
  it.each([
    "ぜったいに叶います。",
    "かならず成功します。",
    "１００％うまくいきます。",
    "別れた方がいいです。",
    "別れたほうがいいと出ています。",
    "わかれるべきだと出ています。",
    "この人が運命のひとです。",
  ])("表記ゆれ %s を検出する", (text) => {
    expect(isSafeMessage(text)).toBe(false);
  });
});

describe("inspectMessage: 正常な占い文言を誤検出しない", () => {
  it.each([
    // concept-board「話し方」: 否定しない / 先に安心感 / 結論を短く / 最後は行動
    "今日のあなたは、少し立ち止まる日。焦らなくて大丈夫です。夜に5分だけ、気持ちを書き出してみましょう。",
    "その迷いは、あなたが相手を大切に思っている証かもしれません。返信は明日の朝に回してみませんか。",
    "距離を置くか続けるかは、あなたが決めていいことです。まずは今夜、ゆっくり眠ることを選んでみてください。",
    "絶対に大丈夫、と言い切ることはできませんが、いまの選択は間違っていません。",
    "運命の相手かどうかは、これから二人で決めていくものかもしれません。",
    "別れを考える夜もあります。答えを急がず、自分の気持ちに名前をつけてみましょう。",
    "体調が気になるときは、占いよりも医師に相談してみてください。",
    "お金の判断に迷うなら、信頼できる専門家に確認してから決めるのが安心です。",
    "不安が大きい夜ほど、考えはループしがちです。窓を開けて、深呼吸を一つ。",
    "この星回りは、あなたの努力が実を結びやすい時期を示しています。",
  ])("誤検出しない: %s", (text) => {
    const report = inspectMessage(text);
    expect(report.violations).toEqual([]);
    expect(report.ok).toBe(true);
  });
});

describe("inspectMessage: 退化した入力", () => {
  it.each(["", "   ", "\n\n", "。、！？", "……"])(
    "空・記号のみの入力 %j は違反なしとして扱う",
    (text) => {
      const report = inspectMessage(text);
      expect(report.ok).toBe(true);
      expect(report.violations).toEqual([]);
    },
  );
});

describe("NG_EXPRESSION_RULES: 語彙データの健全性", () => {
  it("ルール ID が一意である", () => {
    const ids = NG_EXPRESSION_RULES.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("すべてのルールが concept-board の記述を根拠として持つ", () => {
    for (const rule of NG_EXPRESSION_RULES) {
      expect(rule.conceptBoardPhrase.length).toBeGreaterThan(0);
      expect(rule.description.length).toBeGreaterThan(0);
    }
  });

  it("正規表現に g フラグを持たない（lastIndex 由来の副作用を避ける）", () => {
    for (const rule of NG_EXPRESSION_RULES) {
      expect(rule.pattern.global).toBe(false);
    }
  });

  it("同じ入力を繰り返し検査しても結果が変わらない（純粋関数）", () => {
    const text = "絶対に叶います。";
    expect(inspectMessage(text)).toEqual(inspectMessage(text));
  });
});
