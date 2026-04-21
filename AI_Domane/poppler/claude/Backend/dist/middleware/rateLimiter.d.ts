/** 5 requests per minute for auth endpoints */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/** 10 requests per minute for verification code resend */
export declare const resendLimiter: import("express-rate-limit").RateLimitRequestHandler;
