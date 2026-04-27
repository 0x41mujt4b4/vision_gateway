import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CredentialsDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}
