import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC, PERMISSIONS_KEY, ROLES_KEY, AuthenticatedUser } from './auth.decorators.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    const permissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!roles?.length && !permissions?.length) return true;
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    if (!request.user || (roles?.length && !roles.includes(request.user.role))) throw new ForbiddenException('Tu rol no tiene acceso a este módulo.');
    if (permissions?.length && !permissions.every((permission) => request.user?.permissions.includes(permission))) {
      throw new ForbiddenException('Tu rol no tiene los permisos requeridos para esta acción.');
    }
    return true;
  }
}
