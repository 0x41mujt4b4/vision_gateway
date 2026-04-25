import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Student } from './schemas/student.schema';
import CreateStudentDto from './dto/student.dto';

@Injectable()
export class StudentService {
    constructor(
        @Inject('STUDENT_MODEL') private studentModel: Model<Student>
    ) { }

    async createStudent(student: CreateStudentDto, tenantId: string): Promise<Student> {
        return this.studentModel.create({ ...student, tenantId });
    }

    async getStudents(): Promise<Student[]> {
        return this.studentModel.find();
    }
}
