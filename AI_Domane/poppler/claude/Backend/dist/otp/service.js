import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendOtpEmail } from './mailer.js';
import { logger } from './logger.js';
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '4', 10);
let useDb = false;
let otpDb;
// In-memory fallback
const memoryOtps = new Map();
/** Initialize: try DB, fall back to memory */
export const initOtpStorage = async () => {
    try {
        const dbModule = await import('./db.js');
        const connected = await dbModule.testOtpDbConnection();
        if (connected) {
            await dbModule.initOtpSchema();
            otpDb = dbModule.otpDb;
            useDb = true;
            logger.info('OTP_SERVICE', 'Using PostgreSQL storage');
        }
        else {
            logger.warn('OTP_SERVICE', 'PostgreSQL unavailable — using in-memory OTP storage');
        }
    }
    catch {
        logger.warn('OTP_SERVICE', 'PostgreSQL unavailable — using in-memory OTP storage');
    }
};
/** Generate a cryptographically random 6-digit OTP */
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};
// ==================== DB Operations ====================
const dbUpsertOtp = async (email, otpHash, expiryTime) => {
    await otpDb.query('DELETE FROM otp_service.email_otps WHERE email = $1', [email]);
    await otpDb.query(`INSERT INTO otp_service.email_otps (email, otp_hash, is_verified, expiry_time, attempts, created_at, updated_at)
     VALUES ($1, $2, FALSE, $3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [email, otpHash, expiryTime]);
};
const dbGetOtp = async (email) => {
    const result = await otpDb.query(`SELECT email, otp_hash, is_verified, expiry_time, attempts
     FROM otp_service.email_otps WHERE email = $1
     ORDER BY created_at DESC LIMIT 1`, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
};
const dbIncrementAttempts = async (email) => {
    await otpDb.query(`UPDATE otp_service.email_otps SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE email = $1`, [email]);
};
const dbMarkVerified = async (email) => {
    await otpDb.query(`UPDATE otp_service.email_otps SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE email = $1`, [email]);
};
const dbDeleteOtp = async (email) => {
    await otpDb.query('DELETE FROM otp_service.email_otps WHERE email = $1', [email]);
};
// ==================== Memory Operations ====================
const memUpsertOtp = (email, otpHash, expiryTime) => {
    memoryOtps.set(email, { email, otp_hash: otpHash, is_verified: false, expiry_time: expiryTime, attempts: 0 });
};
const memGetOtp = (email) => {
    return memoryOtps.get(email) ?? null;
};
// ==================== Public API ====================
export const sendOtpToEmail = async (email) => {
    const normalized = email.trim().toLowerCase();
    try {
        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        if (useDb) {
            await dbUpsertOtp(normalized, otpHash, expiryTime);
        }
        else {
            memUpsertOtp(normalized, otpHash, expiryTime);
        }
        await sendOtpEmail(normalized, otp);
        logger.info('OTP_SERVICE', `OTP sent to ${normalized}`);
        return { email: normalized, success: true, message: 'OTP sent successfully' };
    }
    catch (err) {
        logger.error('OTP_SERVICE', `Failed to send OTP to ${normalized}`, err);
        return { email: normalized, success: false, message: 'Failed to send OTP' };
    }
};
export const sendOtpToMultiple = async (emails) => {
    const unique = [...new Set(emails.map(e => e.trim().toLowerCase()))];
    return Promise.all(unique.map(sendOtpToEmail));
};
export const verifyOtp = async (email, otp) => {
    const normalized = email.trim().toLowerCase();
    try {
        const record = useDb ? await dbGetOtp(normalized) : memGetOtp(normalized);
        if (!record) {
            logger.warn('OTP_SERVICE', `No OTP found for ${normalized}`);
            return { verified: false, message: 'No OTP found. Please request a new one.' };
        }
        if (record.is_verified) {
            return { verified: false, message: 'OTP already used. Please request a new one.' };
        }
        if (new Date(record.expiry_time) < new Date()) {
            logger.warn('OTP_SERVICE', `Expired OTP for ${normalized}`);
            if (useDb)
                await dbDeleteOtp(normalized);
            else
                memoryOtps.delete(normalized);
            return { verified: false, message: 'OTP has expired. Please request a new one.' };
        }
        if (record.attempts >= MAX_ATTEMPTS) {
            logger.warn('OTP_SERVICE', `Max attempts for ${normalized}`);
            if (useDb)
                await dbDeleteOtp(normalized);
            else
                memoryOtps.delete(normalized);
            return { verified: false, message: `Maximum ${MAX_ATTEMPTS} attempts exceeded. Request a new OTP.` };
        }
        // Increment attempts
        if (useDb) {
            await dbIncrementAttempts(normalized);
        }
        else {
            record.attempts += 1;
        }
        const isMatch = await bcrypt.compare(otp, record.otp_hash);
        if (!isMatch) {
            const remaining = MAX_ATTEMPTS - record.attempts - (useDb ? 0 : 0);
            logger.warn('OTP_SERVICE', `Invalid OTP for ${normalized}, ${remaining} left`);
            return {
                verified: false,
                message: remaining > 0
                    ? `Invalid OTP. ${remaining} attempt(s) remaining.`
                    : 'Invalid OTP. No attempts remaining. Request a new OTP.',
            };
        }
        // SUCCESS
        if (useDb) {
            await dbMarkVerified(normalized);
            await dbDeleteOtp(normalized);
        }
        else {
            memoryOtps.delete(normalized);
        }
        logger.info('OTP_SERVICE', `OTP verified for ${normalized}`);
        return { verified: true, message: 'Email verified successfully' };
    }
    catch (err) {
        logger.error('OTP_SERVICE', `Verify error for ${normalized}`, err);
        return { verified: false, message: 'Verification failed. Please try again.' };
    }
};
export const cleanupExpiredOtps = async () => {
    if (useDb) {
        try {
            const result = await otpDb.query('DELETE FROM otp_service.email_otps WHERE expiry_time < CURRENT_TIMESTAMP');
            const count = result.rowCount ?? 0;
            if (count > 0)
                logger.info('OTP_CLEANUP', `Deleted ${count} expired OTP(s)`);
            return count;
        }
        catch (err) {
            logger.error('OTP_CLEANUP', 'Cleanup failed', err);
            return 0;
        }
    }
    // Memory cleanup
    let count = 0;
    const now = new Date();
    for (const [email, record] of memoryOtps) {
        if (new Date(record.expiry_time) < now) {
            memoryOtps.delete(email);
            count++;
        }
    }
    if (count > 0)
        logger.info('OTP_CLEANUP', `Deleted ${count} expired OTP(s) from memory`);
    return count;
};
