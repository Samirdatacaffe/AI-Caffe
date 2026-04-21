import { verifyAccessToken } from '../utils/jwt.js';
export const requireAuth = (req, res, next) => {
    const token = req.cookies?.access_token;
    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        req.userId = payload.userId;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
