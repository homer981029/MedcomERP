// src/modules/leaves/entities/department.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'departments' })
export class Department {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'text', unique: true }) name: string;
  @Column({ name: 'parent_id', type: 'uuid', nullable: true }) parentId: string | null;
}
