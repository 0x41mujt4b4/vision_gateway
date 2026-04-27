import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Student } from './schemas/student.schema';
import CreateStudentDto from './dto/student.dto';

const STUDENT_NUMBER_COUNTER_ID = 'studentNumber';

@Injectable()
export class StudentService {
    constructor(
        @Inject('STUDENT_MODEL') private studentModel: Model<Student>
    ) { }

    private async allocateNextStudentNumber(): Promise<number> {
        const coll = this.studentModel.db.collection<{ _id: string; seq: number }>('sequences');
        const result = await coll.findOneAndUpdate(
            { _id: STUDENT_NUMBER_COUNTER_ID },
            { $inc: { seq: 1 } },
            { upsert: true, returnDocument: 'after' },
        );
        const seq = result?.seq;
        if (seq == null || !Number.isFinite(seq)) {
            throw new InternalServerErrorException('Failed to allocate student number');
        }
        return seq;
    }

    async createStudent(student: CreateStudentDto, tenantId: string): Promise<Student> {
        const { paymentDate: paymentDateRaw, ...rest } = student;
        const paymentDate = paymentDateRaw ? new Date(paymentDateRaw) : new Date();
        const studentNumber = await this.allocateNextStudentNumber();
        return this.studentModel.create({ ...rest, tenantId, paymentDate, studentNumber });
    }

    async getStudents(): Promise<Student[]> {
        return this.studentModel.find();
    }
}
