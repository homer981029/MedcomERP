//  src/modules/auth/auth.controller.ts （登入控制器 ）

import { Body, Controller, Post, UseGuards } from '@nestjs/common'; // ← DTO 全局驗證 （是在 main.ts 啟用）
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

// 一般登入  
  @Post('login')
  async login(@Body() dto: LoginDto) { 
    return this.auth.login(dto.email, dto.password);
  }

  // 只有 admin 能新增帳號
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

}
