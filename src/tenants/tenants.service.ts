import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './schemas/tenant.schema';
import { Model } from 'mongoose';
import CreateTenantDto from './dto/create-tenant.dto';

function defaultDbNameFromDomain(domain: string): string {
    return domain
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'tenant';
}

@Injectable()
export class TenantsService {
    constructor(@InjectModel(Tenant.name) private tenantModel: Model<Tenant>) {}

    async getTenantByDomain(tenantDomain: string) {
        return this.tenantModel.findOne({ domain: tenantDomain });
    }

    async createTenant(dto: CreateTenantDto) {
        const domain = dto.domain.trim();
        const name = (dto.name ?? domain).trim();
        const dbName = (dto.dbName ?? defaultDbNameFromDomain(domain)).trim().toLowerCase();
        const status = dto.status?.trim() || 'active';
        return this.tenantModel.create({ domain, name, dbName, status });
    }
}
