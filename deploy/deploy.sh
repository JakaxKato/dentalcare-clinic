#!/usr/bin/env bash
# ============================================================
# DentalCare — Deploy / Update script
# ============================================================
# Usage:  bash deploy/deploy.sh [branch]
#
# Jalankan dari project root (/opt/dentalcare).
# VPS hanya melayani API (api.smiledental.my.id → PM2).
# Frontend SPA di-deploy terpisah oleh Vercel dari GitHub.
#
# - git pull latest (branch default: main)
# - install server deps (production only)
# - reload PM2
# - verify health endpoint
# ============================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${1:-main}"
TIMESTAMP="$(date +'%Y-%m-%d %H:%M:%S')"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $*"; }
err()  { echo -e "${RED}[deploy]${NC} $*" >&2; }

cd "$PROJECT_DIR"

log "=== DentalCare deploy started at $TIMESTAMP ==="

# ---- 1. Checkout & pull latest ----
# Always switch to the target branch and reset local changes so the deploy is
# reproducible and never pulled from a stale/diverged branch.
log "Switching to branch '$BRANCH'..."
git checkout "$BRANCH" 2>&1 | sed 's/^/  /' || true
git reset --hard origin/"$BRANCH" 2>&1 | sed 's/^/  /'

log "Pulling latest code from branch '$BRANCH'..."
git pull origin "$BRANCH" 2>&1 | sed 's/^/  /'

# ---- 2. Install server deps ----
log "Installing server dependencies (production)..."
cd "$PROJECT_DIR/server"
npm ci --omit=dev 2>&1 | sed 's/^/  /'

# ---- 3. Reload PM2 ----
log "Reloading PM2..."
cd "$PROJECT_DIR"
if pm2 list | grep -q dentalcare-api; then
  pm2 reload deploy/ecosystem.config.js 2>&1 | sed 's/^/  /'
else
  warn "PM2 app not running. Starting fresh..."
  pm2 start deploy/ecosystem.config.js 2>&1 | sed 's/^/  /'
  pm2 save
fi

# ---- 4. Health check ----
log "Waiting 3s for server to settle..."
sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/health || echo "000")
if [[ "$HTTP_CODE" == "200" ]]; then
  log "Health check: OK (HTTP $HTTP_CODE)"
else
  err "Health check: FAILED (HTTP $HTTP_CODE)"
  exit 1
fi

log "=== Deploy complete ==="
log "PM2 status:"
pm2 list | sed 's/^/  /'
