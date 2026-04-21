import type { OtpResult, VerifyResult } from './types.js';
/** Initialize: try DB, fall back to memory */
export declare const initOtpStorage: () => Promise<void>;
export declare const sendOtpToEmail: (email: string) => Promise<OtpResult>;
export declare const sendOtpToMultiple: (emails: string[]) => Promise<OtpResult[]>;
export declare const verifyOtp: (email: string, otp: string) => Promise<VerifyResult>;
export declare const cleanupExpiredOtps: () => Promise<number>;
