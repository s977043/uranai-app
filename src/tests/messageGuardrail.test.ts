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

/**
 * 語彙（主語）と断定述語の距離を変えた文。
 * ルールは「主語語彙 + 探索窓 + 述語」の共起で検出するため、
 * 窓の広さがカテゴリごとの方針どおりかをここで固定する。
 *
 * 方針:
 * - 医療 / 法律 / 投資 は外したときの被害が健康・金銭・法的判断に及ぶため、
 *   他カテゴリより過検出寄り（＝窓を広く）に倒す
 * - 断定 / 運命論 は「絶対に大丈夫、とは言い切れませんが」のような
 *   安心を与える正常文を弾かないよう、窓を狭いまま維持する
 */
describe("inspectMessage: 主語と述語の距離を変えても検出する", () => {
  it.each([
    // [カテゴリ, 距離ラベル, 文]
    ["medical-advice", "短", "その症状は占いで治ります。"],
    ["medical-advice", "中", "その症状はこのお守りで必ず治ります。"],
    [
      "medical-advice",
      "長",
      "その持病は来月の満月の夜をきっかけにすっかり治ります。",
    ],
    [
      "medical-advice",
      "中",
      "お薬は星の巡りが整うこの時期にやめて大丈夫です。",
    ],
    ["legal-advice", "短", "その訴訟は必ず勝てます。"],
    [
      "legal-advice",
      "長",
      "その裁判はあなたの誠実さが伝わるので最後には勝てます。",
    ],
    ["investment-advice", "短", "この株は値上がりします。"],
    [
      "investment-advice",
      "長",
      "この銘柄はあなたの金運が上向くこの秋にかけてじわりと値上がりします。",
    ],
    ["misfortune", "短", "このままでは不幸になります。"],
    [
      "misfortune",
      "中",
      "この選択では不幸なことばかりが立て続けに起こります。",
    ],
    ["assertion", "短", "絶対に叶います。"],
    ["assertion", "中", "絶対にこの恋は近いうちに叶います。"],
  ])("%s / 距離%s: %s", (category, _distance, text) => {
    const report = inspectMessage(text);
    expect(report.ok).toBe(false);
    expect(report.violations.map((violation) => violation.category)).toContain(
      category,
    );
  });

  it("読点をまたぐ共起は検出しない（文をまたいだ誤検出を避ける設計）", () => {
    // 「治りますように」と願う文脈まで拾わないよう、句読点で探索を打ち切る
    expect(isSafeMessage("その症状は、あなたのせいではありません。")).toBe(
      true,
    );
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
    // --- 窓を広げた後の回帰セット（過検出ゼロを維持するための固定） ---
    "今日は少しだけ、自分の気持ちに耳を傾けてみませんか。",
    "絶対に大丈夫、とは言い切れませんが、あなたの中に答えはあります。",
    "運命の相手かどうかは、これから育てていくものかもしれません。",
    "別れるべきかどうかは、あなた自身が決めていいことです。",
    "不安になる夜もありますね。まずは深呼吸をひとつ。",
    "焦らなくて大丈夫。今日は一つだけ、小さな一歩を決めてみましょう。",
    "返信を送るか迷っているなら、今の気持ちを書き出してみるのはどうでしょう。",
    // 医療の窓を広げると弾かれやすくなる文。必ず PASS のままにする
    "体調が気になるときは、無理せず専門家に相談してみてくださいね。",
    "お薬のことは、次の診察で先生に聞いてみるのが安心です。",
    "お金の不安が続くなら、いまの家計を書き出すところから始めてみましょう。",
    // 拡張コーパスでの過検出スイープで見つかった取りこぼし（断定を避ける正常文）
    "必ずしもうまくいくとは限りませんが、今日の一歩には意味があります。",
    "痛みがあるときは我慢せず、早めに病院で診てもらってくださいね。",
    "お薬の飲み合わせが不安なら、薬剤師さんに聞いてみるのが安心です。",
    "裁判のような大きな出来事の前は、誰でも眠れなくなるものです。",
    "投資の判断に迷う時期です。焦らず情報を集めるところから。",
    "災いのように見える出来事が、後で意味を持つこともあります。",
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
