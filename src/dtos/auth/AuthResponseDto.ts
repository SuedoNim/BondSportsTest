export class AuthResponseDto {
  token!: string;
  payload!: {
    personId: number;
    email: string;
    roleId: number;
  };
}