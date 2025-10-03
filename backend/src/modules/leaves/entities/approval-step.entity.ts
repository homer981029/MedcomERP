// src/modules/leaves/entities/approval-step.entity.ts (請假審核步驟實體 定義 approval_steps 資料表結構)

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'approval_steps' })
export class ApprovalStep {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;

  @Column({ name: 'step_order', type: 'integer' })
  stepOrder: number;

  @Column({ name: 'role_required', type: 'text' })
  roleRequired: 'manager' | 'hr';

  @Column({ name: 'approver_id', type: 'uuid', nullable: true })
  approverId: string | null;

  @Column({ type: 'text', default: 'pending' })
  decision: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
  decidedAt?: Date | null;
}
