/** Initialize SMTP transporter */
export declare const initMailer: () => void;
/** Send OTP email */
export declare const sendOtpEmail: (to: string, otp: string) => Promise<void>;
