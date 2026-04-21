export interface SessionInfo {
    device?: string;
    ipAddress?: string;
    location?: string;
}
export interface ActiveSession {
    id: string;
    device: string;
    location: string;
    ip_address: string | null;
    created_at: Date;
    last_active_at: Date;
}
declare function parseUserAgent(ua: string): string;
export declare const createSession: (userId: string, refreshToken: string, info?: SessionInfo) => Promise<void>;
export declare const validateSession: (userId: string, refreshToken: string) => Promise<boolean>;
export declare const getActiveSessions: (userId: string) => Promise<ActiveSession[]>;
export declare const deleteSessionById: (userId: string, sessionId: string) => Promise<void>;
export declare const deleteSession: (userId: string, refreshToken: string) => Promise<void>;
export declare const deleteAllSessions: (userId: string) => Promise<void>;
export { parseUserAgent };
