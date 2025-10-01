#!/usr/bin/env bash
set -euo pipefail

# ⛔ 必須 sudo
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "❌ 請用 sudo 執行：sudo bash $0"
  exit 1
fi

# 🧭 定位到根目錄
cd "$(dirname "$0")"
ROOT_DIR="$(pwd)"

while true; do
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
  echo "10) 清理目前專案"
  echo "0) 離開"
  echo "---------------------------------------"
  read -rp "請選擇: " choice

  case "$choice" in
    1) sudo "$ROOT_DIR/scripts/dev.sh" up ;;
    2) sudo "$ROOT_DIR/scripts/dev.sh" down ;;
    3)
       read -rp "選擇服務 (frontend/backend): " svc
       sudo "$ROOT_DIR/scripts/dev.sh" logs "$svc"
       ;;
    4) sudo "$ROOT_DIR/scripts/prod.sh" up ;;
    5) sudo "$ROOT_DIR/scripts/prod.sh" down ;;
    6) sudo "$ROOT_DIR/scripts/backup_volume.sh" ;;
    7) sudo "$ROOT_DIR/scripts/restore_volume.sh" ;;
    8) sudo "$ROOT_DIR/scripts/dev.sh" ps ;;
    9) sudo "$ROOT_DIR/scripts/prod.sh" ps ;;
    10) sudo "$ROOT_DIR/scripts/clean_project.sh" ;;
    0) exit 0 ;;
    *) echo "❌ 無效的選項" ;;
  esac
done
