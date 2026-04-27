import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export default class UserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    /** May be omitted; tenant is set from the request context. */
    @IsOptional()
    @IsString()
    tenantId?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}
