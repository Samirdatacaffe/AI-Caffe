import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db, memoryStore, useMemory } from './index.js';
const REFRESH_TOKEN_EXPIRY_DAYS = 10;
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
function isLocalIp(ip) {
    return !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:127.') ||
        ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip === 'localhost';
}
async function resolveLocation(ip) {
    try {
        let lookupIp = ip;
        // For local/private IPs, get the public IP first
        if (!lookupIp || isLocalIp(lookupIp)) {
            const pubRes = await fetch('https://api.ipify.org?format=json');
            if (pubRes.ok) {
                const pubData = await pubRes.json();
                lookupIp = pubData.ip;
            }
        }
        if (!lookupIp)
            return { location: 'Unknown', publicIp: null };
        // Resolve location from IP
        const geoRes = await fetch(`http://ip-api.com/json/${lookupIp}?fields=status,city,regionName,countryCode`);
        if (geoRes.ok) {
            const geo = await geoRes.json();
            if (geo.status === 'success' && geo.city) {
                return {
                    location: `${geo.city}, ${geo.regionName}, ${geo.countryCode}`,
                    publicIp: lookupIp,
                };
            }
        }
    }
    catch {
        // Silently fail
    }
    return { location: 'Unknown', publicIp: ip };
}
export const createSession = async (userId, refreshToken, info) => {
    const hash = await bcrypt.hash(refreshToken, 12);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const device = info?.device || 'Unknown';
    const rawIp = info?.ipAddress || null;
    // Resolve location from IP (handles localhost by fetching public IP)
    const { location, publicIp } = await resolveLocation(rawIp);
    const ipAddress = publicIp || rawIp;
    if (useMemory) {
        const sessions = memoryStore.sessions.get(userId) || [];
        sessions.push({
            id: crypto.randomUUID(),
            user_id: userId,
            refresh_token_hash: hash,
            expires_at: expiresAt,
            device,
            ip_address: ipAddress,
            location,
            last_active_at: new Date(),
            created_at: new Date(),
        });
        memoryStore.sessions.set(userId, sessions);
        return;
    }
    await db.query(`INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at, device, ip_address, location, last_active_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`, [userId, hash, expiresAt, device, ipAddress, location]);
};
export const validateSession = async (userId, refreshToken) => {
    if (useMemory) {
        const sessions = memoryStore.sessions.get(userId) || [];
        for (const s of sessions) {
            if (new Date(s.expires_at) > new Date()) {
                if (await bcrypt.compare(refreshToken, s.refresh_token_hash)) {
                    return true;
                }
            }
        }
        return false;
    }
    const result = await db.query(`SELECT id, refresh_token_hash FROM user_sessions
     WHERE user_id = $1 AND expires_at > NOW()`, [userId]);
    for (const row of result.rows) {
        if (await bcrypt.compare(refreshToken, row.refresh_token_hash)) {
            // Update last_active_at
            await db.query('UPDATE user_sessions SET last_active_at = NOW() WHERE id = $1', [row.id]);
            return true;
        }
    }
    return false;
};
export const getActiveSessions = async (userId) => {
    if (useMemory) {
        const sessions = memoryStore.sessions.get(userId) || [];
        return sessions
            .filter((s) => new Date(s.expires_at) > new Date())
            .map((s) => ({
            id: s.id,
            device: s.device || 'Unknown',
            location: s.location || 'Unknown',
            ip_address: s.ip_address || null,
            created_at: new Date(s.created_at),
            last_active_at: new Date((s.last_active_at || s.created_at)),
        }));
    }
    const result = await db.query(`SELECT id, device, location, ip_address, created_at, last_active_at
     FROM user_sessions
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY last_active_at DESC`, [userId]);
    return result.rows;
};
export const deleteSessionById = async (userId, sessionId) => {
    if (useMemory) {
        const sessions = memoryStore.sessions.get(userId) || [];
        const idx = sessions.findIndex((s) => s.id === sessionId);
        if (idx !== -1)
            sessions.splice(idx, 1);
        return;
    }
    await db.query('DELETE FROM user_sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
};
export const deleteSession = async (userId, refreshToken) => {
    if (useMemory) {
        const sessions = memoryStore.sessions.get(userId) || [];
        for (let i = 0; i < sessions.length; i++) {
            if (await bcrypt.compare(refreshToken, sessions[i].refresh_token_hash)) {
                sessions.splice(i, 1);
                break;
            }
        }
        return;
    }
    const result = await db.query(`SELECT id, refresh_token_hash FROM user_sessions
     WHERE user_id = $1 AND expires_at > NOW()`, [userId]);
    for (const row of result.rows) {
        if (await bcrypt.compare(refreshToken, row.refresh_token_hash)) {
            await db.query('DELETE FROM user_sessions WHERE id = $1', [row.id]);
            return;
        }
    }
};
export const deleteAllSessions = async (userId) => {
    if (useMemory) {
        memoryStore.sessions.delete(userId);
        return;
    }
    await db.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
};
export { parseUserAgent };
