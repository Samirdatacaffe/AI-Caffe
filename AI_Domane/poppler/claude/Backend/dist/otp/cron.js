import cron from 'node-cron';
import { cleanupExpiredOtps } from './service.js';
import { logger } from './logger.js';
/** Start cron job to auto-delete expired OTPs */
export const startOtpCleanupCron = () => {
    const intervalMinutes = parseInt(process.env.OTP_CLEANUP_INTERVAL_MINUTES || '10', 10);
    // Run every N minutes
    const schedule = `*/${intervalMinutes} * * * *`;
    cron.schedule(schedule, async () => {
        logger.info('OTP_CRON', 'Running expired OTP cleanup...');
        await cleanupExpiredOtps();
    });
    logger.info('OTP_CRON', `Cleanup cron scheduled every ${intervalMinutes} minutes`);
};
