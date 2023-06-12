import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ROLES_KEY } from 'src/constants';
import { UserRole } from 'src/types/types';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export function AuthWithRole(...roles: UserRole[]) {
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
