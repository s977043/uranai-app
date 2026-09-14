# North Star

## Statement

> AIが日常的なExecutionを自律的に進め、人間は世界観・ユーザー価値・倫理・重要判断に集中する占い事業OSを作る。

## What we optimize

優先順位は以下です。

1. User Value Flow
2. Trust / Safety
3. Experiment Cycle Time
4. Learning Reuse Rate
5. Human Operation Time
6. AI Execution Rate

AI Execution Rate は最上位KPIではありません。AIの稼働率だけを最大化すると、不要な施策・判断待ち・検証不足を増やし、ユーザー価値の流れを悪化させる可能性があるためです。

## Product promise

`docs/concept-board.md` の「当てるより、整う」を中心に据えます。

- 未来を断定しない
- ユーザーの意思決定を奪わない
- 不安や依存を課金の材料にしない
- 結果だけでなく、気持ちの整理と次の一歩につなげる

## Non-goals

次はNorth Starにしません。

- 従業員数ゼロ
- AI稼働率100%
- 投稿数最大化
- 鑑定回数最大化
- LTV / CVR単独最大化
- 24時間自動で何かを実行し続けること

これらは手段または局所指標であり、User Value / Trust / Safetyを毀損する場合は採用しません。

## Responsibility boundary

### Deterministic system

担当:

- 占術上の事実
- カード抽選
- 正逆
- 数秘計算
- 日付・暦計算
- ルールに基づく入力検証

禁止:

- LLMに都合の良い結果を選ばせる
- 文章生成側から占術上の事実を書き換える

### AI

担当:

- 解釈
- 言語化
- 分析
- 仮説生成
- 下書き
- 分類
- テスト案
- レポート
- 改善提案

### Human

担当:

- Purpose
- Strategy
- 世界観
- 倫理判断
- 高リスク判断
- 予算/価格の重要変更
- 本番公開の最終責任
- Go / No-Go

## Success condition

AI-Native化が成功している状態は、次の状態です。

- 人間が単純集計や下書きではなく判断に時間を使えている
- Agent出力にEvidenceがあり、なぜその提案になったか追跡できる
- Experimentの結果が次回の判断に再利用される
- AIの変更による品質低下をEvalで検知できる
- 自動化範囲が広がってもユーザーへの断定・不安煽り・依存促進が増えない
