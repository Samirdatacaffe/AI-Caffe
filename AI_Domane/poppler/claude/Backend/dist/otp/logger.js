const timestamp = () => new Date().toISOString();
export const logger = {
    info: (context, message, data) => {
        console.log(`[${timestamp()}] [INFO] [${context}] ${message}`, data ? JSON.stringify(data) : '');
    },
    warn: (context, message, data) => {
        console.warn(`[${timestamp()}] [WARN] [${context}] ${message}`, data ? JSON.stringify(data) : '');
    },
    error: (context, message, error) => {
        const errMsg = error instanceof Error ? error.message : String(error ?? '');
        console.error(`[${timestamp()}] [ERROR] [${context}] ${message}`, errMsg);
    },
};
