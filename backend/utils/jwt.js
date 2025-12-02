const jwt = require('jsonwebtoken');

/**
 * Generate access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h'
    });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    });
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokens = (user) => {
    const payload = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokens
};
