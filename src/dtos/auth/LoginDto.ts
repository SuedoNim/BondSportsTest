import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * @description User login request
 * @example {"email":"user@example.com","password":"password123"}
 */
export class LoginDto {
  /**
   * @description User email address
   * @format email
   */
  @IsEmail()
  email!: string;

  /**
   * @description User password
   * @minLength 6
   */
  @IsString()
  @MinLength(6)
  password!: string;
}