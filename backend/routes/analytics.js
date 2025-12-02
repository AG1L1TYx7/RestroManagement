const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes require authentication and manager/admin role
router.use(authenticate);
router.use(authorize('manager', 'admin'));

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get comprehensive dashboard statistics
 * @access  Manager, Admin
 * @query   from_date, to_date (optional)
 */
router.get('/dashboard', analyticsController.getDashboard);

/**
 * @route   GET /api/v1/analytics/sales/overview
 * @desc    Get sales overview and statistics
 * @access  Manager, Admin
 * @query   from_date, to_date, order_type (optional)
 */
router.get('/sales/overview', analyticsController.getSalesOverview);

/**
 * @route   GET /api/v1/analytics/sales/top-items
 * @desc    Get top selling menu items
 * @access  Manager, Admin
 * @query   from_date, to_date, limit (optional, default 10)
 */
router.get('/sales/top-items', analyticsController.getTopSellingItems);

/**
 * @route   GET /api/v1/analytics/sales/categories
 * @desc    Get category performance statistics
 * @access  Manager, Admin
 * @query   from_date, to_date (optional)
 */
router.get('/sales/categories', analyticsController.getCategoryPerformance);

/**
 * @route   GET /api/v1/analytics/sales
 * @desc    Get sales analytics (alias for sales/overview)
 * @access  Manager, Admin
 * @query   from_date, to_date, order_type (optional)
 */
router.get('/sales', analyticsController.getSalesOverview);

/**
 * @route   GET /api/v1/analytics/inventory
 * @desc    Get inventory analytics and insights
 * @access  Manager, Admin
 */
router.get('/inventory', analyticsController.getInventoryAnalytics);

/**
 * @route   GET /api/v1/analytics/staff
 * @desc    Get staff performance metrics
 * @access  Manager, Admin
 * @query   from_date, to_date (optional)
 */
router.get('/staff', analyticsController.getStaffPerformance);

/**
 * @route   GET /api/v1/analytics/purchase-orders
 * @desc    Get purchase order analytics
 * @access  Manager, Admin
 * @query   from_date, to_date (optional)
 */
router.get('/purchase-orders', analyticsController.getPurchaseOrderAnalytics);

/**
 * @route   GET /api/v1/analytics/revenue-trend
 * @desc    Get revenue trend over time
 * @access  Manager, Admin
 * @query   period (daily/weekly/monthly), from_date, to_date (optional)
 */
router.get('/revenue-trend', analyticsController.getRevenueTrend);

/**
 * @route   GET /api/v1/analytics/profit
 * @desc    Get profit analysis
 * @access  Manager, Admin
 * @query   from_date, to_date (optional)
 */
router.get('/profit', analyticsController.getProfitAnalysis);

/**
 * @route   GET /api/v1/analytics/comprehensive-report
 * @desc    Get comprehensive analytics report (all data)
 * @access  Manager, Admin
 * @query   from_date, to_date (optional)
 */
router.get('/comprehensive-report', analyticsController.getComprehensiveReport);

module.exports = router;
