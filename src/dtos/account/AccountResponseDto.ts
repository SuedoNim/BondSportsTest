export class AccountResponseDto {
  accountId!: number;
  personId!: number;
  balance!: number;
  daylightWithdrawelLimit?: number;
  activeFlag!: boolean;
  accountType!: number;
  createDate!: Date;
}