#!/usr/bin/env bash
set -euo pipefail

# ⛔ 必須 sudo
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "❌ 請用 sudo 執行：sudo bash $0 ..."
  exit 1
fi

# 🧭 到 scripts 目錄，再定位到專案根目錄
cd "$(dirname "$0")"
ROOT_DIR="$(cd .. && pwd)"

COMPOSE=("docker" "compose" "-f" "$ROOT_DIR/docker-compose.dev.yml")

cmd="${1:-}"
arg="${2:-}"

case "$cmd" in
  up)
    "${COMPOSE[@]}" up -d --build
    ;;
  down)
    "${COMPOSE[@]}" down
    ;;
  logs)
    svc="${arg:-frontend}"
    "${COMPOSE[@]}" logs -f "$svc"
    ;;
  ps)
    "${COMPOSE[@]}" ps
    ;;
  *)
    echo "用法: $0 {up|down|logs [frontend|backend]|ps}"
    exit 1
    ;;
esac
