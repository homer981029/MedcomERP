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

# 讀 .env（拿到 PG_VOLUME_NAME）
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ROOT_DIR/.env"
  set +a
fi

PG_VOLUME_NAME="${PG_VOLUME_NAME:-medcom_erp_pgdata}"

echo "⚠️ 即將清除 MedcomERP 專案的容器、鏡像與 volume："
echo "   - Volume: $PG_VOLUME_NAME"
echo "   - Images: medcom_erp_*"
echo
read -rp "確認要刪除？(yes/NO): " confirm
[ "${confirm:-}" = "yes" ] || { echo "已取消。"; exit 0; }

# 1) 停止並刪掉 dev/prod compose 容器
docker compose -f "$ROOT_DIR/docker-compose.dev.yml" down -v || true
docker compose -f "$ROOT_DIR/docker-compose.prod.yml" down -v || true

# 2) 刪掉專案相關的鏡像（名稱含 medcom_erp_）
docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' \
  | grep '^medcom_erp_' \
  | while read -r repo img_id; do
      echo "🗑️  刪除 image $repo ($img_id)"
      docker rmi -f "$img_id" || true
    done

# 3) 刪掉 Postgres volume
if docker volume inspect "$PG_VOLUME_NAME" >/dev/null 2>&1; then
  echo "🗑️  刪除 volume: $PG_VOLUME_NAME"
  docker volume rm -f "$PG_VOLUME_NAME"
fi

echo "✅ 已完成清理"
