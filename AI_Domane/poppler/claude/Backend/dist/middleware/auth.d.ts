import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
