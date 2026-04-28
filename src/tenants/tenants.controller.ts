import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Tenant } from './schemas/tenant.schema';
import CreateTenantDto from './dto/create-tenant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RbacGuard } from 'src/auth/guards/rbac.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import UpdateTenantDto from './dto/update-tenant.dto';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    private assertMasterTenant(request: { isMasterTenant?: boolean }) {
        if (!request.isMasterTenant) {
            throw new ForbiddenException('Tenant management is allowed only for master tenant users');
        }
    }

    @Post()
    @Roles('admin')
    @Permissions('tenants:create')
    createTenant(@Body() tenantDto: CreateTenantDto, @Req() request: { isMasterTenant?: boolean }): Promise<Tenant> {
        this.assertMasterTenant(request);
        return this.tenantsService.createTenant(tenantDto);
    }

    @Get()
    @Roles('admin')
    @Permissions('tenants:read')
    getTenants(@Req() request: { isMasterTenant?: boolean }): Promise<Tenant[]> {
        this.assertMasterTenant(request);
        return this.tenantsService.getTenants();
    }

    @Patch(':id')
    @Roles('admin')
    @Permissions('tenants:create')
    updateTenant(
        @Param('id') id: string,
        @Body() updates: UpdateTenantDto,
        @Req() request: { isMasterTenant?: boolean },
    ): Promise<Tenant> {
        this.assertMasterTenant(request);
        return this.tenantsService.updateTenantById(id, updates);
    }
}
