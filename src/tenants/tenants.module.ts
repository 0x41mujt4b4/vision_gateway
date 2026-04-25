import { Global, Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { UsersModule } from 'src/users/users.module';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { tenantConnectionProvider } from 'src/providers/tenant-connection.provider';

@Global()
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Tenant.name,
        schema: TenantSchema
      },
    ]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService, tenantConnectionProvider],
  exports: [TenantsService, tenantConnectionProvider, MongooseModule]
})
export class TenantsModule { }
