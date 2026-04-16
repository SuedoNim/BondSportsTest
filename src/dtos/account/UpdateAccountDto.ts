import { IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateAccountDto {
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsNumber()
  @Min(0)
  daylightWithdrawelLimit?: number;

  @IsBoolean()
  activeFlag?: boolean;

  @IsNumber()
  accountType?: number;
}