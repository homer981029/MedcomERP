// src/modules/auth/dto/register.dto.ts (註冊用戶的 DTO)


import { IsEmail, IsIn, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nickname: string;

  @IsIn(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @IsOptional() @IsUUID()
  departmentId?: string;

  @IsOptional() @IsString()
  titleCode?: string;

  @IsOptional() @IsUUID()
  shiftId?: string;

  // 由 admin 指定職務角色（不開放 'admin'）
  @IsOptional() @IsIn(['employee','manager','hr'])
  role?: 'employee' | 'manager' | 'hr';
}
