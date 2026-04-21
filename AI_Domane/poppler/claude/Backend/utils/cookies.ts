import { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    path: '/',
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
};
