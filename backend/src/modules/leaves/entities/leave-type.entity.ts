// src/modules/leaves/entities/leave-type.entity.ts （請假類型）

import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'leave_types' })
export class LeaveType {
  @PrimaryColumn({ type: 'text' }) code: string;
  @Column({ name: 'name_zh', type: 'text' }) nameZh: string;
}
