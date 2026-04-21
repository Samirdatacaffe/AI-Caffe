export interface TokenPayload {
    userId: string;
}
export declare const generateAccessToken: (userId: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => TokenPayload;
