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
pushとドラフトPR作成は追加のユーザー承認に基づき実施します。
merge・公開・有料API実行はこの整備には含みません。

## LP改善用の保存済み環境に入力する値

LPの正本はこのリポジトリの `marketing-static/public/` です。
Next.jsの `/` は別のアプリ画面です。LPの訴求やデザインは今回変更していません。

| 設定欄 | 値 |
| --- | --- |
| Repository | `s977043/uranai-app` |
| Branch（PRのレビュー中） | `codex/development-environment` |
| Runtime | Node 22、npm 11.12.1、Bash、Chromium対応Linux |
| Setup（checkoutルートで実行） | `bash scripts/setup-lp.sh` |
| 検証 | `npm run verify` と `npm run test:lp:browser` |
| Preview | `npm run dev:lp` |
| Preview URL | `http://127.0.0.1:4173` |
| 編集対象 | `marketing-static/public/index.html`、`styles.css`、`app.mjs` |
| Screenshot / receipt | `.codex-local/lp-evidence/`（Git対象外） |

Node/npmをイメージで指定できない環境では、setup欄に次を入力します。
checkoutのディレクトリを作業ディレクトリとする設定が前提です。

```bash
set -euo pipefail
export npm_config_cache=/workspace/.cache/uranai-npm
npm install --prefix /workspace/.tools/uranai-node --no-save --package-lock=false \
  --no-audit --no-fund node@22.23.4 npm@11.12.1
export PATH=/workspace/.tools/uranai-node/node_modules/.bin:$PATH
bash scripts/setup-lp.sh
```

setupのPATH設定が次のシェルに引き継がれない環境では、作業開始時にも上記の
`export PATH=...` を実行してください。基本のソース編集・previewはブラウザ依存不要です。
ChromiumのOSライブラリが不足する別イメージでは、管理者側でPlaywright対応イメージを
選択する必要があります。今回の環境では追加OSインストールなしで動作しました。

プレビューは編集後にブラウザを再読込します。PC 1440×1000 / スマホ390×844で
テーマCTA3つ、上部・下部リンク、はみ出し、JavaScript無効時表示を自動検証します。
証跡生成前にはLP/QAの変更をローカルcommitしてください。テストが使うserverは
自動起動・終了し、preview serverを別に立ち上げておく必要はありません。
別途 `npm run build` とDB結合検証は前述の手順を使います。

保存済み環境の編集UI・更新APIは本セッションから利用できません。
この設定表とリポジトリへのpushは用意しますが、saved environment自体への保存は未実施です。
スマホのブラウザから127.0.0.1へ直接接続はできません。ホストに認証付きpreview機能が
ある場合はその既存機能を使用し、無ければブラウザQAの画像を確認してください。
公開トンネル・Cloudflareデプロイ・新しい公開URLは作成しません。
