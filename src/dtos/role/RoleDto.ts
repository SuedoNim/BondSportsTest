import { IsString, IsNumber, Min } from 'class-validator';
export class RoleDto {
    roleId!: number;
    @IsString()
    type!: string;
    @IsNumber()
    @Min(1)
    priority!: number;
}