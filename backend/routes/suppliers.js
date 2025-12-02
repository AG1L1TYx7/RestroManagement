const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/suppliers
 * @desc    Create new supplier
 * @access  Manager, Admin
 */
router.post('/',
  authorize('manager', 'admin'),
  supplierController.createSupplier
);

/**
 * @route   GET /api/v1/suppliers
 * @desc    Get all suppliers
 * @access  Manager, Admin
 * @query   is_active, search, min_rating, limit, offset
 */
router.get('/',
  authorize('manager', 'admin'),
  supplierController.getAllSuppliers
);

/**
 * @route   GET /api/v1/suppliers/statistics
 * @desc    Get supplier statistics
 * @access  Manager, Admin
 */
router.get('/statistics',
  authorize('manager', 'admin'),
  supplierController.getSupplierStatistics
);

/**
 * @route   GET /api/v1/suppliers/stats
 * @desc    Get supplier statistics (alias)
 * @access  Manager, Admin
 */
router.get('/stats',
  authorize('manager', 'admin'),
  supplierController.getSupplierStatistics
);

/**
 * @route   GET /api/v1/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Manager, Admin
 * @query   include=ingredients (optional)
 */
router.get('/:id',
  authorize('manager', 'admin'),
  supplierController.getSupplierById
);

/**
 * @route   PUT /api/v1/suppliers/:id
 * @desc    Update supplier
 * @access  Manager, Admin
 */
router.put('/:id',
  authorize('manager', 'admin'),
  supplierController.updateSupplier
);

/**
 * @route   DELETE /api/v1/suppliers/:id
 * @desc    Delete supplier (soft delete if has ingredients)
 * @access  Admin
 */
router.delete('/:id',
  authorize('admin'),
  supplierController.deleteSupplier
);

module.exports = router;
