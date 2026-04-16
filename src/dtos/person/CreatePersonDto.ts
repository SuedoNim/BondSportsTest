import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDateString, IsEmail } from 'class-validator';
export class CreatePersonDto {
    @IsString()
    name!: string;
    @IsString()
    document?: string;
    @IsDateString()
    birthDate!: string;
    @Type(() => Number)
    @IsNumber()
    roleId!: number;
    @IsEmail()
    email!: string;
    @IsString()
    password!: string;
}