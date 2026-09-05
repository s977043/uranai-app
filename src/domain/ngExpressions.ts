/**
 * 占い結果として出してはいけない表現の語彙データ。
 *
 * 出典は docs/concept-board.md 「ブランド人格 > NG表現」。
 * このサービスは「当てる」ではなく「整う」を掲げるため、断定・運命論・
 * 別れの指示・不幸の予告・医療/法律/投資の断定助言は表示前に弾く。
 *
 * ルールはコードではなくデータとして定義し、追加・変更をこのファイルだけで
 * 完結させる（src/domain/messageGuardrail.ts は評価器のみを持つ）。
 *
 * 正規表現の前提:
 * - 検査対象は normalizeMessage() で NFKC 正規化＋空白除去した文字列
 * - 句読点クラス `[^。、,.!?]` を挟むことで、文をまたいだ誤検出を避ける
 * - `g` フラグは付けない（lastIndex による副作用を避けるため）
 */

/** NG 表現の分類。呼び出し側の再生成プロンプトやログの粒度に対応する。 */
export type NgExpressionCategory =
  | "assertion"
  | "fatalism"
  | "breakup-directive"
  | "misfortune"
  | "medical-advice"
  | "legal-advice"
  | "investment-advice";

export interface NgExpressionRule {
  /** ルールの一意な識別子。ログや再生成の指示に使う。 */
  readonly id: string;
  /** ルールの分類。 */
  readonly category: NgExpressionCategory;
  /** 根拠となる concept-board の NG 表現（原文）。 */
  readonly conceptBoardPhrase: string;
  /** 何を弾くルールなのかの説明。 */
  readonly description: string;
  /** 検出用の正規表現（g フラグなし）。 */
  readonly pattern: RegExp;
}

/** 句読点・文末記号。ここをまたぐマッチは誤検出になりやすいので除外する。 */
const SENTENCE_BREAK = "[^。、,.!?]";

export const NG_EXPRESSION_RULES: readonly NgExpressionRule[] = [
  // --- 断定: concept-board 「絶対にこうなる」 ---
  {
    id: "assertion-absolute-outcome",
    category: "assertion",
    conceptBoardPhrase: "絶対にこうなる",
    description:
      "「絶対 / 必ず / 100% / 間違いなく」＋結果の断定。未来を言い切る表現。",
    pattern: new RegExp(
      "(絶対|ぜったい|必ず|かならず|100%|間違いなく|まちがいなく|確実に)" +
        `${SENTENCE_BREAK}{0,12}` +
        "(なります|なる|なるでしょう|叶います|叶う|かないます|うまくいきます|うまくいく|成功します|成功する|実現します|実現する|手に入ります|訪れます|来ます|良くなります|よくなります|できます|勝てます|儲かります|値上がりします)",
    ),
  },
  {
    id: "assertion-settled-future",
    category: "assertion",
    conceptBoardPhrase: "絶対にこうなる",
    description:
      "「〜に決まっています / 〜に違いありません」など、結末が確定しているという言い切り。",
    pattern:
      /(に決まっています|に決まってる|に違いありません|に間違いありません|は確定です|しかありえません|であることは確実です)/,
  },

  // --- 運命論: concept-board 「この人は運命の相手だ」 ---
  {
    id: "fatalism-destined-partner",
    category: "fatalism",
    conceptBoardPhrase: "この人は運命の相手だ",
    description:
      "特定の相手を運命/宿命の相手だと断定する表現（ぼかし表現が後続する場合は除外）。",
    pattern: new RegExp(
      "(運命|宿命)の(相手|人|ひと|パートナー|お相手)" +
        `(?!${SENTENCE_BREAK}{0,14}(かもしれ|かどうか|か否か|とは限|ではありません|ではない|でしょうか))`,
    ),
  },
  {
    id: "fatalism-unavoidable",
    category: "fatalism",
    conceptBoardPhrase: "この人は運命の相手だ",
    description:
      "「逃れられない運命」など、ユーザーの意思では変えられないとする運命論。concept-board 「でも現実逃避させない / ユーザーの意思を尊重する」に反する。",
    pattern:
      /(逃れられない|変えられない|避けられない|抗えない)(運命|宿命)|(運命|宿命)(は|が)(決まっています|決まっている|変えられません)/,
  },

  // --- 別れの指示: concept-board 「いますぐ別れるべき」 ---
  {
    id: "breakup-directive",
    category: "breakup-directive",
    conceptBoardPhrase: "いますぐ別れるべき",
    description:
      "関係の解消をユーザーに代わって指示する表現。決断の主体はユーザーに置く。",
    pattern: new RegExp(
      "(別れ|わかれ|離婚|縁を切|関係を断|連絡を絶)" +
        `${SENTENCE_BREAK}{0,4}` +
        "(べき|た方がいい|たほうがいい|た方がよい|たほうがよい|なさい|ましょう|るしかない|るしかありません)" +
        "(?!かどうか|かは|ではありません|とは限)",
    ),
  },

  // --- 不幸の予告: concept-board 「不幸になる」 ---
  {
    id: "misfortune-prediction",
    category: "misfortune",
    conceptBoardPhrase: "不幸になる",
    description: "不幸・災い・破滅が起こると予告する表現。",
    pattern: new RegExp(
      "(不幸|災い|不運|最悪の事態|破滅|バチ|罰)" +
        `${SENTENCE_BREAK}{0,8}` +
        "(になります|になる|が訪れます|が訪れる|が待っています|が起こります|が起きます|に見舞われます)",
    ),
  },
  {
    id: "misfortune-explicit-harm",
    category: "misfortune",
    conceptBoardPhrase: "不幸になる",
    description:
      "健康被害・事故・回復不能な結果を予告する表現（concept-board に列挙はないが「不幸の予告」の同種であり、不安を煽る度合いが高いため追加）。",
    pattern:
      /(大きな病気になります|病気になります|事故に遭います|命に関わります|取り返しのつかないことになります|必ず失敗します)/,
  },

  // --- 医療の断定助言: concept-board 「医療 / 法律 / 投資の断定助言」 ---
  {
    id: "medical-advice-cure",
    category: "medical-advice",
    conceptBoardPhrase: "医療 / 法律 / 投資の断定助言",
    description: "病気や症状が治ると断定する表現。",
    pattern: new RegExp(
      "(病気|症状|うつ|がん|癌|持病|不調|痛み)" +
        `${SENTENCE_BREAK}{0,8}` +
        "(治ります|治る|完治します|完治する|消えてなくなります)",
    ),
  },
  {
    id: "medical-advice-stop-treatment",
    category: "medical-advice",
    conceptBoardPhrase: "医療 / 法律 / 投資の断定助言",
    description: "受診・服薬・治療の中止や不要を指示する表現。",
    pattern: new RegExp(
      "(通院|受診|服薬|薬|治療|手術|病院|医者|医師)" +
        `${SENTENCE_BREAK}{0,8}` +
        "(は不要|は必要ありません|は必要ない|しなくて大丈夫|をやめて|をやめましょう|に行かなくて)",
    ),
  },

  // --- 法律の断定助言 ---
  {
    id: "legal-advice-litigation-outcome",
    category: "legal-advice",
    conceptBoardPhrase: "医療 / 法律 / 投資の断定助言",
    description: "裁判・訴訟の結果を断定する表現。",
    pattern: new RegExp(
      "(裁判|訴訟|訴え|告訴|調停)" +
        `${SENTENCE_BREAK}{0,8}` +
        "(に勝てます|勝てます|勝ちます|は勝訴します)",
    ),
  },
  {
    id: "legal-advice-legality",
    category: "legal-advice",
    conceptBoardPhrase: "医療 / 法律 / 投資の断定助言",
    description: "適法性や金銭請求の可否を断定する表現。",
    pattern:
      /(違法ではありません|違法ではない|合法です|法的に問題ありません|罪には問われません|慰謝料は取れます|慰謝料は必ず)/,
  },

  // --- 投資の断定助言 ---
  {
    id: "investment-advice-outcome",
    category: "investment-advice",
    conceptBoardPhrase: "医療 / 法律 / 投資の断定助言",
    description: "相場の値動きや利益、売買行動を断定・指示する表現。",
    pattern: new RegExp(
      "(株|投資|仮想通貨|暗号資産|FX|ビットコイン|不動産|銘柄|宝くじ)" +
        `${SENTENCE_BREAK}{0,10}` +
        "(は上がります|が上がります|値上がりします|儲かります|は当たります|損はしません|買うべき|売るべき|に全額)",
    ),
  },
];
