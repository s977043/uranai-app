export type ReadingContext = "self_reflection" | "work" | "relationship";

export type ReflectionCard = {
  readonly id: string;
  readonly title: string;
  readonly keyword: string;
  readonly interpretation: string;
  readonly question: string;
  readonly nextAction: string;
};

export type ReflectionReading = {
  readonly version: 1;
  readonly context: ReadingContext;
  readonly contextLabel: string;
  readonly card: ReflectionCard;
  readonly contextPrompt: string;
};

export const REFLECTION_CARDS: readonly ReflectionCard[] = [
  {
    id: "space",
    title: "余白",
    keyword: "急いで決めない",
    interpretation:
      "答えを急ぐより、いま抱えているものを少し広げて眺めるタイミングかもしれません。決めない時間も、整理の一部です。",
    question: "いま、すぐに答えを出さなくてもよいことは何でしょう？",
    nextAction: "今日決めなくてよいことを1つだけメモして、判断をいったん置いてみる。",
  },
  {
    id: "small-step",
    title: "小さな一歩",
    keyword: "動ける大きさにする",
    interpretation:
      "迷いが大きいときは、正解を探すより行動を小さくすると見え方が変わります。試せるサイズまで分けてみましょう。",
    question: "5分だけ使うなら、何を試せそうですか？",
    nextAction: "5分で終わる最小の行動を1つ決め、今日中に試してみる。",
  },
  {
    id: "boundary",
    title: "境界線",
    keyword: "自分の範囲を見つける",
    interpretation:
      "相手や状況を変えることと、自分が選べることは別です。自分で扱える範囲に意識を戻すと、少し呼吸しやすくなります。",
    question: "これは自分で変えられることと、変えられないことのどちらでしょう？",
    nextAction: "紙やメモに「自分で選べること」を1つだけ書く。",
  },
  {
    id: "words",
    title: "言葉にする",
    keyword: "曖昧さを一文にする",
    interpretation:
      "気持ちが混ざっているときは、きれいに説明する必要はありません。いま気になっていることを一文にすると、次に見る場所が見つかります。",
    question: "いまの迷いを一文にすると、どんな言葉になりますか？",
    nextAction: "誰にも見せない前提で、今の気持ちを一文だけ書いてみる。",
  },
  {
    id: "reframe",
    title: "見方を変える",
    keyword: "別の角度を試す",
    interpretation:
      "同じ出来事でも、見る角度が変わると選択肢が増えることがあります。結論を変えるのではなく、別の見方を1つ足してみましょう。",
    question: "信頼できる友人なら、この状況をどう見そうですか？",
    nextAction: "自分とは違う立場から見た説明を1つだけ書いてみる。",
  },
  {
    id: "release",
    title: "軽くする",
    keyword: "抱えすぎを減らす",
    interpretation:
      "全部を同時に良くしようとすると、何が大切か見えにくくなります。いま優先しないものを決めることも前進です。",
    question: "今週だけ、優先しなくてもよいことは何でしょう？",
    nextAction: "今週やらないことを1つ決め、その分の余白を残す。",
  },
] as const;

const CONTEXT_LABELS: Record<ReadingContext, string> = {
  self_reflection: "今の自分",
  work: "仕事",
  relationship: "人間関係",
};

const CONTEXT_PROMPTS: Record<ReadingContext, string> = {
  self_reflection: "今の自分を評価するのではなく、少し距離を置いて眺めるための一枚です。",
  work: "仕事の正解を決めるのではなく、次に試せる選択肢を見つけるための一枚です。",
  relationship: "相手の気持ちを決めつけず、自分が大切にしたいことを見つけるための一枚です。",
};

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createReflectionReading(
  seed: string,
  context: ReadingContext,
): ReflectionReading {
  const card = REFLECTION_CARDS[stableHash(seed) % REFLECTION_CARDS.length];

  return {
    version: 1,
    context,
    contextLabel: CONTEXT_LABELS[context],
    card,
    contextPrompt: CONTEXT_PROMPTS[context],
  };
}
