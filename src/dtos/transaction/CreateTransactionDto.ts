import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
export class CreateTransactionDto {
    @Type(() => Number)
    @IsNumber()
    accountId!: number;
    @Type(() => Number)
    @IsNumber()
    value!: number;
}