# AGENTS.md — 占いアプリ開発ガイド（AI向け）

このリポジトリは **占いロジックをAI-TDDで実装** する Next.js アプリです。  
AIエージェントは本ファイルを最初に読み、手順と禁止事項を守ってください。

## 1. スタックと目的
- Next.js (App Router), TypeScript, npm
- 占いロジック（暦/数/星/配列の合成など）を**テスト先行**で実装
- Docker Compose によるローカル起動

## 2. セットアップ
- Node.js: `.nvmrc` に従う（v22 系。`nvm use` で切替）
- 依存導入: `npm ci`（初回・CI）／`npm install`（依存を足すとき）
- 環境変数: `cp .env.example .env.local`
- 開発起動: `npm run dev`（または `docker compose up --build`）
- ビルド: `npm run build`
- 検証: `npm run verify`（= lint → typecheck → test → AI eval fixture contract validation）

## 3. 環境変数と秘密
- `.env.local` は **作成可だがコミット禁止**
- 必要鍵は `.env.example` を更新して **キー名のみ** 共有
- 公開される `.env*` は作らないこと

## 4. ディレクトリ規約（例）
- `src/domain/*` …… 占いの統合ロジック（副作用なし）
- `src/app/*` …… 画面とAPIルート（統合ロジックは呼び出すだけ）
- `src/tests/*` …… ドメイン単体テスト（I/Oが決まるまでUIのSnapshotは後回し）
- `src/adapters/*` …… 暦/天文/時刻など外部依存の薄い適合層

## 5. AI-TDD ルール
- まず **失敗するドメインテスト** を1ケース書く（例: 生年月日→運勢の整合性）
- 実装は最小限に留め、グリーン化 → リファクタの順で進める
- 日付/タイムゾーン（Asia/Tokyo）ズレに注意、**固定化オブジェクトで検証**

## 6. PR 要件
- タイトル: `[uranai] <要約>`
- 必須: `npm run verify` が Green（ログを本文に貼る）
- 本文: 目的 / 仕様リンク / 変更点 / 影響範囲 / ロールバック手順 / スクショ（UI変更時）

## 7. 変更禁止と注意
- 禁止: ハードコード秘密、霊感など検証不能な根拠の実装
- 変更注意: `src/domain/*` の入出力は **互換性に配慮して拡張**
- 乱数・時刻依存は **seed / freeze** でテスト安定化

## 8. Docker / Compose（任意運用）
- 起動: `docker compose up --build`
- 変更点: `Dockerfile`/`docker-compose.yml` を編集した場合は **root AGENTS.md を更新**

## 9. リリース前チェック（抜粋）
- [ ] 主要ロジックの境界テスト（境界日・うるう年・時差）
- [ ] 型エラー無し（`npm run typecheck`）
- [ ] AI eval fixture contractが有効（`npm run eval:contracts`）
- [ ] 追跡: 例外時のユーザー向けメッセージが過度に断定的でないこと

## 10. AI-Native 事業運用
- 分析、VoC、Growth、CRM、コンテンツ等の **AI-Native事業運用**を変更する場合は、最初に [`docs/ai-native/README.md`](./docs/ai-native/README.md) を読む
- Product/Brandの正本は [`docs/concept-board.md`](./docs/concept-board.md)、AI-Native運用の責務・Safety・Evalの正本は `docs/ai-native/`
- `ai/agents/*` / `ai/skills/*` / `ai/workflows/*` / `ai/evals/*` の変更では、Evidence要件・Human Gate・Safety Policy・Regression方針を維持する
- 生の相談内容、不要なPII、秘密情報をKnowledgeやGitへ保存しない
- Agentが自分の仮説・Insightを自己承認して `Accepted Learning` へ昇格させない

## 11. Product Development — MLP First
- ユーザー向けプロダクト開発は [`docs/product-development.md`](./docs/product-development.md) を正本とする
- MVPをユーザー向けリリース基準にせず、`Experience Hypothesis → Vertical Slice → Lovability Review → User Observation → Polish Loop → MLP Release → Retention Validation` を標準フローとする
- 短く扱う場合は **`Vertical Slice → MLP → Retention`** を基本形とする
- 技術Spike / PoCは成立性確認に使ってよいが、そのままProduct Releaseへ昇格させない
- AIは調査・案出し・実装・テスト・制作・分析の探索量を広げ、人間はProduct Intent / Core Experience / Lovability / 倫理 / Go-No-Goを最終判断する
- ユーザー向け機能は「実装完了」だけでDoneとせず、LovabilityとRetentionを検証できる状態まで含めて判断する
