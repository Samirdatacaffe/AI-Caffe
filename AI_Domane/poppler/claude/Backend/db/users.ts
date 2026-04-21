import crypto from 'crypto';
import { db, memoryStore, useMemory } from './index.js';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  last_login: Date | null;
  created_at: Date;
}

export interface UpsertUserInput {
  email: string;
  name?: string | null;
  avatar?: string | null;
}

export const upsertUser = async (input: UpsertUserInput): Promise<User> => {
  if (useMemory) {
    const existing = memoryStore.users.get(input.email);
    const user: User = {
      id: (existing?.id as string) || crypto.randomUUID(),
      email: input.email,
      name: input.name ?? (existing?.name as string | null) ?? null,
      avatar: input.avatar ?? (existing?.avatar as string | null) ?? null,
      last_login: new Date(),
      created_at: (existing?.created_at as Date) || new Date(),
    };
    memoryStore.users.set(input.email, user as unknown as Record<string, unknown>);
    return user;
  }

  const result = await db.query(
    `INSERT INTO users (email, name, avatar, last_login)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (email) DO UPDATE
     SET name = COALESCE($2, users.name),
         avatar = COALESCE($3, users.avatar),
         last_login = NOW()
     RETURNING *`,
    [input.email, input.name ?? null, input.avatar ?? null]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  if (useMemory) {
    const user = memoryStore.users.get(email);
    return (user as unknown as User) ?? null;
  }

  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  if (useMemory) {
    for (const user of memoryStore.users.values()) {
      if (user.id === id) return user as unknown as User;
    }
    return null;
  }

  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
};
