import 'dotenv/config';
import mongoose from 'mongoose';
import { DEFAULT_REGISTRATION_OPTIONS } from '../src/registration-options/default-registration-options';

const DEFAULT_REGISTRATION_OPTIONS_KEY = 'registration_options_default';

async function run(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is required');
    }

    await mongoose.connect(mongoUri);
    const collection = mongoose.connection.collection('system_config');
    const now = new Date();

    await collection.updateOne(
        { key: DEFAULT_REGISTRATION_OPTIONS_KEY },
        {
            $set: {
                key: DEFAULT_REGISTRATION_OPTIONS_KEY,
                value: DEFAULT_REGISTRATION_OPTIONS,
                updatedAt: now,
            },
            $setOnInsert: {
                createdAt: now,
            },
        },
        { upsert: true },
    );

    // eslint-disable-next-line no-console
    console.log(`Seeded "${DEFAULT_REGISTRATION_OPTIONS_KEY}" in system_config`);
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
