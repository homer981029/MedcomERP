// src/modules/leaves/leaves.module.ts ()

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveAttachment } from './entities/leave-attachment.entity';
import { ApprovalStep } from './entities/approval-step.entity';
import { Notification } from './entities/notification.entity';
import { Department } from './entities/department.entity';
import { LeaveType } from './entities/leave-type.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveRequest, LeaveAttachment, ApprovalStep, Notification, Department, LeaveType, User,
    ]),
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
