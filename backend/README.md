

# 專案結構
/Desktop/MedcomERP/backend/src$ tree -la
.
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── common
│   ├── decorators
│   ├── dto
│   ├── filters
│   ├── guards
│   ├── interceptors
│   ├── pipes
│   └── utils
├── config
│   ├── config.module.ts
│   └── config.service.ts
├── database
│   ├── prisma
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── typeorm
│       └── typeorm.module.ts
├── main.ts
└── modules
    ├── auth
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   ├── dto
    │   │   ├── login.dto.ts
    │   │   └── register.dto.ts
    │   ├── guards
    │   └── strategies
    ├── courses
    └── users
        ├── dto
        │   ├── create-user.dto.ts
        │   └── update-user.dto.ts
        ├── entities
        │   └── user.entity.ts
        ├── users.controller.ts
        ├──  users.module.ts
        ├── users.repository.ts
        └── users.service.ts


# 資料流向
資料清洗端（入口前）：

Guards：能不能進來（身分/權限）

Interceptors (before)：先套一層外衣（例如開始計時、設定 correlationId）

Pipes + Param Decorators：把請求驗證/轉型/解包成 handler 參數

Filters：在任一層出錯都會接住



功能端（進門後）：

dto + entities：定義資料結構 

Controller：接已驗證好的參數調用dto 呼叫 Service 處理 

Service：商業規則/流程 

Repository + ORM + 調用 entities：純資料存取 

Interceptors (after)：統一成功回包、寫日誌、快取結果
# 請假流程：
1.AuthGuard/JwtStrategy 解析 JWT 取 userId。
  DTO + ValidationPipe 驗證欄位（時間格式、必填等）。
  Service 開交易（Transaction）：
2.撈使用者基本資料（一次取齊）
決定審核路線 看角色為誰 
role='employee' → 兩步：manager → hr 
role='manager' → 直接 hr
3.從前端的 startAt/endAt（+08:00）轉成 TIMESTAMPTZ 存；
4.leave_balances 檢查餘額（事假通常也有限額，若你要控管）
5.
寫主單 leave_requests
寫附件 leave_attachments

6.建立審核步驟 approval_steps
計算請假 hours（小時）

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
