#!/usr/bin/env bash
# ============================================================
# DentalCare — Deploy / Update script
# ============================================================
# Usage:  bash deploy/deploy.sh [branch]
#
# Jalankan dari project root (/opt/dentalcare).
# - git pull latest (branch default: main)
# - install server deps (production only)
# - build client (with VITE env from client/.env)
# - copy dist/ to nginx serve path
# - reload PM2
# - verify health endpoint
# ============================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${1:-main}"
NGINX_ROOT="/var/www/dentalcare/client"
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

# ---- 3. Install & build client ----
log "Building client..."
cd "$PROJECT_DIR/client"
npm ci 2>&1 | sed 's/^/  /'

# Source .env for VITE_ vars
if [[ -f "$PROJECT_DIR/client/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$PROJECT_DIR/client/.env"
  set +a
fi

npm run build 2>&1 | sed 's/^/  /'

if [[ ! -d "$PROJECT_DIR/client/dist" ]]; then
  err "Build failed — client/dist/ not found."
  exit 1
fi

# ---- 4. Copy dist to nginx root ----
log "Copying dist/ → $NGINX_ROOT/dist/"
sudo mkdir -p "$NGINX_ROOT"
sudo rm -rf "$NGINX_ROOT/dist"
sudo cp -r "$PROJECT_DIR/client/dist" "$NGINX_ROOT/dist"
sudo chown -R www-data:www-data "$NGINX_ROOT"

# ---- 5. Reload PM2 ----
log "Reloading PM2..."
cd "$PROJECT_DIR"
if pm2 list | grep -q dentalcare-api; then
  pm2 reload deploy/ecosystem.config.js 2>&1 | sed 's/^/  /'
else
  warn "PM2 app not running. Starting fresh..."
  pm2 start deploy/ecosystem.config.js 2>&1 | sed 's/^/  /'
  pm2 save
fi

# ---- 6. Health check ----
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
