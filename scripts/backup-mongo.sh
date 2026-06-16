#!/usr/bin/env bash
# ============================================================
# DentalCare — MongoDB backup script (cron-friendly)
# ============================================================
# Usage:
#   - Manual: ./scripts/backup-mongo.sh
#   - Cron:   0 2 * * * /opt/dentalcare/scripts/backup-mongo.sh >> /var/log/dentalcare-backup.log 2>&1
#
# Reads MONGO_URI from server/.env. Stores compressed dumps in BACKUP_DIR
# (default /var/backups/dentalcare). Retains last RETENTION_DAYS (default 14).
# Exits non-zero on failure so cron mailing kicks in.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/server/.env"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/dentalcare}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
ARCHIVE="${BACKUP_DIR}/dentalcare_${TIMESTAMP}.archive.gz"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

if [[ -z "${MONGO_URI:-}" ]]; then
  echo "[backup] ERROR: MONGO_URI not set (check $ENV_FILE)" >&2
  exit 1
fi

if ! command -v mongodump >/dev/null 2>&1; then
  echo "[backup] ERROR: mongodump not installed. Install mongodb-database-tools." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "[backup] $(date -Iseconds) starting dump → $ARCHIVE"
mongodump --uri="$MONGO_URI" --archive="$ARCHIVE" --gzip
echo "[backup] OK ($(du -h "$ARCHIVE" | cut -f1))"

echo "[backup] cleaning archives older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name 'dentalcare_*.archive.gz' -type f -mtime +"${RETENTION_DAYS}" -print -delete

echo "[backup] done."
