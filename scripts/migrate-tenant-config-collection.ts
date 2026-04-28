import 'dotenv/config';
import mongoose from 'mongoose';

type TenantRecord = {
    dbName?: string;
};

type TenantConfigRecord = {
    key: string;
    sessionOptions: string[];
    courseOptions: string[];
    levelOptions: string[];
    timeOptions: string[];
    feesTypeOptions: string[];
    defaultFeesAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
};

async function run(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is required');
    }

    await mongoose.connect(mongoUri);
    const tenants = await mongoose.connection.collection<TenantRecord>('tenants').find({}, { projection: { dbName: 1 } }).toArray();

    let migratedTenants = 0;
    let skippedTenants = 0;

    for (const tenant of tenants) {
        const dbName = tenant.dbName?.trim();
        if (!dbName) {
            skippedTenants += 1;
            continue;
        }

        const tenantDb = mongoose.connection.useDb(dbName);
        const oldCollection = tenantDb.collection<TenantConfigRecord>('registration_options');
        const newCollection = tenantDb.collection<TenantConfigRecord>('tenant_config');

        const docs = await oldCollection.find({}).toArray();
        if (docs.length === 0) {
            skippedTenants += 1;
            continue;
        }

        for (const doc of docs) {
            await newCollection.updateOne(
                { key: doc.key },
                {
                    $setOnInsert: {
                        key: doc.key,
                        sessionOptions: doc.sessionOptions,
                        courseOptions: doc.courseOptions,
                        levelOptions: doc.levelOptions,
                        timeOptions: doc.timeOptions,
                        feesTypeOptions: doc.feesTypeOptions,
                        defaultFeesAmount: doc.defaultFeesAmount,
                        createdAt: doc.createdAt ?? new Date(),
                        updatedAt: doc.updatedAt ?? new Date(),
                    },
                },
                { upsert: true },
            );
        }
        migratedTenants += 1;
    }

    // eslint-disable-next-line no-console
    console.log(`Tenant config migration completed. Migrated: ${migratedTenants}, skipped: ${skippedTenants}`);
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
