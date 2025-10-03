// src/modules/leaves/dto/decision.dto.ts (請假決策 DTO 定義資料格式使用式)

import { IsOptional, IsString } from 'class-validator';
export class DecisionDto {
  @IsOptional() @IsString() comment?: string;
}
