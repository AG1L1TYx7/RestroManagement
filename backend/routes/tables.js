const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticate } = require('../middleware/auth');
const { staffAccess, managerAccess } = require('../middleware/rbac');
const { tableValidation, tableStatusValidation, validate } = require('../utils/validators');

/**
 * @route   GET /api/v1/tables/stats
 * @desc    Get table statistics
 * @access  Private (Manager/Admin)
 */
router.get(
    '/stats',
    authenticate,
    managerAccess,
    tableController.getTableStatistics
);

/**
 * @route   GET /api/v1/tables/available
 * @desc    Get available tables for given capacity and optional time
 * @access  Private (Staff/Manager/Admin)
 */
router.get(
    '/available',
    authenticate,
    staffAccess,
    tableController.getAvailableTables
);

/**
 * @route   POST /api/v1/tables
 * @desc    Create a new table
 * @access  Private (Manager/Admin)
 */
router.post(
    '/',
    authenticate,
    managerAccess,
    tableValidation,
    validate,
    tableController.createTable
);

/**
 * @route   GET /api/v1/tables
 * @desc    Get all tables (with filtering)
 * @access  Private (Staff/Manager/Admin)
 */
router.get(
    '/',
    authenticate,
    staffAccess,
    tableController.getAllTables
);

/**
 * @route   GET /api/v1/tables/:id
 * @desc    Get table by ID
 * @access  Private (Staff/Manager/Admin)
 */
router.get(
    '/:id',
    authenticate,
    staffAccess,
    tableController.getTableById
);

/**
 * @route   PUT /api/v1/tables/:id
 * @desc    Update table
 * @access  Private (Manager/Admin)
 */
router.put(
    '/:id',
    authenticate,
    managerAccess,
    tableValidation,
    validate,
    tableController.updateTable
);

/**
 * @route   PUT /api/v1/tables/:id/status
 * @desc    Update table status
 * @access  Private (Staff/Manager/Admin)
 */
router.put(
    '/:id/status',
    authenticate,
    staffAccess,
    tableStatusValidation,
    validate,
    tableController.updateTableStatus
);

/**
 * @route   DELETE /api/v1/tables/:id
 * @desc    Delete table
 * @access  Private (Manager/Admin)
 */
router.delete(
    '/:id',
    authenticate,
    managerAccess,
    tableController.deleteTable
);

module.exports = router;
