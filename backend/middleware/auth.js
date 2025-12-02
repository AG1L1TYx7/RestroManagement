const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token is required'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyAccessToken(token);

        // Check if user still exists and is active
        const user = await User.findById(decoded.user_id);
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User no longer exists'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                status: 'error',
                message: 'User account is deactivated'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: error.message || 'Invalid or expired token'
        });
    }
};

/**
 * Optional authentication - doesn't fail if token is missing
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.user_id);
        
        if (user && user.is_active) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

/**
 * Middleware to authorize user based on roles
 * Usage: authorize('admin', 'manager')
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize
};
