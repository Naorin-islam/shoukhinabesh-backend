import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../shared';

export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * Annotates endpoints with required UserRole tiers for access evaluation by RBAC guards.
 * @example @Roles(UserRole.ADMIN, UserRole.SELLER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
