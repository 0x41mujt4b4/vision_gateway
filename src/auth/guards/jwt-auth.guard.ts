import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Claims embedded in the access JWT from `POST /auth/login`.
 * `role` and `permissions` are always issued on new tokens (defaults applied at sign-in).
 */
export interface JwtPayload {
    sub: string;
    email: string;
    tenantId: string;
    tenantDomain: string;
    tenantDbName?: string;
    isMasterTenant?: boolean;
    role: string;
    permissions: string[];
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
