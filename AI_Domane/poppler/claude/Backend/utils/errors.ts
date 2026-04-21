import { Request, Response, NextFunction } from 'express';

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public internalMessage?: string
  ) {
    super(userMessage);
    this.name = 'AuthError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AuthError) {
    if (err.internalMessage) {
      console.error(`[AuthError] ${err.internalMessage}`);
    }
    res.status(err.statusCode).json({ message: err.userMessage });
    return;
  }

  console.error('[UnhandledError]', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
