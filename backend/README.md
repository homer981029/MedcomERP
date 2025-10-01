# 進交互式 psql
docker exec -it medcom_erp_db psql -U medcom -d medcom_erp

# 容器內登入psql
psql -U medcom -d medcom_erp


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


# 資料庫表
departments：部門（可階層）

titles：職稱（如一般員工、主管、人資）

users：使用者／員工（屬於某部門與職稱）

leave_types：假別（特休、病假、事假…）

leave_requests：請假單／請假申請（含原因、時段、狀態；original_request_id 連到被取消的原單）

leave_attachments：請假附件／佐證檔（證明照片、檔案路徑…）

approval_steps：審核步驟／簽核節點（主管→人資兩階，紀錄決議與時間）

notifications：通知（誰有待簽、通過、退回等事件）

leave_balances：假期餘額／可休時數（每人各假別的可用小時）

# 資料表關聯
users.department_id → departments.id                      使用者.部門ID → 部門.ID
 
users.title_code → titles.code                            使用者.職稱代碼 → 職稱.代碼

leave_requests.requester_id → users.id                    請假單.申請人ID → 使用者.ID

leave_requests.department_id → departments.id             請假單.部門ID → 部門.ID

leave_requests.leave_code → leave_types.code              請假單.假別代碼 → 假別.代碼

leave_requests.original_request_id → leave_requests.id（自我關聯：取消單指向原單）      請假單.原單ID → 請假單.ID（取消單指向原單）

leave_attachments.request_id → leave_requests.id          請假附件.請假單ID → 請假單.ID

approval_steps.request_id → leave_requests.id             審核步驟.請假單ID → 請假單.ID

approval_steps.approver_id → users.id                     審核步驟.審核人ID → 使用者.ID

notifications.user_id → users.id                          通知.對象使用者ID → 使用者.ID

leave_balances.user_id → users.id，leave_balances.leave_code → leave_types.code  假期餘額.使用者ID → 使用者.ID，假期餘額.假別代碼 → 假別.代碼



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
