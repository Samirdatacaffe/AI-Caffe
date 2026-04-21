/** Email sending utility — plug in SendGrid, AWS SES, or any provider */
export declare const sendVerificationEmail: (to: string, code: string) => Promise<void>;
