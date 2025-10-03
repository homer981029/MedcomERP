// src/modules/leaves/dto/create-leave.dto.ts (請假建立 DTO 定義資料格使用式)

import { IsISO8601, IsString, IsOptional, IsArray, IsIn, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentDto {
  @IsString() path: string;
  @IsOptional() @IsString() originalName?: string;
  @IsOptional() @IsString() contentType?: string;
  @IsOptional() @Type(() => Number) @IsNumber() sizeBytes?: number;
}

export class CreateLeaveDto {
  @IsIn(['annual', 'sick', 'personal', 'official', 'comp', 'marriage', 'bereavement', 'paternity', 'injury'])
  leaveCode: string;

  @IsISO8601() startAt: string;  // e.g. "2025-10-05T09:00:00+08:00"
  @IsISO8601() endAt: string;

  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsArray() attachments?: AttachmentDto[];
}
