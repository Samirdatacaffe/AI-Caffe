import { Request, Response, NextFunction } from 'express';
export declare class AuthError extends Error {
    statusCode: number;
    userMessage: string;
    internalMessage?: string | undefined;
    constructor(statusCode: number, userMessage: string, internalMessage?: string | undefined);
}
export declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
