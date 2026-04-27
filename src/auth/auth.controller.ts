import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TenantDomain, TenantId } from 'src/tenants/decorators/tenant.decorator';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(200)
    login(
        @Body() credentials: CredentialsDto,
        @TenantId() tenantId: string,
        @TenantDomain() tenantDomain: string,
    ): Promise<{ access_token: string }> {
        return this.authService.signIn(credentials, tenantId, tenantDomain);
    }
}
