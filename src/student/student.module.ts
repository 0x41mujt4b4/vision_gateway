import { Module } from '@nestjs/common';
import { StudentResolver } from './student.resolver';
import { StudentService } from './student.service';
import { tenantModelsProvider } from 'src/providers/tenant-models.provider';
import { StudentController } from './student.controller';

@Module({
  controllers: [StudentController],
  providers: [StudentResolver, StudentService, tenantModelsProvider.studentModel]
})
export class StudentModule { }
