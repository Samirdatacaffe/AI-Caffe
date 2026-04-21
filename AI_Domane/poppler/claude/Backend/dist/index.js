import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import userAuthRoutes from './routes/userAuth.js';
import projectRoutes from './routes/projects.js';
import conversationRoutes from './routes/conversations.js';
import { errorHandler } from './utils/errors.js';
import { testConnection } from './db/index.js';
import { otpRoutes, initMailer, startOtpCleanupCron, initOtpStorage, logger } from './otp/index.js';
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// ==================== Middleware ====================
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
// ==================== Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/user', userAuthRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/projects', projectRoutes);
// Health check (before conversation routes which use requireAuth)
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api', conversationRoutes);
// ==================== Error Handler ====================
app.use(errorHandler);
// ==================== Start ====================
const start = async () => {
    const dbConnected = await testConnection();
    await initOtpStorage();
    startOtpCleanupCron();
    initMailer();
    app.listen(PORT, () => {
        logger.info('SERVER', `Running at http://localhost:${PORT}`);
        logger.info('SERVER', `Frontend: ${FRONTEND_URL}`);
        logger.info('SERVER', `Auth Storage: ${dbConnected ? 'PostgreSQL' : 'In-Memory'}`);
        console.log(`\n  Endpoints:`);
        console.log(`    POST /api/user/register        — Create account`);
        console.log(`    POST /api/user/login            — Sign in`);
        console.log(`    POST /api/user/forgot-password   — Send reset OTP`);
        console.log(`    POST /api/user/reset-password    — Reset password`);
        console.log(`    POST /api/otp/send-otp`);
        console.log(`    POST /api/otp/verify-otp`);
        console.log(`    GET  /api/health\n`);
    });
};
start();
export { app };
