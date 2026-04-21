-- Connect to AI_Caffe database and run this:
-- psql -U postgres -d AI_Caffe -f server/otp/schema.sql

CREATE SCHEMA IF NOT EXISTS otp_service;

CREATE TABLE IF NOT EXISTS otp_service.email_otps (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    expiry_time TIMESTAMP NOT NULL,
    attempts    INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email ON otp_service.email_otps (email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expiry ON otp_service.email_otps (expiry_time);
