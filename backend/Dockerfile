# ===== Build =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# 可選：若你仍希望在 build 階段排除 uploads，可交由 .dockerignore 處理
RUN npm run build

# ===== Run =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 建立可寫 uploads 目錄（即便未掛載也存在）
RUN mkdir -p /app/uploads && chown -R node:node /app
# 你若不打算使用 node 使用者，可省略 chown；預設 root 也能寫。

# 僅帶執行所需檔案
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 可選：若你的專案有 public 靜態檔案（非 uploads），帶入
# COPY --from=builder /app/public ./public

EXPOSE 4000
CMD ["npm","run","start:prod"]
