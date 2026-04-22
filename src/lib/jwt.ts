import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_replace_this';

export const generateToken = (userId: string | bigint, version: number = 0) => {
    // Convert BigInt to string if necessary, as JWT payload must be JSON serializable
    const id = typeof userId === 'bigint' ? userId.toString() : userId;
    return jwt.sign({ id, version }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
