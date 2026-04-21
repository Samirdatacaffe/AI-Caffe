declare let useMemory: boolean;
declare const memoryStore: {
    users: Map<string, Record<string, unknown>>;
    pending: Map<string, Record<string, unknown>>;
    sessions: Map<string, Record<string, unknown>[]>;
};
export { memoryStore, useMemory };
export declare const db: {
    query: (text: string, params?: unknown[]) => Promise<import("pg").QueryResult<any>>;
};
export declare const testConnection: () => Promise<boolean>;
