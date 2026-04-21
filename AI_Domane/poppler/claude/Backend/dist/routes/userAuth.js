import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import prisma from '../db/prisma.js';
import { sendOtpEmail } from '../otp/mailer.js';
import { logger } from '../otp/logger.js';
import { setAuthCookies } from '../utils/cookies.js';
import { requireAuth } from '../middleware/auth.js';
function parseUserAgent(ua) {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    if (ua.includes('Edg/'))
        browser = 'Edge';
    else if (ua.includes('Chrome/'))
        browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome'))
        browser = 'Safari';
    else if (ua.includes('Firefox/'))
        browser = 'Firefox';
    if (ua.includes('Windows'))
        os = 'Windows';
    else if (ua.includes('Mac OS X') || ua.includes('Macintosh'))
        os = 'Mac OS X';
    else if (ua.includes('Linux'))
        os = 'Linux';
    else if (ua.includes('Android'))
        os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad'))
        os = 'iOS';
    return `${browser} (${os})`;
}
const router = Router();
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many requests. Please wait.' },
    validate: false,
});
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh';
// ==================== CHECK EMAIL EXISTS ====================
router.post('/check-email', authLimiter, async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ exists: false, message: 'Email is required' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        res.json({ exists: !!user });
    }
    catch (err) {
        next(err);
    }
});
// ==================== REGISTER ====================
router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const { email, firstName, lastName, password } = req.body;
        if (!email || !firstName || !lastName || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            res.status(409).json({ success: false, message: 'An account with this email already exists' });
            return;
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                passwordHash,
            },
        });
        logger.info('USER_AUTH', `User registered: ${user.email}`);
        // Generate tokens
        const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        // Save session with device info
        const ua = req.headers['user-agent'] || '';
        const device = parseUserAgent(ua);
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
        const refreshHash = await bcrypt.hash(refreshToken, 10);
        await prisma.session.create({
            data: {
                userId: user.id,
                refreshTokenHash: refreshHash,
                expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                device,
                ipAddress,
                lastActiveAt: new Date(),
            },
        });
        // Set HttpOnly cookies
        setAuthCookies(res, accessToken, refreshToken);
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
            accessToken,
            refreshToken,
        });
    }
    catch (err) {
        next(err);
    }
});
// ==================== LOGIN ====================
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        // Generate tokens
        const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        const lua = req.headers['user-agent'] || '';
        const lDevice = parseUserAgent(lua);
        const lIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
        const refreshHash = await bcrypt.hash(refreshToken, 10);
        await prisma.session.create({
            data: {
                userId: user.id,
                refreshTokenHash: refreshHash,
                expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                device: lDevice,
                ipAddress: lIp,
                lastActiveAt: new Date(),
            },
        });
        // Set HttpOnly cookies
        setAuthCookies(res, accessToken, refreshToken);
        logger.info('USER_AUTH', `User logged in: ${user.email}`);
        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
            accessToken,
            refreshToken,
        });
    }
    catch (err) {
        next(err);
    }
});
// ==================== FORGOT PASSWORD (send OTP) ====================
router.post('/forgot-password', authLimiter, async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            // Don't reveal if email exists
            res.json({ success: true, message: 'If this email exists, a reset code has been sent' });
            return;
        }
        // Delete old reset requests
        await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                otpHash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            },
        });
        // Send OTP via SMTP
        await sendOtpEmail(normalizedEmail, otp);
        logger.info('USER_AUTH', `Password reset OTP sent to ${normalizedEmail}`);
        res.json({ success: true, message: 'If this email exists, a reset code has been sent' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== RESET PASSWORD (verify OTP + set new password) ====================
router.post('/reset-password', authLimiter, async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid request' });
            return;
        }
        // Find active reset request
        const resetRecord = await prisma.passwordReset.findFirst({
            where: { userId: user.id, used: false },
            orderBy: { createdAt: 'desc' },
        });
        if (!resetRecord) {
            res.status(400).json({ success: false, message: 'No reset request found. Please request a new code.' });
            return;
        }
        // Check expiry
        if (new Date(resetRecord.expiresAt) < new Date()) {
            await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
            res.status(400).json({ success: false, message: 'Code has expired. Please request a new one.' });
            return;
        }
        // Check max attempts
        if (resetRecord.attempts >= 4) {
            await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
            res.status(400).json({ success: false, message: 'Too many attempts. Please request a new code.' });
            return;
        }
        // Increment attempts
        await prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { attempts: resetRecord.attempts + 1 },
        });
        // Verify OTP
        const validOtp = await bcrypt.compare(otp, resetRecord.otpHash);
        if (!validOtp) {
            const remaining = 4 - resetRecord.attempts - 1;
            res.status(400).json({
                success: false,
                message: remaining > 0 ? `Invalid code. ${remaining} attempt(s) remaining.` : 'Invalid code. Please request a new one.',
            });
            return;
        }
        // Update password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
        });
        // Mark reset as used & clean up
        await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
        // Invalidate all sessions
        await prisma.session.deleteMany({ where: { userId: user.id } });
        logger.info('USER_AUTH', `Password reset successful for ${normalizedEmail}`);
        res.json({ success: true, message: 'Password reset successful. Please sign in with your new password.' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== GET /api/user/work — Get work profile ====================
router.get('/work', requireAuth, async (req, res, next) => {
    try {
        const profile = await prisma.userWorkProfile.findUnique({
            where: { userId: req.userId },
        });
        if (!profile) {
            res.json({ success: true, data: null });
            return;
        }
        res.json({
            success: true,
            data: {
                workCategory: profile.workCategory,
                customInput: profile.customInput,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// ==================== POST /api/user/work — Save work profile ====================
router.post('/work', requireAuth, async (req, res, next) => {
    try {
        const { workCategory, customInput } = req.body;
        if (!workCategory || typeof workCategory !== 'string') {
            res.status(400).json({ success: false, message: 'Work category is required' });
            return;
        }
        const validCategories = ['esg', 'election', 'workforce', 'datacaffe', 'insurance'];
        if (!validCategories.includes(workCategory)) {
            res.status(400).json({ success: false, message: 'Invalid work category' });
            return;
        }
        const trimmedInput = typeof customInput === 'string' ? customInput.trim() : null;
        const profile = await prisma.userWorkProfile.upsert({
            where: { userId: req.userId },
            update: {
                workCategory,
                customInput: trimmedInput,
            },
            create: {
                userId: req.userId,
                workCategory,
                customInput: trimmedInput,
            },
        });
        logger.info('USER_AUTH', `Work profile saved for user ${req.userId}: ${workCategory}`);
        res.json({
            success: true,
            message: 'Work profile saved',
            data: {
                workCategory: profile.workCategory,
                customInput: profile.customInput,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// ==================== GET /api/user/me — Get current user ====================
router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (err) {
        next(err);
    }
});
export default router;
