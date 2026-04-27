import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import CreateStudentDto from './dto/student.dto';
import { Student } from './schemas/student.schema';
import { TenantId } from 'src/tenants/decorators/tenant.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RbacGuard } from 'src/auth/guards/rbac.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('students')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    @Permissions('students:create')
    createStudent(@Body() student: CreateStudentDto, @TenantId() tenantId: string): Promise<Student> {
        return this.studentService.createStudent(student, tenantId);
    }

    @Get()
    @Permissions('students:read')
    getStudents(): Promise<Student[]> {
        return this.studentService.getStudents();
    }
}
