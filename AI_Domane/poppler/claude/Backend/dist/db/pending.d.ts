export declare const createPendingVerification: (email: string) => Promise<string>;
export declare const verifyPendingCode: (email: string, code: string) => Promise<boolean>;
