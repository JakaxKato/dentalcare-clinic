#!/usr/bin/env bash
# ============================================================
# DentalCare — MongoDB restore script
# ============================================================
# Usage:
#   ./scripts/restore-mongo.sh /path/to/dentalcare_YYYYMMDD_HHMMSS.archive.gz
#
# Restores into the database in MONGO_URI from server/.env.
# WARNING: --drop replaces existing collections. Confirm before running in prod.

set -euo pipefail

ARCHIVE="${1:-}"
if [[ -z "$ARCHIVE" || ! -f "$ARCHIVE" ]]; then
  echo "Usage: $0 <archive.gz>" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/server/.env"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

if [[ -z "${MONGO_URI:-}" ]]; then
  echo "[restore] ERROR: MONGO_URI not set" >&2
  exit 1
fi

read -r -p "[restore] This will DROP existing collections in $MONGO_URI. Continue? (y/N) " yn
[[ "$yn" =~ ^[Yy]$ ]] || { echo "aborted."; exit 0; }

mongorestore --uri="$MONGO_URI" --archive="$ARCHIVE" --gzip --drop
echo "[restore] done."
