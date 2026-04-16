import { Type } from 'class-transformer';
import { IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateAccountDto {
  @Type(() => Number)
  @IsNumber()
  personId!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  balance!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  daylightWithdrawelLimit?: number;

  @IsBoolean()
  activeFlag!: boolean;

  @Type(() => Number)
  @IsNumber()
  accountType!: number;
}