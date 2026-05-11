import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export default class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => Number)
    @IsNumber()
    feesAmount: number;

    @IsString()
    @IsNotEmpty()
    feesType: string;

    @IsOptional()
    @IsString()
    time?: string;

    @IsOptional()
    @IsString()
    course?: string;

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @IsString()
    session?: string;

    /** ISO 8601 datetime when payment was made; omitted defaults to server time at creation. */
    @IsOptional()
    @IsDateString()
    paymentDate?: string;
}
