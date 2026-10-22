/** Fixed editorial examples only; no AI, random draw, input collection, storage or API calls. */
export const samples = Object.freeze({
  self: Object.freeze({
    label: "自分のこと",
    question: "最近、少し気になっている気持ちに名前を付けるなら、何と言いますか？",
    action: "今日できる一歩：気持ちを一言だけ、心の中で整理してみましょう。"
  }),
  work: Object.freeze({
    label: "仕事のこと",
    question: "今の課題を、変えられることと変えられないことに分けると何が残りますか？",
    action: "今日できる一歩：自分で試せる小さな行動を一つだけ選んでみましょう。"
  }),
  relations: Object.freeze({
    label: "人間関係",
    question: "相手の考えを決めつけずに、あなた自身が大切にしたいことは何ですか？",
    action: "今日できる一歩：伝えたいことと、まだ確かめていないことを分けてみましょう。"
  })
});

export function getSample(theme) {
  return Object.hasOwn(samples, theme) ? samples[theme] : null;
}

export function renderSample(theme, nodes) {
  const sample = getSample(theme);
  if (!sample) return false;
  nodes.label.textContent = sample.label;
  nodes.question.textContent = sample.question;
  nodes.action.textContent = sample.action;
  return true;
}

if (typeof document !== "undefined") {
  const nodes = {
    label: document.getElementById("sample-label"),
    question: document.getElementById("sample-question"),
    action: document.getElementById("sample-action")
  };
  for (const button of document.querySelectorAll("button[data-theme]")) {
    button.addEventListener("click", () => {
      if (!renderSample(button.dataset.theme, nodes)) return;
      for (const other of document.querySelectorAll("button[data-theme]")) {
        other.setAttribute("aria-pressed", String(other === button));
      }
      document.getElementById("sample-result").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    button.setAttribute("aria-pressed", "false");
  }
}
