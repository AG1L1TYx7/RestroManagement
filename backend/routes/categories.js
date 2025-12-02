const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');
const { categoryValidation, validate } = require('../utils/validators');

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 * @query   active_only - Return only active categories (true/false)
 * @query   with_count - Include menu item count (true/false)
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/stats
 * @desc    Get category statistics
 * @access  Private (Admin/Manager)
 */
router.get('/stats', authenticate, managerAccess, categoryController.getCategoryStats);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   GET /api/v1/categories/:id/items
 * @desc    Get menu items for a category
 * @access  Public
 * @query   available_only - Return only available items (true/false)
 */
router.get('/:id/items', categoryController.getCategoryMenuItems);

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private (Admin/Manager)
 */
router.post(
    '/',
    authenticate,
    managerAccess,
    categoryValidation,
    validate,
    categoryController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Admin/Manager)
 */
router.put(
    '/:id',
    authenticate,
    managerAccess,
    categoryValidation,
    validate,
    categoryController.updateCategory
);

/**
 * @route   PATCH /api/v1/categories/:id/toggle
 * @desc    Toggle category active status
 * @access  Private (Admin/Manager)
 */
router.patch(
    '/:id/toggle',
    authenticate,
    managerAccess,
    categoryController.toggleCategoryStatus
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticate,
    adminOnly,
    categoryController.deleteCategory
);

module.exports = router;
