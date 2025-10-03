// src/modules/leaves/leaves.controller.ts （請假模組 控制器 負責路由與權限 ）


import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'; // DTO 全局驗證 （是在 main.ts 啟用）
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { DecisionDto } from './dto/decision.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly svc: LeavesService) {}

  @Post()
  async create(@Body() dto: CreateLeaveDto, @CurrentUser() user: AuthUser) {
    return this.svc.create(dto, user.id);
  }

  @Get('/approvals/my-pending')
  async myPending(@CurrentUser() user: AuthUser) {
    return this.svc.myPending(user.id);
  }

  @Post('/approvals/:id/approve')
  async approve(@Param('id') id: string, @Body() body: DecisionDto, @CurrentUser() user: AuthUser) {
    return this.svc.approve(id, user.id, body.comment);
  }

  @Post('/approvals/:id/reject')
  async reject(@Param('id') id: string, @Body() body: DecisionDto, @CurrentUser() user: AuthUser) {
    return this.svc.reject(id, user.id, body.comment);
  }
}
