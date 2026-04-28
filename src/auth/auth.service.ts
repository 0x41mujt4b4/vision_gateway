import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { CredentialsDto } from './dto/credentials.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async signIn(
        credentials: CredentialsDto,
        tenantId: string,
        tenantDomain: string,
        tenantDbName: string,
        isMasterTenant: boolean,
    ): Promise<{ access_token: string }> {
        let user;
        try {
            user = await this.usersService.getUserByEmailAndTenant(credentials.email, tenantId);
        } catch (err) {
            // getUserByEmailAndTenant throws NotFoundException when missing; for login
            // we surface that as 401 to avoid leaking whether the account exists.
            if (err instanceof NotFoundException) {
                throw new UnauthorizedException('Invalid username or password');
            }
            throw err;
        }

        const passwordMatches = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const sub = String((user as { _id?: unknown })._id ?? '');
        const role = typeof user.role === 'string' && user.role.trim() !== '' ? user.role : 'user';
        const permissions = Array.isArray(user.permissions) ? user.permissions : [];

        const payload = {
            sub,
            email: user.email,
            tenantId: String(tenantId),
            tenantDomain,
            tenantDbName,
            isMasterTenant: Boolean(isMasterTenant),
            role,
            permissions,
        };
        return { access_token: await this.jwtService.signAsync(payload) };
    }
}
