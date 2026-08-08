import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../shared';

/**
 * RolesGuard (RBAC Authorization Engine)
 * Intercepts execution after authentication to ensure authenticated user possesses
 * the requisite UserRole tier (Admin, Seller, or Customer) specified via @Roles().
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No explicit role restrictions assigned to endpoint
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: Unauthorized role privileges');
    }

    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
    if (!hasRequiredRole) {
      throw new ForbiddenException(`Access denied: Required privileges: [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
}
