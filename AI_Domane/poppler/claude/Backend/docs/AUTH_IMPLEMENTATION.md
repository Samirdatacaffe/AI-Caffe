# Authentication System - Technical Implementation Guide

## 1. System Architecture Overview

### High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│   Frontend   │────▶│  API Server  │────▶│  Database   │     │  Google  │
│  React + TS  │◀────│  Node/Express│◀────│  PostgreSQL │     │  OAuth   │
└─────────────┘     └──────┬───────┘     └─────────────┘     └────▲─────┘
                           │                                      │
                           └──────────────────────────────────────┘
```

### Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + TypeScript + Vite        |
| Backend    | Node.js + Express + TypeScript      |
| Database   | PostgreSQL 15+                      |
| Auth       | JWT (access + refresh tokens)       |
| OAuth      | Google OAuth 2.0                    |
| Email      | SendGrid / AWS SES                  |
| Validation | Zod (backend) + custom (frontend)   |

### Security Best Practices

- All tokens transmitted over HTTPS only
- Refresh tokens stored as bcrypt hashes in DB
- CSRF tokens on all state-changing endpoints
- Rate limiting: 5 attempts/min on auth endpoints
- Parameterized queries (no raw SQL interpolation)
- HttpOnly, Secure, SameSite=Strict cookies

---

## 2. Google OAuth Flow Implementation

### Frontend: Button Click Handler

```typescript
// src/components/AuthCard.tsx
const handleGoogleAuth = (): void => {
  // Redirect to backend OAuth initiation endpoint
  window.location.href = `${API_BASE}/api/auth/google`;
};
```

### Backend: OAuth Initiation

```typescript
// server/routes/auth.ts
import { Router, Request, Response } from 'express';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // e.g. https://api.example.com/api/auth/google/callback
);

router.get('/google', (_req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.redirect(authUrl);
});
```

### Backend: Callback Handler

```typescript
// server/routes/auth.ts
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.redirect(`${FRONTEND_URL}/login?error=missing_code`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Fetch user profile
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const profile = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });

    const email = profile.data.emailAddresses?.[0]?.value;
    const name = profile.data.names?.[0]?.displayName;
    const avatar = profile.data.photos?.[0]?.url;

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_email`);
    }

    // 3. Create or find user
    const user = await upsertUser({ email, name, avatar });

    // 4. Generate JWT tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // 5. Store session
    await createSession(user.id, refreshToken);

    // 6. Set cookies and redirect
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});
```

---

## 3. Email Input Flow Implementation

### Frontend: Email Validation & State Management

```typescript
// src/components/AuthCard.tsx
import { useState, useCallback } from 'react';

type AuthStep = 'email' | 'verify';

const AuthCard: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time email validation
  const isValidEmail = useCallback((value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, []);

  // Step 1: Submit email
  const handleContinueWithEmail = async (): Promise<void> => {
    if (!isValidEmail(email)) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      // data.action: 'verify' | 'login'
      setStep('verify');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerify = async (): Promise<void> => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Invalid code');
        return;
      }

      // Tokens set via HttpOnly cookies by backend
      window.location.href = '/dashboard';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification
  const handleResend = async (): Promise<void> => {
    setLoading(true);
    await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
  };

  // ... render JSX based on step
};
```

### Backend: Check Email Endpoint

```typescript
// server/routes/auth.ts
router.post('/check-email', rateLimiter(5, 60), async (req: Request, res: Response) => {
  const { email } = req.body;

  // 1. Sanitize and validate
  const sanitized = email?.toString().trim().toLowerCase();
  if (!sanitized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // 2. Check if user exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [sanitized]
    );

    // 3. Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(verificationCode, 10);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    // 4. Store pending verification
    await db.query(
      `INSERT INTO pending_users (email, code_hash, status, expires_at, created_at)
       VALUES ($1, $2, 'pending', $3, NOW())
       ON CONFLICT (email) DO UPDATE
       SET code_hash = $2, expires_at = $3, status = 'pending'`,
      [sanitized, codeHash, expiresAt]
    );

    // 5. Send verification email
    await sendVerificationEmail(sanitized, verificationCode);

    // 6. Respond
    const action = existing.rows.length > 0 ? 'login' : 'register';
    res.json({ action, message: 'Verification code sent' });
  } catch (error) {
    console.error('check-email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

---

## 4. Backend API Endpoints

### POST `/api/auth/check-email`

| Field         | Detail                                      |
|---------------|---------------------------------------------|
| **Method**    | POST                                        |
| **Body**      | `{ "email": "user@example.com" }`           |
| **Success**   | `200 { "action": "login" \| "register", "message": "Verification code sent" }` |
| **Errors**    | `400` Invalid email, `429` Rate limited, `500` Server error |

### POST `/api/auth/verify-email`

| Field         | Detail                                      |
|---------------|---------------------------------------------|
| **Method**    | POST                                        |
| **Body**      | `{ "email": "user@example.com", "code": "123456" }` |
| **Success**   | `200 { "user": { "id", "email", "name" } }` + Sets HttpOnly cookies |
| **Errors**    | `400` Missing fields, `401` Invalid/expired code, `429` Rate limited |

### GET `/api/auth/google`

| Field         | Detail                                      |
|---------------|---------------------------------------------|
| **Method**    | GET                                         |
| **Response**  | `302` Redirect to Google consent screen      |

### GET `/api/auth/google/callback`

| Field         | Detail                                      |
|---------------|---------------------------------------------|
| **Method**    | GET                                         |
| **Query**     | `?code=AUTH_CODE` (from Google)              |
| **Success**   | `302` Redirect to `/dashboard` + Sets HttpOnly cookies |
| **Errors**    | `302` Redirect to `/login?error=...`         |

### POST `/api/auth/refresh`

| Field         | Detail                                      |
|---------------|---------------------------------------------|
| **Method**    | POST                                        |
| **Cookies**   | `refresh_token` (HttpOnly)                   |
| **Success**   | `200` Sets new `access_token` cookie         |
| **Errors**    | `401` Invalid/expired refresh token          |

### POST `/api/auth/logout`

| Field         | Detail                                      |
|---------------|---------------------------------------------|
| **Method**    | POST                                        |
| **Cookies**   | `refresh_token` (HttpOnly)                   |
| **Success**   | `200` Clears cookies, deletes session        |

---

## 5. Database Schema

```sql
-- Users table
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(255),
    avatar      TEXT,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- Pending users (email verification)
CREATE TABLE pending_users (
    email       VARCHAR(255) PRIMARY KEY,
    code_hash   VARCHAR(255) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pending_expires ON pending_users (expires_at);

-- User sessions (refresh tokens)
CREATE TABLE user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash  VARCHAR(255) NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions (user_id);
CREATE INDEX idx_sessions_expires ON user_sessions (expires_at);
```

---

## 6. Security Implementation

### JWT Token Generation

```typescript
// server/utils/jwt.ts
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;   // 64+ char random
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;  // 64+ char random

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
```

### Auth Middleware

```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.access_token;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

### Refresh Token Hashing

```typescript
// server/utils/session.ts
import bcrypt from 'bcrypt';
import { db } from '../db';

export const createSession = async (userId: string, refreshToken: string): Promise<void> => {
  const hash = await bcrypt.hash(refreshToken, 12);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.query(
    `INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hash, expiresAt]
  );
};

export const validateSession = async (userId: string, refreshToken: string): Promise<boolean> => {
  const result = await db.query(
    `SELECT refresh_token_hash FROM user_sessions
     WHERE user_id = $1 AND expires_at > NOW()`,
    [userId]
  );

  for (const row of result.rows) {
    if (await bcrypt.compare(refreshToken, row.refresh_token_hash)) {
      return true;
    }
  }
  return false;
};
```

### Rate Limiting

```typescript
// server/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 5,                   // 5 requests per window
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### CSRF Protection

```typescript
// server/middleware/csrf.ts
import crypto from 'crypto';

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validateCsrf = (req: Request, res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const token = req.headers['x-csrf-token'];
    const sessionToken = req.cookies.csrf_token;

    if (!token || token !== sessionToken) {
      res.status(403).json({ message: 'Invalid CSRF token' });
      return;
    }
  }
  next();
};
```

---

## 7. Database Query Functions

```typescript
// server/db/users.ts
import { db } from './index';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

interface UpsertUserInput {
  email: string;
  name?: string | null;
  avatar?: string | null;
}

export const upsertUser = async (input: UpsertUserInput): Promise<User> => {
  const result = await db.query(
    `INSERT INTO users (email, name, avatar, last_login)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (email) DO UPDATE
     SET name = COALESCE($2, users.name),
         avatar = COALESCE($3, users.avatar),
         last_login = NOW()
     RETURNING id, email, name, avatar`,
    [input.email, input.name ?? null, input.avatar ?? null]
  );

  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await db.query(
    'SELECT id, email, name, avatar FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] ?? null;
};
```

---

## 8. Error Handling

```typescript
// server/utils/errors.ts

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public internalMessage?: string
  ) {
    super(userMessage);
    this.name = 'AuthError';
  }
}

// Usage in routes:
// throw new AuthError(401, 'Invalid verification code', 'Code hash mismatch for user@example.com');

// Global error handler
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AuthError) {
    if (err.internalMessage) {
      console.error(`[AuthError] ${err.internalMessage}`);
    }
    res.status(err.statusCode).json({ message: err.userMessage });
    return;
  }

  console.error('[UnhandledError]', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
```

### User-Friendly Error Messages

| Error Scenario             | HTTP Code | User Message                                  |
|----------------------------|-----------|-----------------------------------------------|
| Invalid email format       | 400       | "Please enter a valid email address"          |
| Rate limit exceeded        | 429       | "Too many attempts. Please try again later."  |
| Invalid verification code  | 401       | "Invalid or expired code. Please try again."  |
| OAuth cancelled by user    | —         | Redirect to `/login?error=cancelled`          |
| Google API failure         | 502       | "Google sign-in unavailable. Try email."      |
| Database connection lost   | 500       | "Something went wrong. Please try again."     |
| Expired refresh token      | 401       | Redirect to login page silently               |

---

## 9. Testing Strategy

### Unit Tests

```typescript
// __tests__/validation.test.ts
import { describe, it, expect } from 'vitest';

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

describe('Email validation', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('a.b+tag@domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('noatsign')).toBe(false);
    expect(isValidEmail('@nodomain')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});
```

### Integration Tests

```typescript
// __tests__/auth.integration.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('POST /api/auth/check-email', () => {
  it('returns 200 for valid email', async () => {
    const res = await request(app)
      .post('/api/auth/check-email')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.action).toMatch(/login|register/);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/check-email')
      .send({ email: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/auth/check-email')
        .send({ email: 'test@example.com' });
    }

    const res = await request(app)
      .post('/api/auth/check-email')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(429);
  });
});
```

### E2E Tests

```typescript
// e2e/auth.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('complete email authentication flow', async ({ page }) => {
  await page.goto('/');

  // Step 1: Enter email
  const emailInput = page.getByPlaceholder('Enter your email');
  await emailInput.fill('test@example.com');

  const continueBtn = page.getByRole('button', { name: 'Continue with email' });
  await expect(continueBtn).toBeEnabled();
  await continueBtn.click();

  // Step 2: Verification screen appears
  await expect(page.getByText('Have a verification code instead?')).toBeVisible();
  await expect(page.getByText('test@example.com')).toBeVisible();

  // Step 3: Enter code
  const codeInput = page.getByPlaceholder('Enter verification code');
  await codeInput.fill('123456');
  await page.getByRole('button', { name: 'Verify Email Address' }).click();

  // Step 4: Redirected to dashboard
  await expect(page).toHaveURL('/dashboard');
});

test('Google OAuth redirects correctly', async ({ page }) => {
  await page.goto('/');
  const googleBtn = page.getByRole('button', { name: /Continue with Google/i });
  await googleBtn.click();

  // Should redirect to Google consent screen
  await expect(page).toHaveURL(/accounts\.google\.com/);
});
```

---

## 10. Environment Variables

```bash
# .env (NEVER commit this file)
DATABASE_URL=postgresql://user:pass@localhost:5432/claude_auth
JWT_ACCESS_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_REDIRECT_URI=https://api.example.com/api/auth/google/callback
SENDGRID_API_KEY=SG.xxxx
FRONTEND_URL=https://example.com
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
