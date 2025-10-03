// src/modules/leaves/entities/leave-attachment.entity.ts (請假附件實體 定義 leave_attachments 資料表結構)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'leave_attachments' })
export class LeaveAttachment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @Column({ name: 'original_name', type: 'text', nullable: true })
  originalName?: string | null;

  @Column({ name: 'content_type', type: 'text', nullable: true })
  contentType?: string | null;

  @Column({ name: 'size_bytes', type: 'integer', nullable: true })
  sizeBytes?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
