export declare const logger: {
    info: (context: string, message: string, data?: Record<string, unknown>) => void;
    warn: (context: string, message: string, data?: Record<string, unknown>) => void;
    error: (context: string, message: string, error?: unknown) => void;
};
