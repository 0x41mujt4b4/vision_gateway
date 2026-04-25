import { Injectable } from '@nestjs/common';
import { TenantsModule } from './tenants.module';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './schemas/tenant.schema';
import { Model } from 'mongoose';

@Injectable()
export class TenantsService {
    constructor( @InjectModel(Tenant.name) private tenantModel: Model<Tenant>) { }

    async getTenantByDomain(tenantDomain: string) {
        return this.tenantModel.findOne({ domain: tenantDomain });
    }

    async createTenant(tenantDomain: string) {
        return this.tenantModel.create({ domain: tenantDomain });
    }
}
