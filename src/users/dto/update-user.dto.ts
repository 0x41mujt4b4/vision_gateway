import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export default class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}
