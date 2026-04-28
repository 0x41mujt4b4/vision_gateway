import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRegistrationOptionsDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sessionOptions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    courseOptions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    levelOptions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    timeOptions?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    feesTypeOptions?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    defaultFeesAmount?: number;
}
