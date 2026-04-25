import { Body, Controller, Post } from '@nestjs/common';
import { StudentService } from './student.service';
import CreateStudentDto from './dto/student.dto';
import { Student } from './schemas/student.schema';
import { TenantId } from 'src/tenants/decorators/tenant.decorator';

@Controller('students')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    createStudent(@Body() student: CreateStudentDto, @TenantId() tenantId: string): Promise<Student> {
        return this.studentService.createStudent(student, tenantId);
    }
}
