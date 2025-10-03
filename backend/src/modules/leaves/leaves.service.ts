// src/modules/leaves/leaves.service.ts  （Service（審核路線 + 建單 + 通知 + 核准/退回）

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveAttachment } from './entities/leave-attachment.entity';
import { ApprovalStep } from './entities/approval-step.entity';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeavesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(LeaveRequest) private readonly reqRepo: Repository<LeaveRequest>,
    @InjectRepository(ApprovalStep) private readonly stepRepo: Repository<ApprovalStep>,
    @InjectRepository(LeaveAttachment) private readonly attRepo: Repository<LeaveAttachment>,
    @InjectRepository(Notification) private readonly notiRepo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private parseISO(s: string) { return new Date(s); }
  private diffHours(a: Date, b: Date) { return (b.getTime() - a.getTime()) / 3600000; }

  async create(dto: CreateLeaveDto, requesterId: string) {
    const start = this.parseISO(dto.startAt);
    const end = this.parseISO(dto.endAt);
    if (end <= start) throw new BadRequestException('endAt must be after startAt');

    return await this.dataSource.transaction(async (mgr) => {
      // 1) 取申請人
      const me = await mgr.getRepository(User).findOne({ where: { id: requesterId } });
      if (!me) throw new ForbiddenException('user not found');
      if (!me.departmentId) throw new BadRequestException('user has no department');

      // 2) 找審核人
      const manager = await mgr.getRepository(User).findOne({
        where: { departmentId: me.departmentId, role: 'manager' },
      });
      const hr = await mgr.getRepository(User).findOne({ where: { role: 'hr' } });
      if (!hr) throw new BadRequestException('no HR user found');
      if (me.role !== 'manager' && !manager) throw new BadRequestException('no manager in department');

      const firstRole = me.role === 'manager' ? 'hr' : 'manager';
      const firstApprover = me.role === 'manager' ? hr.id : manager!.id;

      // 3) 建主單
      const hours = this.diffHours(start, end); // 事假一般不扣午休
      const req = await mgr.getRepository(LeaveRequest).save({
        kind: 'apply',
        requesterId: me.id,
        departmentId: me.departmentId,
        leaveCode: dto.leaveCode,
        startAt: start,
        endAt: end,
        hours,
        reason: dto.reason ?? null,
        description: dto.description ?? null,
        status: firstRole === 'manager' ? 'pending_manager' : 'pending_hr',
      });

      // 4) 附件
      if (dto.attachments?.length) {
        const rows = dto.attachments.map(a => mgr.getRepository(LeaveAttachment).create({
          requestId: req.id,
          filePath: a.path,
          originalName: a.originalName ?? null,
          contentType: a.contentType ?? null,
          sizeBytes: a.sizeBytes ?? null,
        }));
        await mgr.getRepository(LeaveAttachment).save(rows);
      }

      // 5) 建審核步驟
      const steps: Partial<ApprovalStep>[] = [];
      if (me.role !== 'manager') {
        steps.push({ requestId: req.id, stepOrder: 1, roleRequired: 'manager', approverId: manager!.id, decision: 'pending' });
        steps.push({ requestId: req.id, stepOrder: 2, roleRequired: 'hr',      approverId: hr.id,        decision: 'pending' });
      } else {
        steps.push({ requestId: req.id, stepOrder: 1, roleRequired: 'hr', approverId: hr.id, decision: 'pending' });
      }
      await mgr.getRepository(ApprovalStep).save(steps);

      // 6) 通知第一關
      await mgr.getRepository(Notification).save({
        userId: firstApprover,
        type: 'leave_pending',
        refType: 'leave_request',
        refId: req.id,
        payload: { leaveCode: dto.leaveCode, hours, requester: me.nickname },
      });

      return req;
    });
  }

  async myPending(approverId: string) {
    return this.stepRepo.createQueryBuilder('s')
      .innerJoin(LeaveRequest, 'r', 'r.id = s.request_id')
      .innerJoin(User, 'u', 'u.id = r.requester_id')
      .select([
        's.request_id AS requestId',
        's.step_order AS stepOrder',
        's.role_required AS roleRequired',
        'r.leave_code AS leaveCode',
        'r.start_at AS startAt',
        'r.end_at AS endAt',
        'r.status AS status',
        'u.nickname AS requester',
        'u.email AS email',
      ])
      .where('s.approver_id = :uid AND s.decision = :d', { uid: approverId, d: 'pending' })
      .orderBy('r.created_at', 'DESC')
      .getRawMany();
  }

  async approve(requestId: string, approverId: string, comment?: string) {
    return this.dataSource.transaction(async (mgr) => {
      // 1) 找到我該簽的 pending 步驟
      const step = await mgr.getRepository(ApprovalStep).findOne({
        where: { requestId, approverId, decision: 'pending' },
      });
      if (!step) throw new ForbiddenException('Not your pending step');

      // 2) 這一步通過
      await mgr.getRepository(ApprovalStep).update(step.id, {
        decision: 'approved', comment: comment ?? null, decidedAt: new Date(),
      });

      // 3) 檢查是否還有下一步
      const next = await mgr.getRepository(ApprovalStep).createQueryBuilder('s')
        .where('s.request_id = :rid AND s.decision = :d', { rid: requestId, d: 'pending' })
        .orderBy('s.step_order', 'ASC')
        .getOne();

      if (next) {
        await mgr.getRepository(LeaveRequest).update(requestId, {
          status: next.roleRequired === 'hr' ? 'pending_hr' : 'pending_manager',
        });
        await mgr.getRepository(Notification).save({
          userId: next.approverId!,
          type: 'leave_pending',
          refType: 'leave_request',
          refId: requestId,
          payload: { goto: next.roleRequired },
        });
        return { advancedTo: next.roleRequired };
      }

      // 4) 最後一關：結案 + 扣餘額 + 通知申請人
      await mgr.getRepository(LeaveRequest).update(requestId, { status: 'approved' });
      const req = await mgr.getRepository(LeaveRequest).findOneOrFail({ where: { id: requestId } });

      // 扣餘額（若沒有該筆，先插 0 再扣）
      await mgr.query(
        `INSERT INTO leave_balances(user_id, leave_code, hours)
         VALUES ($1, $2, 0)
         ON CONFLICT (user_id, leave_code) DO NOTHING`,
        [req.requesterId, req.leaveCode],
      );
      await mgr.query(
        `UPDATE leave_balances SET hours = hours - $1
         WHERE user_id = $2 AND leave_code = $3`,
        [req.hours, req.requesterId, req.leaveCode],
      );

      await mgr.getRepository(Notification).save({
        userId: req.requesterId,
        type: 'leave_approved',
        refType: 'leave_request',
        refId: requestId,
        payload: { leaveCode: req.leaveCode, hours: req.hours },
      });

      return { approved: true };
    });
  }

  async reject(requestId: string, approverId: string, comment?: string) {
    return this.dataSource.transaction(async (mgr) => {
      const step = await mgr.getRepository(ApprovalStep).findOne({
        where: { requestId, approverId, decision: 'pending' },
      });
      if (!step) throw new ForbiddenException('Not your pending step');

      await mgr.getRepository(ApprovalStep).update(step.id, {
        decision: 'rejected', comment: comment ?? null, decidedAt: new Date(),
      });

      await mgr.getRepository(LeaveRequest).update(requestId, { status: 'rejected' });
      const req = await mgr.getRepository(LeaveRequest).findOneOrFail({ where: { id: requestId } });

      await mgr.getRepository(Notification).save({
        userId: req.requesterId,
        type: 'leave_rejected',
        refType: 'leave_request',
        refId: requestId,
        payload: { comment: comment ?? '' },
      });

      return { rejected: true };
    });
  }
}
