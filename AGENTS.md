# AGENTS.md — 占いアプリ開発ガイド（AI向け）

このリポジトリは **占いロジックをAI-TDDで実装** する Next.js アプリです。  
AIエージェントは本ファイルを最初に読み、手順と禁止事項を守守してください。

## 1. スタックと目的
- Next.js (App Router), TypeScript, pnpm
- 占いロジック（暧/数/星/配列の合成など）を**テスト先行**で実装
- Docker Compose によるローカル起動

## 2. セットアップ
- 依存復巡: `pnpm i`
- 開発起動: `pnpm dev`（または `docker compose up --build`）
- ビルド: `pnpm build`
- Lint/型/テスト: `pnpm lint && pnpm typecheck && pnpm test`

## 3. 環境変数と秘密
- `.env.local` は **作成可だがコミット禁止**
- 必要鍵は `.env.example` を更新して **キー名のみ** 共有
- 公開される `.env*` は作らないこと

## 4. ディレクトリ規約（例）
- `src/domain/*` …… 占いの統合ロジック（副作用なし）
- `src/app/*` …… 画面とAPIルート（統合ロジックは呼び出すだけ）
- `src/tests/*` …… ドメイン単体テスト（I/Oが決まるまでUIのSnapshotは後回し）
- `src/adapters/*` …… 暧/天文/時刻など外部依存の薄い適合層

## 5. AI-TDD ルール
- まず **失敗するドメインテスト** を1ケース書く（例: 生年月日→運勢の整合性）
- 実装は最小限に留め、グリーン化 → リファクタの順で進める
- 日付/タイムゾーン（Asia/Tokyo）ズレに注意、**固定化オブジェクトで検証**

## 6. PR 要件
- タイトル: `[uranai] <要約>`
- 必須: `pnpm lint && pnpm test` が Green（ログを本文に貼る）
- 本文: 目的 / 仕様リンク / 変更点 / 影響範囲 / 回復リスク / スクショ（UI変更時）

## 7. 変更禁止と注意
- 禁止: ハードコード秘密、霊感など検証不能な根拠の対応
- 変更注意: `src/domain/*` の入出力は **互換性に配慮して拡張**
- 乱数・時刻依存は **seed / freeze** でテスト安定化

## 8. Docker / Compose（任意運用）
- 起動: `docker compose up --build`
- 変更点: `Dockerfile`/`compose.yaml` を編集した場合は **root AGENTS.md を更新**

## 9. リリース前チェック（抜粗）
- [ ] 主要ロジックの境界テスト（境界日・うるう年・時差）
- [ ] 型エラー無し（`pnpm typecheck`）
- [ ] 追跡: 例外時のユーザー向けメッセージが過度に断定的でないこと
