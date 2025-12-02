const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');
const { menuItemValidation, menuItemUpdateValidation, validate } = require('../utils/validators');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

/**
 * @route   GET /api/v1/menu-items/search
 * @desc    Search menu items
 * @access  Public
 * @query   q - Search query
 */
router.get('/search', menuItemController.searchMenuItems);

/**
 * @route   GET /api/v1/menu-items/popular
 * @desc    Get popular menu items
 * @access  Public
 * @query   limit - Number of items to return (default: 10)
 */
router.get('/popular', menuItemController.getPopularMenuItems);

/**
 * @route   GET /api/v1/menu-items
 * @desc    Get all menu items
 * @access  Public
 * @query   category_id - Filter by category
 * @query   available_only - Return only available items (true/false)
 * @query   search - Search term
 * @query   grouped - Group by category (true/false)
 */
router.get('/', menuItemController.getAllMenuItems);

/**
 * @route   GET /api/v1/menu-items/stats
 * @desc    Get menu item statistics
 * @access  Private (Admin/Manager)
 */
router.get('/stats', authenticate, managerAccess, menuItemController.getMenuItemStats);

/**
 * @route   GET /api/v1/menu-items/:id
 * @desc    Get menu item by ID
 * @access  Public
 */
router.get('/:id', menuItemController.getMenuItemById);

/**
 * @route   GET /api/v1/menu-items/:id/profit
 * @desc    Get menu item profit analysis
 * @access  Private (Admin/Manager)
 */
router.get(
    '/:id/profit',
    authenticate,
    managerAccess,
    menuItemController.getMenuItemProfit
);

/**
 * @route   POST /api/v1/menu-items
 * @desc    Create a new menu item
 * @access  Private (Admin/Manager)
 */
router.post(
    '/',
    authenticate,
    managerAccess,
    menuItemValidation,
    validate,
    menuItemController.createMenuItem
);

/**
 * @route   PUT /api/v1/menu-items/:id
 * @desc    Update menu item
 * @access  Private (Admin/Manager)
 */
router.put(
    '/:id',
    authenticate,
    managerAccess,
    menuItemUpdateValidation,
    validate,
    menuItemController.updateMenuItem
);

/**
 * @route   PATCH /api/v1/menu-items/:id/toggle
 * @desc    Toggle menu item availability
 * @access  Private (Admin/Manager)
 */
router.patch(
    '/:id/toggle',
    authenticate,
    managerAccess,
    menuItemController.toggleMenuItemAvailability
);

/**
 * @route   POST /api/v1/menu-items/:id/image
 * @desc    Upload menu item image
 * @access  Private (Admin/Manager)
 */
router.post(
    '/:id/image',
    authenticate,
    managerAccess,
    uploadSingle,
    handleUploadError,
    uploadController.uploadMenuItemImage
);

/**
 * @route   POST /api/v1/menu-items/update-all-availability
 * @desc    Update all menu items availability based on inventory
 * @access  Private (Admin/Manager)
 */
router.post(
    '/update-all-availability',
    authenticate,
    managerAccess,
    menuItemController.updateAllAvailabilityByInventory
);

/**
 * @route   POST /api/v1/menu-items/:id/update-availability
 * @desc    Update menu item availability based on inventory
 * @access  Private (Admin/Manager)
 */
router.post(
    '/:id/update-availability',
    authenticate,
    managerAccess,
    menuItemController.updateMenuItemAvailabilityByInventory
);

/**
 * @route   DELETE /api/v1/menu-items/:id/image
 * @desc    Delete menu item image
 * @access  Private (Admin/Manager)
 */
router.delete(
    '/:id/image',
    authenticate,
    managerAccess,
    uploadController.deleteMenuItemImage
);

/**
 * @route   DELETE /api/v1/menu-items/:id
 * @desc    Delete menu item (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticate,
    adminOnly,
    menuItemController.deleteMenuItem
);

module.exports = router;
