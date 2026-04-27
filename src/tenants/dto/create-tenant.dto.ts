import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    domain: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    /** Unique MongoDB database name for this tenant (e.g. vision_local). */
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    dbName?: string;

    @IsString()
    @IsOptional()
    status?: string;
}
