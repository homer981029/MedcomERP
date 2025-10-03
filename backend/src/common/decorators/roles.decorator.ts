// src/common/decorators/roles.decorator.ts （角色登入驗證裝飾器）

import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
