const timestamp = (): string => new Date().toISOString();

export const logger = {
  info: (context: string, message: string, data?: Record<string, unknown>) => {
    console.log(`[${timestamp()}] [INFO] [${context}] ${message}`, data ? JSON.stringify(data) : '');
  },
  warn: (context: string, message: string, data?: Record<string, unknown>) => {
    console.warn(`[${timestamp()}] [WARN] [${context}] ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (context: string, message: string, error?: unknown) => {
    const errMsg = error instanceof Error ? error.message : String(error ?? '');
    console.error(`[${timestamp()}] [ERROR] [${context}] ${message}`, errMsg);
  },
};
