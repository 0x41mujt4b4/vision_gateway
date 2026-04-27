import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../guards/jwt-auth.guard';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.tenantId) {
      throw new UnauthorizedException('Token missing tenant context; sign in again');
    }
    // Normalize legacy tokens that predate role/permissions claims.
    const role = typeof payload.role === 'string' && payload.role.trim() !== '' ? payload.role : 'user';
    const permissions = Array.isArray(payload.permissions) ? payload.permissions : [];
    return {
      ...payload,
      role,
      permissions,
    };
  }
}
