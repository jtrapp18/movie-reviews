#!/usr/bin/env bash

set -euo pipefail

# Start the Flask API with the built React frontend, mirroring the Docker/Railway setup.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${REPO_ROOT}"

# Ensure production mode so Flask serves from client/dist
export FLASK_ENV=production
export PORT="${PORT:-8000}"

# 1) Build the frontend bundle
echo "Building frontend..."
"${REPO_ROOT}/build_frontend.sh"

# 2) Optionally activate a virtualenv if present
if [ -d ".venv" ]; then
  echo "Activating virtualenv .venv..."
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

# 3) Install backend dependencies and editable server package
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt
pip install -e ./server

# 4) Start Gunicorn (same command used in Dockerfile)
echo "Starting Gunicorn on 0.0.0.0:${PORT}..."
exec gunicorn --chdir server --log-level info -b 0.0.0.0:"${PORT}" app:app
