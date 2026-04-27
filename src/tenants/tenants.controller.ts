import { Body, Controller, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Tenant } from './schemas/tenant.schema';
import CreateTenantDto from './dto/create-tenant.dto';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    createTenant(@Body() tenantDto: CreateTenantDto): Promise<Tenant> {
        return this.tenantsService.createTenant(tenantDto);
    }
}
