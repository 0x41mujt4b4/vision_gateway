import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? [];

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? [];

        // No metadata means route is allowed for any authenticated user.
        if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
        const user = request.user;
        if (!user) {
            throw new ForbiddenException('Missing authenticated user context');
        }

        const userRole = user.role ?? 'user';
        const userPermissions = user.permissions ?? [];

        if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
            throw new ForbiddenException('Insufficient role');
        }

        if (requiredPermissions.length > 0) {
            const hasAllPermissions = requiredPermissions.every((permission) => userPermissions.includes(permission));
            if (!hasAllPermissions) {
                throw new ForbiddenException('Missing required permissions');
            }
        }

        return true;
    }
}
