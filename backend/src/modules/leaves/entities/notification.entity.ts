// src/modules/leaves/entities/notification.entity.ts (請假通知實體 定義請假通知資料表結構)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' }) type: string;       // 'leave_pending' | 'leave_approved' | 'leave_rejected'
  @Column({ name: 'ref_type', type: 'text' }) refType: string; // 'leave_request'
  @Column({ name: 'ref_id', type: 'uuid' }) refId: string;
  @Column({ type: 'jsonb', nullable: true }) payload?: any;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null;
}
