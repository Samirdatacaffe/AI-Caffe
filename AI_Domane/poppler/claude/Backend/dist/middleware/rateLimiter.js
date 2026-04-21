import rateLimit from 'express-rate-limit';
/** 5 requests per minute for auth endpoints */
export const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { message: 'Too many attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
/** 10 requests per minute for verification code resend */
export const resendLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: { message: 'Too many resend attempts. Please wait.' },
    standardHeaders: true,
    legacyHeaders: false,
});
