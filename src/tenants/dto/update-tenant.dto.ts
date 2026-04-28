import { IsOptional, IsString } from 'class-validator';

export default class UpdateTenantDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
