import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Role } from '../../../domain/common/roles.js';

export const IS_PUBLIC = 'isPublicRoute';
export const ROLES_KEY = 'allowedRoles';
export const PERMISSIONS_KEY = 'requiredPermissions';
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
export interface AuthenticatedUser { readonly sub: string; readonly email: string; readonly role: Role; readonly permissions: readonly string[]; readonly displayName: string; }
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser =>
  context.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user,
);
