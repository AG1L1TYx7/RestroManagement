/**
 * Role-Based Access Control (RBAC) Middleware
 * Roles hierarchy: admin > manager > staff > kitchen
 */

/**
 * Check if user has required role(s)
 * @param {string|Array} allowedRoles - Single role or array of allowed roles
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role;

        // Check if user's role is in the allowed roles
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action',
                required_role: allowedRoles,
                your_role: userRole
            });
        }

        next();
    };
};

/**
 * Admin only access
 */
const adminOnly = authorize('admin');

/**
 * Admin or Manager access
 */
const managerAccess = authorize('admin', 'manager');

/**
 * Staff level access (admin, manager, staff)
 */
const staffAccess = authorize('admin', 'manager', 'staff');

/**
 * Kitchen staff access (includes staff for operational workflows)
 */
const kitchenAccess = authorize('admin', 'manager', 'staff', 'kitchen');

/**
 * All authenticated users
 */
const authenticated = authorize('admin', 'manager', 'staff', 'kitchen');

/**
 * Check if user is accessing their own resource
 */
const ownerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
    }

    const userId = parseInt(req.params.userId || req.params.id);
    const isOwner = req.user.user_id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            status: 'error',
            message: 'You can only access your own resources'
        });
    }

    next();
};

module.exports = {
    authorize,
    adminOnly,
    managerAccess,
    staffAccess,
    kitchenAccess,
    authenticated,
    ownerOrAdmin
};
