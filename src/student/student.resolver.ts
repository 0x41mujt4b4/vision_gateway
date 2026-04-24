import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Model } from 'mongoose';
import { Student } from './student.schema';

@Resolver()
export class StudentResolver {
    constructor(
        @Inject('STUDENT_MODEL') private readonly studentModel: Model<Student>
    ) { }

    @Query(() => [Student])
    async getStudents(): Promise<Student[]> {
        return this.studentModel.find().exec();
    }

    @Mutation(() => String)
    async createStudent(@Args('name') name: string, @Args('time') time: string, @Args('feesAmount') feesAmount: number, @Args('feesType') feesType: string, @Args('course') course: string, @Args('session') session: string): Promise<string> {
        const student = await this.studentModel.create({ name, time, feesAmount, feesType, course, session });
        return student.id;
    }
}
