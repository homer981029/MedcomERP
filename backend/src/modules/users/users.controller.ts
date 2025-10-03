// src/modules/users/users.controller.ts (使用者 控制器 負責處理使用者相關請求)

import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('health')
  ping() { return { ok: true }; }
}
