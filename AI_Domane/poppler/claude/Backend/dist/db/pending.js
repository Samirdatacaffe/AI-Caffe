import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db, memoryStore, useMemory } from './index.js';
const CODE_EXPIRY_MINUTES = 30;
export const createPendingVerification = async (email) => {
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    if (useMemory) {
        memoryStore.pending.set(email, {
            email,
            code_hash: codeHash,
            status: 'pending',
            expires_at: expiresAt,
            created_at: new Date(),
        });
        return code;
    }
    await db.query(`INSERT INTO pending_users (email, code_hash, status, expires_at, created_at)
     VALUES ($1, $2, 'pending', $3, NOW())
     ON CONFLICT (email) DO UPDATE
     SET code_hash = $2, expires_at = $3, status = 'pending', created_at = NOW()`, [email, codeHash, expiresAt]);
    return code;
};
export const verifyPendingCode = async (email, code) => {
    if (useMemory) {
        const pending = memoryStore.pending.get(email);
        if (!pending)
            return false;
        if (pending.status !== 'pending')
            return false;
        if (new Date(pending.expires_at) < new Date())
            return false;
        const isValid = await bcrypt.compare(code, pending.code_hash);
        if (isValid) {
            pending.status = 'verified';
        }
        return isValid;
    }
    const result = await db.query(`SELECT code_hash FROM pending_users
     WHERE email = $1 AND status = 'pending' AND expires_at > NOW()`, [email]);
    if (result.rows.length === 0)
        return false;
    const isValid = await bcrypt.compare(code, result.rows[0].code_hash);
    if (isValid) {
        await db.query(`UPDATE pending_users SET status = 'verified' WHERE email = $1`, [email]);
    }
    return isValid;
};
