# uranai-app

数秘術・タロット・マヤ暦を扱う Next.js 製の占いアプリです。

## 必要環境

| 項目 | バージョン |
| --- | --- |
| Node.js | 22 系（`.nvmrc` 参照。`>=20.9.0` で動作） |
| パッケージマネージャ | npm（yarn / pnpm は使いません） |

## セットアップ（初回）

```bash
nvm use              # .nvmrc の Node に切り替え
npm ci               # ロックファイルどおりに依存を導入
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

`.env.local` はコミット禁止です。鍵を増やすときは `.env.example` に **キー名だけ** 追記してください。

## よく使うコマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバ起動（Turbopack） |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド成果物の起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` による型検査 |
| `npm run test` | Vitest（1回実行） |
| `npm run test:watch` | Vitest ウォッチ |
| `npm run verify` | lint → typecheck → test をまとめて実行（PR 前必須） |

## Docker で起動する場合

```bash
cp .env.example .env   # compose は .env を読む
docker compose up --build
```

`web`（Next.js / :3000）と `db`（PostgreSQL 16）が起動します。DB の起動完了を
healthcheck で待ってから `web` が立ち上がります。

## ディレクトリ構成

```
src/
├── app/        # 画面と API ルート。ドメインロジックは呼び出すだけ
├── domain/     # 占いロジック（副作用なし）
├── adapters/   # 暦・天文・時刻など外部依存の薄い適合層
└── tests/      # ドメイン単体テスト
```

テストは常に `TZ=Asia/Tokyo` で実行されます（`vitest.config.ts`）。日付境界のズレを
防ぐため、時刻依存のロジックはこの前提で書いてください。

## 開発ルール

AI エージェント・人間ともに [`AGENTS.md`](./AGENTS.md) の手順に従ってください。
GitHub Copilot 向けの補足は [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) にあります。
