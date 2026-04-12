# Issue Backlog

このドキュメントは、企画ドキュメントを実装や検討の Issue に分解するための下書きです。

## Priority Legend
- P0: MVP 開始前に必須
- P1: MVP に含めたい
- P2: MVP 後でもよい

---

## P0

### [uranai] define response schema for fortune results
- Type: Feature
- Area: Product / Prompt / Domain
- Goal: 占い結果の出力構造を固定し、UI 実装とプロンプト設計の前提を揃える
- Related Docs:
  - `docs/concept-board.md`
  - `docs/use-cases.md`
  - `docs/mvp.md`
- Done When:
  - 結果の基本構造が定義されている
  - テーマ別の差分が整理されている
  - UI とプロンプト双方で使える形になっている

### [uranai] define input schema for consultation themes
- Type: Feature
- Area: Product / Domain
- Goal: 恋愛・人間関係・仕事・今日の運勢の入力項目をテーマ別に整理する
- Related Docs:
  - `docs/use-cases.md`
  - `docs/mvp.md`
- Done When:
  - 必須 / 任意入力が決まっている
  - テーマ別の不足情報が分かる
  - バリデーション観点が洗い出されている

### [uranai] define safety response policy
- Type: Feature
- Area: Safety / Prompt
- Goal: 危険相談や制限領域での応答方針を定義する
- Related Docs:
  - `docs/safety.md`
  - `docs/use-cases.md`
- Done When:
  - ブロック対象が明確
  - 安全応答テンプレートがある
  - 通常応答との切り替え条件が定義されている

### [uranai] design daily fortune MVP flow
- Type: Feature
- Area: Product / UX
- Goal: 朝の1分利用に最適化した最小体験を定義する
- Related Docs:
  - `docs/concept-board.md`
  - `docs/use-cases.md`
  - `docs/mvp.md`
- Done When:
  - 入力から結果表示までの導線が決まっている
  - 表示項目が確定している
  - 1分以内で完了する前提が満たされている

---

## P1

### [uranai] design love consultation flow before sending a reply
- Type: Feature
- Area: Product / UX / Prompt
- Goal: 恋愛相談の代表ユースケースを MVP として成立させる
- Related Docs:
  - `docs/personas.md`
  - `docs/use-cases.md`
- Done When:
  - 相談入力の流れが決まっている
  - 結果のトーンと深さが定義されている
  - 行動提案の出し方が決まっている

### [uranai] design night anxiety support mode
- Type: Feature
- Area: Product / UX / Safety
- Goal: 夜の不安整理ユースケースに特化した体験を定義する
- Related Docs:
  - `docs/personas.md`
  - `docs/use-cases.md`
  - `docs/safety.md`
- Done When:
  - 受容的な導入文の方針がある
  - 深掘りの上限が決まっている
  - 依存をあおらない制御が整理されている

### [uranai] create UI information architecture for MVP
- Type: Feature
- Area: Product / UX
- Goal: 主要画面と遷移を整理し、実装の入口を作る
- Related Docs:
  - `docs/concept-board.md`
  - `docs/mvp.md`
- Done When:
  - 画面一覧がある
  - 主要導線がある
  - 画面ごとの役割が明確

### [uranai] define AI disclosure and legal copy
- Type: Research
- Area: Product / Safety
- Goal: AI による占い体験であることを明示する文言を定義する
- Related Docs:
  - `docs/safety.md`
  - `docs/mvp.md`
- Done When:
  - 初回表示文言がある
  - 注意書きがある
  - 利用規約やプライバシー文面への接続方針がある

### [uranai] define analytics events for MVP
- Type: Feature
- Area: Data / Product
- Goal: MVP の学習に必要な行動ログを整理する
- Related Docs:
  - `docs/mvp.md`
- Done When:
  - 主要イベントが一覧化されている
  - KPI との対応が分かる
  - 計測上の注意点が整理されている

---

## P2

### [uranai] design compatibility diagnosis experience
- Type: Feature
- Area: Product / UX
- Goal: 相性診断を共有しやすい軽量体験として設計する
- Related Docs:
  - `docs/concept-board.md`
  - `docs/use-cases.md`
- Done When:
  - 必要入力が決まっている
  - 共有向けの出力形式が決まっている
  - 重すぎない体験設計になっている

### [uranai] research monetization options for deep reading
- Type: Research
- Area: Business / Product
- Goal: 深掘り鑑定の課金導線を比較検討する
- Related Docs:
  - `docs/mvp.md`
- Done When:
  - 課金案が複数整理されている
  - 導入タイミング案がある
  - MVP 後の優先順位が示されている

### [uranai] define saved history experience
- Type: Feature
- Area: Product / UX / Data
- Goal: 占い結果の保存と再閲覧体験を定義する
- Related Docs:
  - `docs/mvp.md`
- Done When:
  - 保存対象が決まっている
  - 一覧と詳細の考え方がある
  - プライバシー観点が整理されている

---

## Suggested First Issues

最初に切るなら以下の 5 件がよい。

1. `[uranai] define response schema for fortune results`
2. `[uranai] define input schema for consultation themes`
3. `[uranai] define safety response policy`
4. `[uranai] design daily fortune MVP flow`
5. `[uranai] create UI information architecture for MVP`

## Notes

- 実際に Issue を作る際は、`.github/ISSUE_TEMPLATE/feature_request.md` または `.github/ISSUE_TEMPLATE/research_task.md` をベースにする
- タイトル形式は `[uranai] <summary>` を推奨
