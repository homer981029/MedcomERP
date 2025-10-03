// src/modules/auth/auth.service.ts （登入邏輯）

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('帳號或密碼錯誤');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('帳號或密碼錯誤');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
    };
  }

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    const user = this.users.create({
      email: dto.email,
      nickname: dto.nickname,
      gender: dto.gender,
      passwordHash: hash,
      role: dto.role ?? 'employee', // 只允許 employee/manager/hr
      departmentId: dto.departmentId ?? null,
      titleCode: dto.titleCode ?? null,
      shiftId: dto.shiftId ?? null,
    });

    try {
      const saved = await this.users.save(user);
      const payload = { sub: saved.id, email: saved.email, role: saved.role };
      const accessToken = await this.jwt.signAsync(payload);
      return {
        accessToken,
        user: { id: saved.id, email: saved.email, nickname: saved.nickname, role: saved.role },
      };
    } catch (e: any) {
      if (e?.code === '23505') throw new ConflictException('Email 已被註冊');
      throw e;
    }
  }
}
