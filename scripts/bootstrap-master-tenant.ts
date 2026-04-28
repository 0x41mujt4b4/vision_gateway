import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

type TenantRecord = {
    _id?: unknown;
    domain: string;
    name: string;
    dbName: string;
    status: string;
    isMaster: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

async function run(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is required');

    const domain = (process.env.MASTER_TENANT_DOMAIN ?? '').trim().toLowerCase();
    if (!domain) throw new Error('MASTER_TENANT_DOMAIN is required');

    const tenantName = (process.env.MASTER_TENANT_NAME ?? 'Master Tenant').trim();
    const dbName = (process.env.MASTER_TENANT_DB_NAME ?? `tenant_${domain.replace(/[^a-z0-9_-]/g, '_')}`).trim();
    const adminName = (process.env.MASTER_ADMIN_NAME ?? 'master admin').trim();
    const adminEmail = (process.env.MASTER_ADMIN_EMAIL ?? `admin@${domain}`).trim().toLowerCase();
    const adminPassword = process.env.MASTER_ADMIN_PASSWORD;

    await mongoose.connect(mongoUri);
    const now = new Date();

    const tenantsCollection = mongoose.connection.collection<TenantRecord>('tenants');
    await tenantsCollection.updateOne(
        { domain },
        {
            $set: {
                domain,
                name: tenantName,
                dbName,
                status: 'active',
                isMaster: true,
                updatedAt: now,
            },
            $setOnInsert: {
                createdAt: now,
            },
        },
        { upsert: true },
    );

    const tenant = await tenantsCollection.findOne({ domain });
    if (!tenant?._id) {
        throw new Error('Failed to create or load master tenant');
    }

    const existingMaster = await tenantsCollection.findOne({ isMaster: true });
    if (existingMaster && String(existingMaster._id) !== String(tenant._id)) {
        throw new Error(`Another master tenant already exists (id=${String(existingMaster._id)}).`);
    }

    const tenantDb = mongoose.connection.useDb(dbName);
    const usersCollection = tenantDb.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    let passwordHash = process.env.MASTER_ADMIN_PASSWORD_HASH;
    if (!passwordHash) {
        if (!adminPassword) throw new Error('Set MASTER_ADMIN_PASSWORD or MASTER_ADMIN_PASSWORD_HASH');
        passwordHash = await bcrypt.hash(adminPassword, 10);
    }

    if (!existingAdmin) {
        await usersCollection.insertOne({
            name: adminName,
            email: adminEmail,
            password: passwordHash,
            tenantId: String(tenant._id),
            role: 'admin',
            permissions: [
                'students:create',
                'students:read',
                'users:create',
                'users:read',
                'tenants:create',
                'tenants:read',
            ],
            createdAt: now,
            updatedAt: now,
        });
    }

    // eslint-disable-next-line no-console
    console.log('Master tenant bootstrap complete');
    // eslint-disable-next-line no-console
    console.log(`tenantDomain=${domain}`);
    // eslint-disable-next-line no-console
    console.log(`tenantId=${String(tenant._id)}`);
    // eslint-disable-next-line no-console
    console.log(`tenantDbName=${dbName}`);
    // eslint-disable-next-line no-console
    console.log(`adminEmail=${adminEmail}`);
    // eslint-disable-next-line no-console
    console.log(`adminCreated=${existingAdmin ? 'false' : 'true'}`);
}

void run()
    .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
