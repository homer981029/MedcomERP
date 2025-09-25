#!/usr/bin/env bash
set -euo pipefail

# ⛔ 必須 sudo
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "❌ 請用 sudo 執行：sudo bash $0"
  exit 1
fi

# 🧭 定位到 scripts，再回根目錄
cd "$(dirname "$0")"
ROOT_DIR="$(cd .. && pwd)"
BACKUPS_DIR="$ROOT_DIR/backups"

# 讀 .env（若存在）
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ROOT_DIR/.env"
  set +a
fi

PG_VOLUME_NAME="${PG_VOLUME_NAME:-medcom_erp_pgdata}"
PG_BACKUP_BASENAME="${PG_BACKUP_BASENAME:-pg_backup.tar.gz}"

mkdir -p "$BACKUPS_DIR"

# 1) 檔名策略：是否用日期檔名？
read -rp "是否使用日期建立檔名？(Y/N) " use_date
use_date="${use_date:-N}"
ts="$(date +%Y%m%d-%H%M%S)"

if [[ "$use_date" =~ ^[Yy]$ ]]; then
  OUT_FILE="$BACKUPS_DIR/pg_backup-${ts}.tar.gz"
else
  OUT_FILE="$BACKUPS_DIR/$PG_BACKUP_BASENAME"
fi

echo "🔒 備份 Volume：$PG_VOLUME_NAME → $OUT_FILE"

# 2) 執行備份（把 $PGDATA 內容打包；用環境變數把檔名帶進容器）
docker run --rm \
  -e OUT_BASENAME="$(basename "$OUT_FILE")" \
  -v "${PG_VOLUME_NAME}:/var/lib/postgresql/data:ro" \
  -v "${BACKUPS_DIR}:/backup" \
  alpine:3.20 sh -lc '
    set -e
    apk add --no-cache tar >/dev/null
    tar -C /var/lib/postgresql/data -czf "/backup/${OUT_BASENAME}" .
  '

# 3) 調整檔案擁有者為「目前操作者」
TARGET_USER="${SUDO_USER:-}"
if [ -z "$TARGET_USER" ]; then
  TARGET_UID=$(stat -c %u "$BACKUPS_DIR")
  TARGET_GID=$(stat -c %g "$BACKUPS_DIR")
  chown "$TARGET_UID:$TARGET_GID" "$OUT_FILE"
else
  chown "$TARGET_USER:$TARGET_USER" "$OUT_FILE" || true
fi

# 4) 確保 backups/ 內檔案可寫
chmod -R a+w "$BACKUPS_DIR"

echo "✅ 完成：$OUT_FILE"
