-- Run this to initialize the database:
-- psql -U postgres -c "CREATE DATABASE claude_auth;"
-- psql -U postgres -d claude_auth -f server/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(255),
    avatar      TEXT,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Pending users (email verification codes)
CREATE TABLE IF NOT EXISTS pending_users (
    email       VARCHAR(255) PRIMARY KEY,
    code_hash   VARCHAR(255) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_expires ON pending_users (expires_at);

-- User sessions (refresh tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash  VARCHAR(255) NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions (expires_at);
