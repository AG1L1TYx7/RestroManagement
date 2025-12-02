const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
    registerValidation,
    loginValidation,
    profileUpdateValidation,
    passwordUpdateValidation,
    validate
} = require('../utils/validators');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, validate, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, profileUpdateValidation, validate, authController.updateProfile);

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', authenticate, passwordUpdateValidation, validate, authController.updatePassword);

module.exports = router;
