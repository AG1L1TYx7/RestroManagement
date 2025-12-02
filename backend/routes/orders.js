const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { staffAccess, managerAccess, kitchenAccess } = require('../middleware/rbac');
const { orderValidation, orderStatusValidation, paymentStatusValidation, validate } = require('../utils/validators');

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
 * @access  Private (Manager/Admin)
 */
router.get(
    '/stats',
    authenticate,
    managerAccess,
    orderController.getOrderStatistics
);

/**
 * @route   GET /api/v1/orders/kitchen
 * @desc    Get kitchen display orders
 * @access  Private (Kitchen/Staff/Manager)
 */
router.get(
    '/kitchen',
    authenticate,
    kitchenAccess,
    orderController.getKitchenOrders
);

/**
 * @route   GET /api/v1/orders/analytics/popular-items
 * @desc    Get popular menu items
 * @access  Private (Manager/Admin)
 */
router.get(
    '/analytics/popular-items',
    authenticate,
    managerAccess,
    orderController.getPopularItems
);

/**
 * @route   GET /api/v1/orders/analytics/revenue-by-category
 * @desc    Get revenue breakdown by category
 * @access  Private (Manager/Admin)
 */
router.get(
    '/analytics/revenue-by-category',
    authenticate,
    managerAccess,
    orderController.getRevenueByCategory
);

/**
 * @route   GET /api/v1/orders/my-orders
 * @desc    Get customer's own orders
 * @access  Private (Authenticated)
 */
router.get(
    '/my-orders',
    authenticate,
    orderController.getMyOrders
);

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private (Authenticated)
 */
router.post(
    '/',
    authenticate,
    orderValidation,
    validate,
    orderController.createOrder
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders (with filtering)
 * @access  Private (Staff/Manager/Admin)
 */
router.get(
    '/',
    authenticate,
    staffAccess,
    orderController.getAllOrders
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private (Customer for own, Staff/Manager/Admin for any)
 */
router.get(
    '/:id',
    authenticate,
    orderController.getOrderById
);

/**
 * @route   PUT /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Staff/Kitchen/Manager/Admin)
 */
router.put(
    '/:id/status',
    authenticate,
    kitchenAccess,
    orderStatusValidation,
    validate,
    orderController.updateOrderStatus
);

/**
 * @route   PUT /api/v1/orders/:id/payment
 * @desc    Update payment status
 * @access  Private (Staff/Manager/Admin)
 */
router.put(
    '/:id/payment',
    authenticate,
    staffAccess,
    paymentStatusValidation,
    validate,
    orderController.updatePaymentStatus
);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Cancel order
 * @access  Private (Customer for their own, Staff/Manager/Admin for any)
 */
router.delete(
    '/:id',
    authenticate,
    orderController.cancelOrder
);

module.exports = router;
