import jwt, { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload extends JwtPayload {
  personId: number;
  email: string;
  roleId: number;
}

/**
 * Generate a signed JWT token
 * @param payload - Token payload without iat/exp (auto-added)
 * @returns Signed JWT token string
 */
export const generateToken = (
  payload: Omit<TokenPayload, 'iat' | 'exp'>
): string => {
  const signOptions: SignOptions = {
    expiresIn: config.jwtExpiration, // No cast needed now
    algorithm: 'HS256'
  };

  return jwt.sign(payload, config.jwtSecret, signOptions);
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Token payload if valid, null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const verifyOptions: VerifyOptions = {
      algorithms: ['HS256'],
    };

    const decoded = jwt.verify(token, config.jwtSecret, verifyOptions);
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
};

/**
 * Decode a JWT token without verification
 * Useful for reading token payload without validation
 * @param token - JWT token string to decode
 * @returns Token payload if valid JWT format, null if invalid
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token, { complete: false });
    return decoded as TokenPayload | null;
  } catch (error) {
    console.error('Token decode failed:', error instanceof Error ? error.message : error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param token - JWT token string
 * @returns true if expired, false if valid
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return decoded.exp * 1000 < Date.now();
};

/**
 * Refresh a token by verifying and re-issuing it
 * @param token - Current JWT token string
 * @returns New signed token if original is valid, null if invalid
 */
export const refreshToken = (token: string): string | null => {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const { iat, exp, ...rest } = payload;
  return generateToken(rest as Omit<TokenPayload, 'iat' | 'exp'>);
};