import crypto from 'crypto';
import { db, memoryStore, useMemory } from './index.js';
export const upsertUser = async (input) => {
    if (useMemory) {
        const existing = memoryStore.users.get(input.email);
        const user = {
            id: existing?.id || crypto.randomUUID(),
            email: input.email,
            name: input.name ?? existing?.name ?? null,
            avatar: input.avatar ?? existing?.avatar ?? null,
            last_login: new Date(),
            created_at: existing?.created_at || new Date(),
        };
        memoryStore.users.set(input.email, user);
        return user;
    }
    const result = await db.query(`INSERT INTO users (email, name, avatar, last_login)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (email) DO UPDATE
     SET name = COALESCE($2, users.name),
         avatar = COALESCE($3, users.avatar),
         last_login = NOW()
     RETURNING *`, [input.email, input.name ?? null, input.avatar ?? null]);
    return result.rows[0];
};
export const findUserByEmail = async (email) => {
    if (useMemory) {
        const user = memoryStore.users.get(email);
        return user ?? null;
    }
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ?? null;
};
export const findUserById = async (id) => {
    if (useMemory) {
        for (const user of memoryStore.users.values()) {
            if (user.id === id)
                return user;
        }
        return null;
    }
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
};
