建立 volume: 
sudo docker volume create medcom_erp_pgdata

npm run start:dev


dev2404@Dev2404:~/Desktop/MedcomERP$ cat frontend/Dockerfile
# ===== Build =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== Run =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# 只帶執行所需
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm","run","start"]
dev2404@Dev2404:~/Desktop/MedcomERP$ cat frontend/Dockerfile.dev 
FROM node:20-alpine
WORKDIR /app
# 可選：git/bash
RUN apk add --no-cache git bash
EXPOSE 3000
# compose 會用 bind mount 掛原始碼並跑 npm run dev
dev2404@Dev2404:~/Desktop/MedcomERP$ cat backend/Dockerfile
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
dev2404@Dev2404:~/Desktop/MedcomERP$ cat backend/Dockerfile.dev 
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache git bash
EXPOSE 4000
# compose 會用 bind mount 掛原始碼並跑 npm run start:dev
dev2404@Dev2404:~/Desktop/MedcomERP$ cat frontend/p
package.json        postcss.config.mjs  
package-lock.json   public/             
dev2404@Dev2404:~/Desktop/MedcomERP$ cat frontend/package.json 
{
  "name": "app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "next": "15.5.4"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "@eslint/eslintrc": "^3"
  }
}
dev2404@Dev2404:~/Desktop/MedcomERP$ cat docker-compose.prod.yml 

name: medcom_erp

services:
  db:
    image: postgres:16-alpine
    container_name: medcom_erp_db
    restart: unless-stopped
    ports:
      - "${BIND_IP:+${BIND_IP}:}${PG_PORT}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data 
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 3s
      retries: 10
    networks:
      - medcom_net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile         # ← prod 用（multi-stage，有 COPY + build）
    container_name: medcom_erp_backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "${NEST_PORT:-4000}:4000"
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: ${POSTGRES_USER:-medcom}
      DB_PASS: ${POSTGRES_PASSWORD:-medcom123}
      DB_NAME: ${POSTGRES_DB:-medcom_erp}
      NODE_ENV: production
      UPLOAD_DIR: /app/uploads         # 可選：程式內讀這個路徑
    working_dir: /app
    volumes:
      - ./backend/uploads:/app/uploads   # ← 僅掛 uploads（熱更新）
      # 若你在啟用 SELinux 的 Linux (如 CentOS)，可用 :Z
      # - ./backend/uploads:/app/uploads:Z
    command: ["bash","-lc","npm run start:prod"]
    networks: [ medcom_net ]

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: medcom_erp_frontend
    restart: unless-stopped
    ports:
      - "${BIND_IP:+${BIND_IP}:}${NEXTJS_PORT}:3000"
    environment:
      NODE_ENV: development
      # 之後你前端要打 API 時可用這個（也可寫到 frontend/.env.local）
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:${NEST_PORT}"
    working_dir: /app
    volumes:
      - ./frontend:/app
      - frontend_node_modules:/app/node_modules
    networks:
      - medcom_net
    command: [ "bash", "-lc", "if [ -f package.json ]; then npm run dev; else tail -f /dev/null; fi" ]

volumes:
  pgdata:
    external: true
    name: ${PG_VOLUME_NAME}
  backend_node_modules:
  frontend_node_modules:


networks:
  medcom_net:
    driver: bridge
dev2404@Dev2404:~/Desktop/MedcomERP$ cat docker-compose.dev.yml 
name: medcom_erp_dev

services:
  db:
    image: postgres:16-alpine
    container_name: medcom_erp_db
    restart: unless-stopped
    ports:
      - "${PG_PORT:-5432}:5432"               # 對外開放
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-medcom}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-medcom123}
      POSTGRES_DB: ${POSTGRES_DB:-medcom_erp}
    volumes:
      - pgdata:/var/lib/postgresql/data       # 唯一外置 volume：資料庫
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-medcom} -d ${POSTGRES_DB:-medcom_erp}"]
      interval: 10s
      timeout: 3s
      retries: 10
    networks: [ medcom_net ]

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev              # 開發版 Dockerfile
    container_name: medcom_erp_backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "${NEST_PORT:-4000}:4000"             # 對外開放
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: ${POSTGRES_USER:-medcom}
      DB_PASS: ${POSTGRES_PASSWORD:-medcom123}
      DB_NAME: ${POSTGRES_DB:-medcom_erp}
      NODE_ENV: development
    working_dir: /app
    volumes:
      - ./backend:/app                        # 以掛載方式使用本機原始碼
      - backend_node_modules:/app/node_modules
    command: ["sh","-lc","[ -d node_modules ] || (npm ci || npm install); npm run start:dev"]
    networks: [ medcom_net ]

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev              # 開發版 Dockerfile
    container_name: medcom_erp_frontend
    restart: unless-stopped
    ports:
      - "${NEXTJS_PORT:-3000}:3000"           # 對外開放
    environment:
      NODE_ENV: development
      # 如需用瀏覽器呼叫後端，請視部署主機/網域自行調整
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:${NEST_PORT:-4000}"
    working_dir: /app
    volumes:
      - ./frontend:/app                       # 以掛載方式使用本機原始碼
      - frontend_node_modules:/app/node_modules
    command: ["sh","-lc","[ -d node_modules ] || (npm ci || npm install); npm run dev"]
    networks: [ medcom_net ]

volumes:
  pgdata:
    external: true
    name: ${PG_VOLUME_NAME:-medcom_erp_pgdata}
  backend_node_modules:
  frontend_node_modules:

networks:
  medcom_net:
    driver: bridge
dev2404@Dev2404:~/Desktop/MedcomERP$ 
