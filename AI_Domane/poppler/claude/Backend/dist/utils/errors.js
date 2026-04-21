export class AuthError extends Error {
    statusCode;
    userMessage;
    internalMessage;
    constructor(statusCode, userMessage, internalMessage) {
        super(userMessage);
        this.statusCode = statusCode;
        this.userMessage = userMessage;
        this.internalMessage = internalMessage;
        this.name = 'AuthError';
    }
}
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AuthError) {
        if (err.internalMessage) {
            console.error(`[AuthError] ${err.internalMessage}`);
        }
        res.status(err.statusCode).json({ message: err.userMessage });
        return;
    }
    console.error('[UnhandledError]', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
