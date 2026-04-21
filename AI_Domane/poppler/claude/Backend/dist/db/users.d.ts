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
export declare const upsertUser: (input: UpsertUserInput) => Promise<User>;
export declare const findUserByEmail: (email: string) => Promise<User | null>;
export declare const findUserById: (id: string) => Promise<User | null>;
