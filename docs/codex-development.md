# Codex 開発環境

## 運営リポジトリとの関係

このリポジトリはNext.jsアプリ本体です。`s977043/uranai-ai-ops` は
別のPython運営・評価基盤であり、アプリ開発には本リポジトリのcheckoutが必要です。
最初にルートの `AGENTS.md` を確認してください。

## 開発開始

Nodeは `.nvmrc` の22系、npmは `package.json` の11.12.1を使用します。
既存のversion managerがあれば `nvm use` などで選択してください。
このCodex workspaceではグローバル環境を変更せず次の場所に導入済みです。

```bash
export PATH=/workspace/.tools/uranai-node/node_modules/.bin:$PATH
export npm_config_cache=/workspace/.cache/uranai-npm
export NEXT_TELEMETRY_DISABLED=1
cd /workspace/uranai-app
bash scripts/setup-dev.sh
npm run verify
npm run build
npm run dev -- --hostname 127.0.0.1
```

開発サーバは http://127.0.0.1:3000 です。
別環境にversion managerがない場合のworkspace内インストール例:

```bash
npm --cache /workspace/.cache/uranai-npm install \
  --prefix /workspace/.tools/uranai-node --no-save --package-lock=false \
  --no-audit --no-fund node@22.23.4 npm@11.12.1
```

setupはバージョンを検査し、`npm ci` でlockfileどおりに依存を導入します。
`.env.local` が無いときだけ、telemetryを無効にした鍵なし設定を作成します。
既存ファイルは上書きしません。DBやOpenAIの認証情報は基本開発・テストに不要です。
`npm ci --no-audit` は監査を実施しません。既知の監査集計はIssue #63で別途追跡中です。
本手順の成功は脆弱性の不在を意味しません。

## PostgreSQL結合テスト（任意）

`npm run verify` ではDB結合6件はDB URL未指定ならskipされます。
Dockerが使える場合、使い捨てのローカルDBで追加検証できます。
このテストはtableを削除・再作成するため、既存DBのURLを流用しないでください。

```bash
docker run --detach --rm --name uranai-codex-dev-db \
  --publish 127.0.0.1::5432 \
  --env POSTGRES_USER=postgres --env POSTGRES_PASSWORD=local-test-only \
  --env POSTGRES_DB=uranai_app postgres:16-alpine
docker exec uranai-codex-dev-db pg_isready -U postgres -d uranai_app
docker port uranai-codex-dev-db 5432/tcp
# 上で表示されたポートを <port> に指定する（起動完了後）。
INTEGRATION_DATABASE_URL=postgresql://postgres:local-test-only@127.0.0.1:<port>/uranai_app npm run test:integration
docker stop uranai-codex-dev-db
```

ブラウザ検証は `.github/workflows/ui-smoke.yml` のloopback-only手順を使用できます。
Playwright 1.56.1はアプリ依存を変えず別ディレクトリに導入します。

## saved environment

今回選択されたsaved environmentは `uranai-ai-ops` です。
このworkspaceにはアプリを別途cloneしていますが、次回の新規環境にも
そのcheckoutが存在するとは限りません。アプリ用saved environmentを設定する場合は
`s977043/uranai-app` を対象にし、Node 22・npm 11.12.1を選択、setupに
`bash scripts/setup-dev.sh` を指定します。設定画面自体の変更は未実施です。
環境からこのスクリプトを取得するには、ローカル変更を別途pushする必要があります。
push・PR作成・merge・公開・有料API実行はこの整備には含みません。
