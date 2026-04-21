import pg from 'pg';
import { logger } from './logger.js';

const { Pool } = pg;

const otpPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

otpPool.on('error', (err) => {
  logger.error('OTP_DB', 'Pool error', err);
});

export const otpDb = {
  query: (text: string, params?: unknown[]) => otpPool.query(text, params),
};

/** Ensure schema and table exist */
export const initOtpSchema = async (): Promise<void> => {
  try {
    await otpDb.query('CREATE SCHEMA IF NOT EXISTS otp_service');
    await otpDb.query(`
      CREATE TABLE IF NOT EXISTS otp_service.email_otps (
        id          SERIAL PRIMARY KEY,
        email       VARCHAR(255) NOT NULL,
        otp_hash    VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        expiry_time TIMESTAMP NOT NULL,
        attempts    INT DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await otpDb.query('CREATE INDEX IF NOT EXISTS idx_email_otps_email ON otp_service.email_otps (email)');
    await otpDb.query('CREATE INDEX IF NOT EXISTS idx_email_otps_expiry ON otp_service.email_otps (expiry_time)');
    logger.info('OTP_DB', 'Schema and table initialized');
  } catch (err) {
    logger.error('OTP_DB', 'Failed to initialize schema', err);
    throw err;
  }
};

/** Test connection to AI_Caffe database */
export const testOtpDbConnection = async (): Promise<boolean> => {
  try {
    await otpPool.query('SELECT 1');
    logger.info('OTP_DB', 'Connected to PostgreSQL (AI_Caffe)');
    return true;
  } catch (err) {
    logger.error('OTP_DB', 'Connection failed', err);
    return false;
  }
};
