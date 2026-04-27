import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export default class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @Type(() => Number)
    @IsNumber()
    feesAmount: number;

    @IsString()
    @IsNotEmpty()
    feesType: string;

    @IsString()
    @IsNotEmpty()
    course: string;

    @IsString()
    @IsNotEmpty()
    level: string;

    @IsString()
    @IsNotEmpty()
    session: string;

    /** ISO 8601 datetime when payment was made; omitted defaults to server time at creation. */
    @IsOptional()
    @IsDateString()
    paymentDate?: string;
}
