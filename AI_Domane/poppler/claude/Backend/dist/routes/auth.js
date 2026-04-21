import { Router } from 'express';
import { google } from 'googleapis';
import { findUserByEmail, upsertUser } from '../db/users.js';
import { createPendingVerification, verifyPendingCode } from '../db/pending.js';
import { createSession, validateSession, deleteSession, deleteAllSessions, getActiveSessions, deleteSessionById, parseUserAgent } from '../db/sessions.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import { sendVerificationEmail } from '../utils/email.js';
import { AuthError } from '../utils/errors.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
// ==================== Email Validation ====================
const isValidEmail = (email) => {
    if (typeof email !== 'string')
        return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
// ==================== POST /api/auth/check-email ====================
router.post('/check-email', authLimiter, async (req, res, next) => {
    try {
        const rawEmail = req.body?.email;
        const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
        if (!isValidEmail(email)) {
            throw new AuthError(400, 'Please enter a valid email address');
        }
        // Check if user already exists
        const existing = await findUserByEmail(email);
        const action = existing ? 'login' : 'register';
        // Generate verification code and store hash
        const code = await createPendingVerification(email);
        // Send email (logs to console in dev)
        await sendVerificationEmail(email, code);
        // In dev mode, return code directly so it can be shown in UI
        const isDev = process.env.NODE_ENV !== 'production';
        res.json({
            action,
            message: 'Verification code sent',
            ...(isDev && { code }),
        });
    }
    catch (err) {
        next(err);
    }
});
// ==================== POST /api/auth/verify-email ====================
router.post('/verify-email', authLimiter, async (req, res, next) => {
    try {
        const rawEmail = req.body?.email;
        const rawCode = req.body?.code;
        const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
        const code = typeof rawCode === 'string' ? rawCode.trim() : '';
        if (!isValidEmail(email)) {
            throw new AuthError(400, 'Please enter a valid email address');
        }
        if (!code) {
            throw new AuthError(400, 'Please enter the verification code');
        }
        // Verify code against hash
        const isValid = await verifyPendingCode(email, code);
        if (!isValid) {
            throw new AuthError(401, 'Invalid or expired code. Please try again.');
        }
        // Create or update user
        const user = await upsertUser({ email });
        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        // Store session with device info
        const ua = req.headers['user-agent'] || '';
        const device = parseUserAgent(ua);
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
        await createSession(user.id, refreshToken, { device, ipAddress });
        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// ==================== Google OAuth ====================
const getOAuth2Client = () => {
    return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
};
// GET /api/auth/google — initiate OAuth
router.get('/google', (_req, res) => {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
        prompt: 'consent',
    });
    res.redirect(authUrl);
});
// GET /api/auth/google/callback — handle callback
router.get('/google/callback', async (req, res, next) => {
    const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
        const { code } = req.query;
        if (!code || typeof code !== 'string') {
            return res.redirect(`${FRONTEND}?error=missing_code`);
        }
        const oauth2Client = getOAuth2Client();
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        // Fetch user profile
        const people = google.people({ version: 'v1', auth: oauth2Client });
        const profile = await people.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names,photos',
        });
        const email = profile.data.emailAddresses?.[0]?.value;
        const name = profile.data.names?.[0]?.displayName ?? null;
        const avatar = profile.data.photos?.[0]?.url ?? null;
        if (!email) {
            return res.redirect(`${FRONTEND}?error=no_email`);
        }
        // Create or update user
        const user = await upsertUser({ email, name, avatar });
        // Generate JWT tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        // Store session with device info
        const gua = req.headers['user-agent'] || '';
        const gDevice = parseUserAgent(gua);
        const gIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
        await createSession(user.id, refreshToken, { device: gDevice, ipAddress: gIp });
        // Set cookies and redirect
        setAuthCookies(res, accessToken, refreshToken);
        res.redirect(`${FRONTEND}/dashboard`);
    }
    catch (err) {
        console.error('[Google OAuth Error]', err);
        const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${FRONTEND}?error=oauth_failed`);
    }
});
// ==================== POST /api/auth/refresh ====================
router.post('/refresh', async (req, res, next) => {
    try {
        const token = req.cookies?.refresh_token;
        if (!token) {
            throw new AuthError(401, 'No refresh token');
        }
        // Verify JWT
        const payload = verifyRefreshToken(token);
        // Validate against DB
        const isValid = await validateSession(payload.userId, token);
        if (!isValid) {
            clearAuthCookies(res);
            throw new AuthError(401, 'Invalid session');
        }
        // Issue new access token
        const newAccessToken = generateAccessToken(payload.userId);
        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.json({ message: 'Token refreshed' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== POST /api/auth/logout ====================
router.post('/logout', async (req, res, next) => {
    try {
        const token = req.cookies?.refresh_token;
        if (token) {
            try {
                const payload = verifyRefreshToken(token);
                await deleteSession(payload.userId, token);
            }
            catch {
                // Token invalid — just clear cookies
            }
        }
        clearAuthCookies(res);
        res.json({ message: 'Logged out' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== GET /api/auth/sessions ====================
router.get('/sessions', requireAuth, async (req, res, next) => {
    try {
        const sessions = await getActiveSessions(req.userId);
        const currentUa = req.headers['user-agent'] || '';
        const currentDevice = parseUserAgent(currentUa);
        // Find the most recently active session matching this device as "current"
        const enriched = sessions.map((s) => {
            const isCurrent = s.device === currentDevice;
            return {
                id: s.id,
                device: s.device,
                location: s.location || 'Unknown',
                created_at: s.created_at,
                last_active_at: s.last_active_at,
                is_current: isCurrent,
            };
        });
        res.json({ sessions: enriched });
    }
    catch (err) {
        next(err);
    }
});
// ==================== DELETE /api/auth/sessions/:id ====================
router.delete('/sessions/:id', requireAuth, async (req, res, next) => {
    try {
        const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await deleteSessionById(req.userId, sessionId);
        res.json({ message: 'Session revoked' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== POST /api/auth/logout-all ====================
router.post('/logout-all', requireAuth, async (req, res, next) => {
    try {
        await deleteAllSessions(req.userId);
        clearAuthCookies(res);
        res.json({ message: 'Logged out of all devices' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== GET /api/auth/me ====================
router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const { findUserById } = await import('../db/users.js');
        const user = await findUserById(req.userId);
        if (!user) {
            throw new AuthError(404, 'User not found');
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
export default router;
