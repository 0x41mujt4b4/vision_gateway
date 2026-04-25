import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { tenantModelsProvider } from 'src/providers/tenant-models.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersService, tenantModelsProvider.userModel],
  exports: [UsersService]
})
export class UsersModule { }
