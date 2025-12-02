const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
    try {
        const { username, email, password, full_name, role, phone } = req.body;

        // Check if email already exists
        const emailExists = await User.emailExists(email);
        if (emailExists) {
            return res.status(409).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Check if username already exists
        const usernameExists = await User.usernameExists(username);
        if (usernameExists) {
            return res.status(409).json({
                status: 'error',
                message: 'Username already taken'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            full_name,
            role: role || 'staff', // Default to staff if not provided
            phone
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    phone: user.phone
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed',
            error: error.message
        });
    }
};

/**
 * User login
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Find user by email or username
        const user = await User.findByEmailOrUsername(identifier);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                status: 'error',
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await User.comparePassword(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await User.updateLastLogin(user.user_id);

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    phone: user.phone,
                    last_login: user.last_login
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: error.message
        });
    }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user
        const user = await User.findById(decoded.user_id);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                status: 'error',
                message: 'Account is deactivated'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        res.status(200).json({
            status: 'success',
            message: 'Token refreshed successfully',
            data: {
                tokens
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Invalid or expired refresh token',
            error: error.message
        });
    }
};

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
const getProfile = async (req, res) => {
    try {
        // req.user is set by authenticate middleware
        const user = await User.findById(req.user.user_id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve profile',
            error: error.message
        });
    }
};

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        const { full_name, phone, email } = req.body;
        const userId = req.user.user_id;

        // If email is being updated, check if it's already in use
        if (email && email !== req.user.email) {
            const emailExists = await User.emailExists(email);
            if (emailExists) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email already in use'
                });
            }
        }

        // Update user
        const updatedUser = await User.update(userId, { full_name, phone, email });

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

/**
 * Update password
 * PUT /api/v1/auth/password
 */
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id;

        // Get user with password
        const user = await User.findById(userId);
        const userWithPassword = await User.findByEmail(user.email);

        // Verify current password
        const isPasswordValid = await User.comparePassword(currentPassword, userWithPassword.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await User.updatePassword(userId, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update password',
            error: error.message
        });
    }
};

/**
 * Logout (client-side token removal)
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
    try {
        // Note: JWT tokens are stateless, so logout is typically handled client-side
        // This endpoint can be used for logging purposes or token blacklisting if needed
        
        res.status(200).json({
            status: 'success',
            message: 'Logout successful. Please remove tokens from client.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Logout failed',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    refresh,
    getProfile,
    updateProfile,
    updatePassword,
    logout
};
