import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { tenantModelsProvider } from 'src/providers/tenant-models.provider';
import { SystemConfig, SystemConfigSchema } from 'src/system-config/schemas/system-config.schema';
import { RegistrationOptionsController } from './registration-options.controller';
import { RegistrationOptionsService } from './registration-options.service';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            {
                name: SystemConfig.name,
                schema: SystemConfigSchema,
            },
        ]),
    ],
    controllers: [RegistrationOptionsController],
    providers: [RegistrationOptionsService, tenantModelsProvider.registrationOptionsModel],
})
export class RegistrationOptionsModule { }
