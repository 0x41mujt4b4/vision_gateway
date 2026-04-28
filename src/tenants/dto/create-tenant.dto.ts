import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    domain: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsOptional()
    status?: string;
}
