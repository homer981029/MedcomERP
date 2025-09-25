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

# 1) 列出所有備份檔
mapfile -t BK_LIST < <(find "$BACKUPS_DIR" -maxdepth 1 -type f -name "*.tar.gz" | sort)
if [ "${#BK_LIST[@]}" -eq 0 ]; then
  echo "❌ 找不到任何備份（$BACKUPS_DIR/*.tar.gz）"
  exit 1
fi

echo "📦 可用備份："
i=1
for f in "${BK_LIST[@]}"; do
  echo "  $i) $(basename "$f")"
  i=$((i+1))
done

# 2) 選擇要還原哪一個
read -rp "請輸入要還原的編號: " idx
if ! [[ "$idx" =~ ^[0-9]+$ ]] || [ "$idx" -lt 1 ] || [ "$idx" -gt "${#BK_LIST[@]}" ]; then
  echo "❌ 無效的編號"
  exit 1
fi
TAR_PATH="${BK_LIST[$((idx-1))]}"
TAR_DIR="$(dirname "$TAR_PATH")"
TAR_BASENAME="$(basename "$TAR_PATH")"

echo "⚠️ 將以 $TAR_BASENAME 還原到 Docker Volume：$PG_VOLUME_NAME"
read -rp "確認還原？(yes/NO): " confirm
[ "${confirm:-}" = "yes" ] || { echo "已取消。"; exit 0; }

# 3) 停掉 dev/prod（若在跑）
docker compose -f "$ROOT_DIR/docker-compose.dev.yml" down || true
docker compose -f "$ROOT_DIR/docker-compose.prod.yml" down || true

# 4) 確保目標 volume 存在
docker volume create "$PG_VOLUME_NAME" >/dev/null

# 5) 清空並還原到 $PGDATA（去掉頂層 data/；清空包含隱藏檔；還原後修正權限）
docker run --rm \
  -e TAR_BASENAME="$TAR_BASENAME" \
  -v "${PG_VOLUME_NAME}:/var/lib/postgresql/data" \
  -v "${TAR_DIR}:/backup" \
  alpine:3.20 sh -lc '
    set -e
    apk add --no-cache tar >/dev/null
    # 清空 PGDATA（包含隱藏檔）
    find /var/lib/postgresql/data -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    # 解壓，剝掉最上層 data/（我們的備份是從 data/ 打包）
    tar -C /var/lib/postgresql/data --strip-components=1 -xzf "/backup/${TAR_BASENAME}"
  '

# 6) 修正擁有者與權限（用官方鏡像確保 UID/GID 正確）
docker run --rm -u root \
  -v "${PG_VOLUME_NAME}:/var/lib/postgresql/data" \
  postgres:16-alpine sh -lc '
    chown -R postgres:postgres /var/lib/postgresql/data && chmod 700 /var/lib/postgresql/data
  '

echo "✅ 還原完成到 Volume：$PG_VOLUME_NAME"
echo "👉 請重新啟動 dev 或 prod：sudo ./menu.sh"
