# Product Development — MLP First

このリポジトリでは、ユーザー向けプロダクト開発の基本形として **MVP（Minimum Viable Product）ではなく、MLP（Minimum Lovable Product）を採用する**。

## North Star

> 最小の機能ではなく、ユーザーが価値を感じ、もう一度使いたいと思える最小の完成体験を作る。

「動く」「要件を満たす」だけではリリース条件としない。AIによって実装・制作コストが下がるほど、人間は **何を作るか / どの体験が良いか / 続ける価値があるか** の判断に集中する。

## 標準フロー

```text
Experience Hypothesis
  ↓
Vertical Slice
  ↓
Lovability Review
  ↓
User Observation
  ↓
Polish Loop
  ↓
MLP Release
  ↓
Retention Validation
```

短く表す場合は、次を基本形とする。

```text
Vertical Slice → MLP → Retention
```

## 1. Experience Hypothesis

機能ではなく、ユーザー体験の仮説を定義する。

形式:

> [誰が] [何をしたとき] [どんな価値・感情を得る] はず。

例:

> 夜に迷いを抱えたユーザーが鑑定を終えたとき、気持ちが整理され、次の一歩を1つ決められる。

ここで決めるもの:

- 対象ユーザー / 利用文脈
- Core Experience
- 期待する感情・価値
- 観察可能な成功シグナル

## 2. Vertical Slice

Core Experienceを端から端まで通す最小の実装を作る。

目的は機能網羅ではなく、**体験仮説を実際に触って評価できる状態**にすること。

Vertical Sliceに含めるもの:

- 最小限の入口
- Core Experience
- 結果 / フィードバック
- 必要最低限の計測

含めないもの:

- 仮説検証に不要な管理機能
- 将来用の過剰な抽象化
- 「いつか使う」設定項目
- Core Experienceと無関係な機能追加

## 3. Lovability Review

「正しく動くか」だけでなく、「好きになれるか」をレビューする。

最低限、次を確認する。

- 触り始めて価値が理解できるか
- 途中で迷わないか
- 体験に気持ちよさ / 安心 / 楽しさ / 驚きのいずれかがあるか
- 世界観とUI・文言・動きが一貫しているか
- 終了時に価値が残るか
- もう一度使いたい理由があるか

機能追加より、最大の違和感を潰すことを優先する。

## 4. User Observation

説明しすぎずに実際の利用行動を観察する。

見るもの:

- 最初に何を触るか
- どこで止まる / 戻る / 迷うか
- どこで反応が変わるか
- 自発的にもう一度試すか
- 何を人に話す / 見せるか

発言だけでなく、行動をEvidenceとして扱う。

## 5. Polish Loop

観察結果から最大の摩擦・違和感を1つ選び、改善する。

```text
Observe
  ↓
Choose one friction
  ↓
Improve
  ↓
Review
  ↓
Observe again
```

一度に多数の改善を入れて因果を曖昧にしない。

## 6. MLP Release

MLPは「高機能なMVP」ではない。

リリース対象は、機能を絞ったままでも次を満たすこと。

- Core Experienceが完結している
- 主要な違和感が取り除かれている
- 世界観 / UI / 文言が最低限一貫している
- 安全性・品質上の重大な問題がない
- 人に見せられる完成度になっている
- 継続利用を検証できる計測がある

## 7. Retention Validation

初回利用だけで成功としない。

MLP公開後は、**再訪・再利用の理由が成立しているか**を確認する。

代表的な確認項目:

- 再訪率 / 継続率
- 同一Core Experienceの再利用
- 次回利用までの間隔
- 自発的な共有 / 紹介
- 再利用理由・離脱理由

数値はプロダクトの成熟度に応じて設定し、固定の万能KPIにはしない。

## AI / Human の責務分離

AIは制作能力を拡張するために使う。AIそのものをユーザー価値とはみなさない。

### AIに積極的に任せる

- 調査・比較
- UI / UX案の展開
- 実装
- テスト
- コピー案
- 画像 / 音 / アニメーション等の制作支援
- 計測・分析
- レビュー観点の展開
- 改善案の生成

### Humanが最終判断する

- Product Intent
- Experience Hypothesis
- Core Experience
- 世界観 / Taste
- Lovability
- 倫理・安全性
- Go / No-Go
- 継続 / Pivot / Stop

原則:

> AIは量と探索範囲を広げ、人間は体験価値を判断する。

## MVPとの扱い

MVPという考え方を技術検証から完全に排除するわけではない。

- 技術Spike / PoC: 「成立するか」を確かめるための最小実装を許容する
- ユーザー向けProduct Release: MLP基準を使う

PoCをそのままProduct Releaseに昇格させない。

## 開発段階

```text
Prototype
  「成立するか」
  ↓
Vertical Slice
  「この体験を作れるか」
  ↓
MLP
  「好きになってもらえるか」
  ↓
Product
  「継続して使われるか」
```

## このアプリでの適用

プロダクトの体験・世界観は [`concept-board.md`](./concept-board.md) を正本とする。

例として、AI占い師体験では「AIで占える」こと自体を価値仮説にしない。

- 鑑定前: 入りやすさ・儀式感
- 鑑定中: 自分のために読まれている感覚
- 鑑定後: 気持ちが整理され、次の行動が残る
- 再訪: また迷ったときに戻りたい理由がある

という一連の体験をVertical Sliceとして作り、MLPとして磨き、Retentionで検証する。

## Doneの考え方

ユーザー向け機能は、実装完了だけではDoneとしない。

最低限、以下を確認する。

- [ ] Experience Hypothesisが明文化されている
- [ ] Core ExperienceをVertical Sliceで確認できる
- [ ] Lovability Reviewを実施した
- [ ] 実ユーザーまたは妥当な代理観察からEvidenceを得た
- [ ] 最大の摩擦をPolish Loopで改善した
- [ ] MLP Release基準を満たす
- [ ] Retentionを確認できる計測または観察方法がある

このチェックリストは、機能数を増やすためではなく、**ユーザー価値の学習ループを短く回すため**に使う。