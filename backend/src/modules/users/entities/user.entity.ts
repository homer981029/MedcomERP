// src/modules/users/entities/user.entity.ts (使用者實體 定義 users 資料表結構)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'citext', unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  nickname: string;

  @Column({ type: 'varchar', length: 10 })
  gender: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ name: 'title_code', type: 'text', nullable: true })
  titleCode: string | null;

  @Column({ type: 'text', default: 'employee' })
  role: 'employee' | 'manager' | 'hr' | 'admin';

  @Column({ name: 'shift_id', type: 'uuid', nullable: true })
  shiftId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
