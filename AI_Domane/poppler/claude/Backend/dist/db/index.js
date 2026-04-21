import pg from 'pg';
const { Pool } = pg;
let pool = null;
let useMemory = false;
// Try to connect to PostgreSQL, fall back to in-memory
try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on('error', () => {
        console.warn('[DB] Connection lost, switching to in-memory storage');
        useMemory = true;
    });
}
catch {
    useMemory = true;
}
// In-memory fallback storage
const memoryStore = {
    users: new Map(),
    pending: new Map(),
    sessions: new Map(),
};
export { memoryStore, useMemory };
export const db = {
    query: async (text, params) => {
        if (useMemory || !pool) {
            throw new Error('DB_NOT_AVAILABLE');
        }
        return pool.query(text, params);
    },
};
// Test connection on startup
export const testConnection = async () => {
    if (!pool) {
        useMemory = true;
        return false;
    }
    try {
        await pool.query('SELECT 1');
        return true;
    }
    catch {
        useMemory = true;
        return false;
    }
};
