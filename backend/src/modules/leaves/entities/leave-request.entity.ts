// src/modules/leaves/entities/leave-request.entity.ts (請假申請實體 定義 leave_requests 資料表結構)


import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

const num = {
  to: (v: number) => v,
  from: (v: string | null) => (v == null ? null : parseFloat(v)),
};

@Entity({ name: 'leave_requests' })
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'text', default: 'apply' })
  kind: 'apply' | 'cancel';

  @Column({ name: 'original_request_id', type: 'uuid', nullable: true })
  originalRequestId: string | null;

  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @Column({ name: 'leave_code', type: 'text' })
  leaveCode: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({ type: 'numeric', transformer: num })
  hours: number;

  @Column({ type: 'text', nullable: true }) reason?: string | null;
  @Column({ type: 'text', nullable: true }) description?: string | null;

  @Column({ type: 'text', default: 'pending_manager' })
  status:
    | 'draft'
    | 'pending_manager'
    | 'pending_hr'
    | 'approved'
    | 'rejected'
    | 'canceled';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
