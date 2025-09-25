#!/usr/bin/env bash
set -euo pipefail

# ⛔ 必須 sudo 執行
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "❌ 請使用 sudo 執行：sudo ./menu.sh"
  exit 1
fi

# 🚩 讓目前工作目錄切到「本檔案所在目錄」（專案根目錄）
cd "$(dirname "$0")"
ROOT_DIR="$(pwd)"
SCRIPTS_DIR="$ROOT_DIR/scripts"

# 確保 backups 存在
mkdir -p "$ROOT_DIR/backups"

echo
echo "========= Medcom ERP 工具選單 ========="
echo "1) 開發模式：啟動 (dev up)"
echo "2) 開發模式：停止 (dev down)"
echo "3) 開發模式：查看日誌 (frontend/backend)"
echo "4) 正式模式：啟動 (prod up)"
echo "5) 正式模式：停止 (prod down)"
echo "6) 備份 Postgres Volume → backups/"
echo "7) 還原 Postgres Volume ← backups/"
echo "8) 狀態 (dev)"
echo "9) 狀態 (prod)"
echo "0) 離開"
echo "---------------------------------------"
read -rp "請選擇: " ans

case "${ans:-}" in
  1) bash "$SCRIPTS_DIR/dev.sh" up ;;
  2) bash "$SCRIPTS_DIR/dev.sh" down ;;
  3) read -rp "看哪個服務？(frontend/backend): " svc; bash "$SCRIPTS_DIR/dev.sh" logs "${svc:-frontend}" ;;
  4) bash "$SCRIPTS_DIR/prod.sh" up ;;
  5) bash "$SCRIPTS_DIR/prod.sh" down ;;
  6) bash "$SCRIPTS_DIR/backup_volume.sh" ;;
  7) bash "$SCRIPTS_DIR/restore_volume.sh" ;;
  8) bash "$SCRIPTS_DIR/dev.sh" ps ;;
  9) bash "$SCRIPTS_DIR/prod.sh" ps ;;
  0) echo "Bye!"; exit 0 ;;
  *) echo "❌ 無效選項"; exit 1 ;;
esac
