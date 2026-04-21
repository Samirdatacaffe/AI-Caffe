import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { sendOtpToEmail, sendOtpToMultiple, verifyOtp } from './service.js';
import { logger } from './logger.js';
import type { SendOtpRequest, VerifyOtpRequest } from './types.js';

const router = Router();

// ==================== Rate Limiters ====================

/** 5 send-otp requests per minute per IP */
const sendOtpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

/** 10 verify attempts per minute per IP */
const verifyOtpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many verification attempts. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== Validation ====================

const isValidEmail = (email: unknown): email is string => {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// ==================== POST /api/otp/send-otp ====================

router.post('/send-otp', sendOtpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as SendOtpRequest;

    // Handle array of emails
    if (Array.isArray(body.email)) {
      const emails = body.email.filter(isValidEmail);

      if (emails.length === 0) {
        res.status(400).json({ success: false, message: 'No valid email addresses provided' });
        return;
      }

      if (emails.length > 10) {
        res.status(400).json({ success: false, message: 'Maximum 10 emails per request' });
        return;
      }

      logger.info('OTP_ROUTE', `Sending OTP to ${emails.length} email(s)`);
      const results = await sendOtpToMultiple(emails);

      const allSuccess = results.every(r => r.success);
      res.status(allSuccess ? 200 : 207).json({
        success: allSuccess,
        message: allSuccess ? 'OTP sent to all emails' : 'Some emails failed',
        results,
      });
      return;
    }

    // Handle single email
    if (!isValidEmail(body.email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address' });
      return;
    }

    logger.info('OTP_ROUTE', `Send OTP request for ${body.email}`);
    const result = await sendOtpToEmail(body.email);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

// ==================== POST /api/otp/verify-otp ====================

router.post('/verify-otp', verifyOtpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as VerifyOtpRequest;

    if (!isValidEmail(body.email)) {
      res.status(400).json({ verified: false, message: 'Please enter a valid email address' });
      return;
    }

    if (!body.otp || typeof body.otp !== 'string' || body.otp.trim().length !== 6) {
      res.status(400).json({ verified: false, message: 'Please enter a valid 6-digit OTP' });
      return;
    }

    logger.info('OTP_ROUTE', `Verify OTP request for ${body.email}`);
    const result = await verifyOtp(body.email, body.otp.trim());

    if (!result.verified) {
      res.status(401).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
