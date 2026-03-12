#!/usr/bin/env bash

set -euo pipefail

# Build the React frontend for production
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "${REPO_ROOT}/client"

# Use a clean, lockfile-respecting install for reproducible builds
if command -v npm >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
else
  echo "npm is not installed or not on PATH." >&2
  exit 1
fi

npm run build

