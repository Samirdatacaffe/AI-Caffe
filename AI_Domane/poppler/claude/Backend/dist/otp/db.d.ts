export declare const otpDb: {
    query: (text: string, params?: unknown[]) => Promise<import("pg").QueryResult<any>>;
};
/** Ensure schema and table exist */
export declare const initOtpSchema: () => Promise<void>;
/** Test connection to AI_Caffe database */
export declare const testOtpDbConnection: () => Promise<boolean>;
