#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
export QA_TOOLS_DIR="${QA_TOOLS_DIR:-$PWD/.codex-local/qa-tools}"
export QA_OUTPUT_DIR="${QA_OUTPUT_DIR:-$PWD/.codex-local/lp-evidence}"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$PWD/.codex-local/browsers}"
node marketing-static/tests/browser-smoke.mjs
