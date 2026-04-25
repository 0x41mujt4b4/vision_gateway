import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import CredentialsDto from './dto/credentials.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async signIn(
        credentials: CredentialsDto
    ): Promise<{ access_token: string }> {
        const user = await this.usersService.getUserByEmail(credentials.email);
        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }
        if (user.password !== credentials.password) {
            throw new UnauthorizedException('Invalid username or password');
        }
        const payload = { sub: user._id, username: user.email };
        return { access_token: await this.jwtService.signAsync(payload) };
    }
}
