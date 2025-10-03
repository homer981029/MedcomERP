// src/common/decorators/current-user.decorator.ts (裝飾器 用於解包目前使用者資訊)

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  id: string;
  role?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest();
    if (req.user?.id) return req.user;             // 未來接上 JwtStrategy 後可用
    const hdr = req.headers['x-user-id'];
    if (typeof hdr === 'string' && hdr) return { id: hdr };
    throw new Error('No current user (missing JWT or x-user-id header)');
  },
);
