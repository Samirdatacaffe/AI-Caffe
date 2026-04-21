import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '10d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
