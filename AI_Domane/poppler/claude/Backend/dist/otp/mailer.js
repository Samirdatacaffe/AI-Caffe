import nodemailer from 'nodemailer';
import { logger } from './logger.js';
let transporter = null;
/** Initialize SMTP transporter */
export const initMailer = () => {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
        logger.warn('MAILER', 'SMTP not configured — OTPs will be logged to console only');
        return;
    }
    transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
    logger.info('MAILER', `SMTP configured: ${host}:${port} (user: ${user})`);
};
/** Send OTP email */
export const sendOtpEmail = async (to, otp) => {
    const fromName = process.env.SMTP_FROM_NAME || 'AI Caffe';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
    // Always log in dev
    logger.info('MAILER', `OTP for ${to}: ${otp}`);
    if (!transporter) {
        logger.warn('MAILER', `No SMTP — OTP for ${to} logged above`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject: 'Your Verification Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1c1917; margin-bottom: 8px;">Verification Code</h2>
          <p style="color: #6b7280; font-size: 15px;">Use the code below to verify your email address. It expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1c1917;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
        });
        logger.info('MAILER', `Email sent to ${to}`);
    }
    catch (err) {
        logger.error('MAILER', `SMTP failed for ${to} — OTP logged above`, err);
        // Don't throw — OTP is still valid, user can see it in server logs
    }
};
