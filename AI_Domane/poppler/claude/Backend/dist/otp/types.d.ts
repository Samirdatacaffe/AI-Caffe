export interface EmailOtp {
    id: number;
    email: string;
    otp_hash: string;
    is_verified: boolean;
    expiry_time: Date;
    attempts: number;
    created_at: Date;
    updated_at: Date;
}
export interface SendOtpRequest {
    email: string | string[];
}
export interface VerifyOtpRequest {
    email: string;
    otp: string;
}
export interface OtpResult {
    email: string;
    success: boolean;
    message: string;
}
export interface VerifyResult {
    verified: boolean;
    message: string;
}
