import { PersonService } from './PersonService';
import { AuthResponseDto } from '../dtos/auth/AuthResponseDto';
import { LoginDto } from '../dtos/auth/LoginDto';
import { UnauthorizedError } from '../utils/errors';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export class AuthService {
  constructor(private personService: PersonService) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    logger.debug('Login attempt', { email: dto.email });

    const person = await this.personService.getPersonByEmail(dto.email);

    const isPasswordValid = await comparePassword(dto.password, person.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload = {
      personId: person.personId,
      email: person.email,
      roleId: person.roleId,
    };

    const token = generateToken(payload);

    logger.info('Login successful', { personId: person.personId });

    return {
      token,
      payload,
    };
  }
}