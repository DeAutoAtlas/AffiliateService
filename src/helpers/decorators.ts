import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AdminPublisherGuard } from 'src/auth/guards/admin-publisher.guard';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ROLES_KEY } from 'src/constants';
import { UserRole } from 'src/types/types';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export function AuthWithRole(...roles: UserRole[]) {
  let guards;
  if (roles.includes('admin') && roles.length === 1) {
    guards = UseGuards(ApiKeyGuard, RolesGuard);
  } else if (roles.includes('publisher') && roles.length === 1) {
    guards = UseGuards(JwtAuthGuard, RolesGuard);
  } else {
    guards = UseGuards(AdminPublisherGuard, RolesGuard);
  }
  return applyDecorators(Roles(...roles), guards);
}
