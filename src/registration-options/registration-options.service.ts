import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DEFAULT_REGISTRATION_OPTIONS, RegistrationOptionsValue } from './default-registration-options';
import { RegistrationOptions } from './schemas/registration-options.schema';
import { UpdateRegistrationOptionsDto } from './dto/update-registration-options.dto';
import { SystemConfig } from 'src/system-config/schemas/system-config.schema';

const SETTINGS_KEY = 'registration-options';
const DEFAULT_REGISTRATION_OPTIONS_KEY = 'registration_options_default';

function normalizeOptions(values: string[] | undefined, fallback: string[]): string[] {
    if (!Array.isArray(values)) return fallback;
    const normalized = values.map((item) => item.trim()).filter((item) => item.length > 0);
    return normalized.length > 0 ? normalized : fallback;
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

@Injectable()
export class RegistrationOptionsService {
    private readonly logger = new Logger(RegistrationOptionsService.name);

    constructor(
        @Inject('REGISTRATION_OPTIONS_MODEL') private readonly optionsModel: Model<RegistrationOptions>,
        @InjectModel(SystemConfig.name) private readonly systemConfigModel: Model<SystemConfig>,
    ) { }

    private toValue(doc: RegistrationOptions): RegistrationOptionsValue {
        return {
            sessionOptions: doc.sessionOptions,
            courseOptions: doc.courseOptions,
            levelOptions: doc.levelOptions,
            timeOptions: doc.timeOptions,
            feesTypeOptions: doc.feesTypeOptions,
            defaultFeesAmount: doc.defaultFeesAmount,
        };
    }

    private sanitizeValue(value: unknown): RegistrationOptionsValue | null {
        if (typeof value !== 'object' || value === null) return null;
        const candidate = value as Partial<RegistrationOptionsValue>;
        if (
            !isStringArray(candidate.sessionOptions)
            || !isStringArray(candidate.courseOptions)
            || !isStringArray(candidate.levelOptions)
            || !isStringArray(candidate.timeOptions)
            || !isStringArray(candidate.feesTypeOptions)
            || typeof candidate.defaultFeesAmount !== 'number'
            || candidate.defaultFeesAmount < 0
        ) {
            return null;
        }
        return {
            sessionOptions: candidate.sessionOptions,
            courseOptions: candidate.courseOptions,
            levelOptions: candidate.levelOptions,
            timeOptions: candidate.timeOptions,
            feesTypeOptions: candidate.feesTypeOptions,
            defaultFeesAmount: candidate.defaultFeesAmount,
        };
    }

    private async getGlobalDefaultOptions(): Promise<RegistrationOptionsValue> {
        const globalConfig = await this.systemConfigModel.findOne({ key: DEFAULT_REGISTRATION_OPTIONS_KEY });
        const parsed = this.sanitizeValue(globalConfig?.value);
        if (parsed) {
            return parsed;
        }
        this.logger.warn(`Missing or invalid "${DEFAULT_REGISTRATION_OPTIONS_KEY}" in main DB; using in-code fallback defaults`);
        return DEFAULT_REGISTRATION_OPTIONS;
    }

    async getOptions(): Promise<RegistrationOptionsValue> {
        const tenantOverride = await this.optionsModel.findOne({ key: SETTINGS_KEY });
        if (tenantOverride) return this.toValue(tenantOverride);
        return this.getGlobalDefaultOptions();
    }

    async updateOptions(updates: UpdateRegistrationOptionsDto): Promise<RegistrationOptionsValue> {
        const current = await this.getOptions();
        const payload: RegistrationOptionsValue = {
            sessionOptions: normalizeOptions(updates.sessionOptions, current.sessionOptions),
            courseOptions: normalizeOptions(updates.courseOptions, current.courseOptions),
            levelOptions: normalizeOptions(updates.levelOptions, current.levelOptions),
            timeOptions: normalizeOptions(updates.timeOptions, current.timeOptions),
            feesTypeOptions: normalizeOptions(updates.feesTypeOptions, current.feesTypeOptions),
            defaultFeesAmount: typeof updates.defaultFeesAmount === 'number'
                ? updates.defaultFeesAmount
                : current.defaultFeesAmount,
        };

        const updated = await this.optionsModel.findOneAndUpdate(
            { key: SETTINGS_KEY },
            { $set: { ...payload, key: SETTINGS_KEY } },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        if (!updated) {
            const created = await this.optionsModel.create({ key: SETTINGS_KEY, ...payload });
            return this.toValue(created);
        }
        return this.toValue(updated);
    }
}
