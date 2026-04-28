import 'dotenv/config';
import mongoose from 'mongoose';
import { DEFAULT_REGISTRATION_OPTIONS } from '../src/registration-options/default-registration-options';

const SETTINGS_KEY = 'registration-options';

type TenantRecord = {
    domain?: string;
    dbName?: string;
};
type TenantRegistrationOptionsRecord = {
    key: string;
};

async function run(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is required');
    }

    await mongoose.connect(mongoUri);

    const tenants = await mongoose.connection.collection<TenantRecord>('tenants').find({}, { projection: { dbName: 1, domain: 1 } }).toArray();

    let seededCount = 0;
    let skippedCount = 0;

    for (const tenant of tenants) {
        const dbName = tenant.dbName?.trim();
        if (!dbName) {
            skippedCount += 1;
            continue;
        }

        const tenantDb = mongoose.connection.useDb(dbName);
        const optionsCollection = tenantDb.collection<TenantRegistrationOptionsRecord>('tenant_config');
        const now = new Date();

        const result = await optionsCollection.updateOne(
            { key: SETTINGS_KEY },
            {
                $setOnInsert: {
                    key: SETTINGS_KEY,
                    ...DEFAULT_REGISTRATION_OPTIONS,
                    createdAt: now,
                    updatedAt: now,
                },
            },
            { upsert: true },
        );

        if (result.upsertedCount > 0) {
            seededCount += 1;
        } else {
            skippedCount += 1;
        }
    }

    // eslint-disable-next-line no-console
    console.log(`Processed ${tenants.length} tenants. Seeded: ${seededCount}, skipped(existing/no-db): ${skippedCount}.`);
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
