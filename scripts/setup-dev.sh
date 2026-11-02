#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
required_node="$(tr -d '[:space:]' < .nvmrc)"
actual_node="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$actual_node" != "$required_node" ]]; then
  echo "Node $required_node required; select it with nvm use or PATH before setup." >&2
  exit 2
fi
required_npm="$(node -p 'require("./package.json").packageManager.split("@")[1]')"
if [[ "$(npm --version)" != "$required_npm" ]]; then
  echo "npm $required_npm required (package.json packageManager)." >&2
  exit 2
fi
npm ci --no-audit --no-fund
if [[ ! -e .env.local ]]; then
  (umask 077; set -o noclobber; cat > .env.local <<'ENV'
# Local development only; no credentials or external services required.
NEXT_TELEMETRY_DISABLED=1
TELEMETRY_INGESTION_ENABLED=false
TELEMETRY_SHARED_INGRESS_APPROVED=false
ENV
  )
fi
echo 'Ready: npm run verify; npm run build; npm run dev -- --hostname 127.0.0.1'
