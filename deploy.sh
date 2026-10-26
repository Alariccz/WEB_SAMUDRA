#!/usr/bin/env bash
set -euo pipefail

echo "🚀 [1/4] Building image Docker web-samudra..."
docker compose build

echo "🔄 [2/4] Restarting container web-samudra..."
docker compose down || true
docker compose up -d

echo "🧹 [3/4] Cleaning dangling images..."
docker image prune -f

echo "✅ [4/4] Container status:"
docker compose ps
