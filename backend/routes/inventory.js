const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/inventory
 * @desc    Get all inventory items
 * @access  Staff, Manager, Admin
 * @query   stock_status, category, supplier_id, search, limit, offset
 */
router.get('/',
  authorize('staff', 'manager', 'admin'),
  inventoryController.getAllInventory
);

/**
 * @route   GET /api/v1/inventory/low-stock
 * @desc    Get low stock items
 * @access  Staff, Manager, Admin
 */
router.get('/low-stock',
  authorize('staff', 'manager', 'admin'),
  inventoryController.getLowStock
);

/**
 * @route   GET /api/v1/inventory/valuation
 * @desc    Get inventory valuation
 * @access  Manager, Admin
 */
router.get('/valuation',
  authorize('manager', 'admin'),
  inventoryController.getValuation
);

/**
 * @route   GET /api/v1/inventory/statistics
 * @desc    Get inventory statistics
 * @access  Manager, Admin
 */
router.get('/statistics',
  authorize('manager', 'admin'),
  inventoryController.getInventoryStatistics
);

/**
 * @route   GET /api/v1/inventory/stats
 * @desc    Get inventory statistics (alias)
 * @access  Manager, Admin
 */
router.get('/stats',
  authorize('manager', 'admin'),
  inventoryController.getInventoryStatistics
);

/**
 * @route   GET /api/v1/inventory/transactions
 * @desc    Get all transactions
 * @access  Manager, Admin
 * @query   transaction_type, ingredient_id, start_date, end_date, limit, offset
 */
router.get('/transactions',
  authorize('manager', 'admin'),
  inventoryController.getAllTransactions
);

/**
 * @route   POST /api/v1/inventory/adjust
 * @desc    Adjust inventory stock
 * @access  Manager, Admin
 * @body    ingredient_id, quantity, transaction_type, reference_type, reference_id, notes, unit_price
 */
router.post('/adjust',
  authorize('manager', 'admin'),
  inventoryController.adjustStock
);

/**
 * @route   GET /api/v1/inventory/:ingredientId
 * @desc    Get inventory by ingredient ID
 * @access  Staff, Manager, Admin
 */
router.get('/:ingredientId',
  authorize('staff', 'manager', 'admin'),
  inventoryController.getInventoryByIngredient
);

/**
 * @route   GET /api/v1/inventory/:ingredientId/transactions
 * @desc    Get transaction history for ingredient
 * @access  Manager, Admin
 * @query   transaction_type, start_date, end_date, limit, offset
 */
router.get('/:ingredientId/transactions',
  authorize('manager', 'admin'),
  inventoryController.getTransactionHistory
);

module.exports = router;
