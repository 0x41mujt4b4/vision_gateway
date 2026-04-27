import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    domain: string;
}
