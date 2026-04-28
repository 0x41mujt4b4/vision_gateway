import { Inject, Injectable } from '@nestjs/common';
import { getConnectionToken, InjectModel } from '@nestjs/mongoose';
import { Tenant } from './schemas/tenant.schema';
import { Connection, Model } from 'mongoose';
import CreateTenantDto from './dto/create-tenant.dto';
import UpdateTenantDto from './dto/update-tenant.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

function defaultDbNameFromDomain(domain: string): string {
    const normalized = domain
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'tenant';
    return `tenant_${normalized}`;
}

@Injectable()
export class TenantsService {
    constructor(
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
        @Inject(getConnectionToken()) private readonly connection: Connection,
    ) {}

    async getTenantByDomain(tenantDomain: string) {
        return this.tenantModel.findOne({ domain: tenantDomain });
    }

    private async buildUniqueDbName(domain: string): Promise<string> {
        const base = defaultDbNameFromDomain(domain);
        let candidate = base;
        let suffix = 2;
        while (await this.tenantModel.exists({ dbName: candidate })) {
            candidate = `${base}_${suffix}`;
            suffix += 1;
        }
        return candidate;
    }

    async createTenant(dto: CreateTenantDto) {
        const domain = dto.domain.trim().toLowerCase();
        if (/\s/.test(domain)) {
            throw new BadRequestException('Tenant domain must not contain spaces');
        }
        const name = (dto.name ?? domain).trim();
        const dbName = await this.buildUniqueDbName(domain);
        const status = dto.status?.trim() || 'active';
        const tenant = await this.tenantModel.create({ domain, name, dbName, status });
        await this.createBootstrapAdminUser(tenant);
        return tenant;
    }

    private async createBootstrapAdminUser(tenant: Tenant): Promise<void> {
        const tenantDb = this.connection.useDb(tenant.dbName);
        const usersCollection = tenantDb.collection('users');
        const adminEmail = `admin@${tenant.domain}`;
        const exists = await usersCollection.findOne({ email: adminEmail });
        if (exists) return;

        const bootstrapPassword = process.env.TENANT_BOOTSTRAP_ADMIN_PASSWORD ?? 'Admin@12345';
        const passwordHash = await bcrypt.hash(bootstrapPassword, 10);
        const now = new Date();

        await usersCollection.insertOne({
            name: 'tenant admin',
            email: adminEmail,
            password: passwordHash,
            tenantId: String((tenant as unknown as { _id?: unknown })._id ?? ''),
            role: 'admin',
            permissions: ['students:create', 'students:read', 'users:create', 'users:read'],
            createdAt: now,
            updatedAt: now,
        });
    }

    async getTenants() {
        return this.tenantModel.find().sort({ createdAt: -1 });
    }

    async updateTenantById(tenantId: string | undefined, updates: UpdateTenantDto): Promise<Tenant> {
        if (tenantId == null || String(tenantId).trim() === '') {
            throw new BadRequestException('Tenant ID is required');
        }

        const payload: Partial<Pick<Tenant, 'name' | 'status'>> = {};
        if (typeof updates.name === 'string' && updates.name.trim() !== '') {
            payload.name = updates.name.trim();
        }
        if (typeof updates.status === 'string' && updates.status.trim() !== '') {
            payload.status = updates.status.trim().toLowerCase();
        }

        const updatedTenant = await this.tenantModel.findOneAndUpdate(
            { _id: String(tenantId) },
            { $set: payload },
            { new: true },
        );
        if (!updatedTenant) {
            throw new NotFoundException('Tenant not found');
        }
        return updatedTenant;
    }
}
