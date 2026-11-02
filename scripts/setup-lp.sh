#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
bash scripts/setup-dev.sh
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.codex-local/browsers"
tools_dir="$PWD/.codex-local/qa-tools"
mkdir -p "$tools_dir"
npm install --prefix "$tools_dir" --ignore-scripts --no-audit --no-fund --package-lock=false playwright@1.56.1
node "$tools_dir/node_modules/playwright/cli.js" install chromium
echo 'LP ready: npm run dev:lp; npm run test:lp:browser'
