const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/purchase-orders/auto-generate
 * @desc    Auto-generate purchase orders from low stock items
 * @access  Manager, Admin
 */
router.post('/auto-generate', 
  authorize('manager', 'admin'), 
  purchaseOrderController.autoGeneratePurchaseOrders
);

/**
 * @route   GET /api/v1/purchase-orders/statistics
 * @desc    Get purchase order statistics
 * @access  Manager, Admin
 */
router.get('/statistics', 
  authorize('manager', 'admin'), 
  purchaseOrderController.getPurchaseOrderStatistics
);

/**
 * @route   GET /api/v1/purchase-orders/stats
 * @desc    Get purchase order statistics (alias)
 * @access  Manager, Admin
 */
router.get('/stats', 
  authorize('manager', 'admin'), 
  purchaseOrderController.getPurchaseOrderStatistics
);

/**
 * @route   POST /api/v1/purchase-orders
 * @desc    Create a new purchase order
 * @access  Manager, Admin
 */
router.post('/', 
  authorize('manager', 'admin'), 
  purchaseOrderController.createPurchaseOrder
);

/**
 * @route   GET /api/v1/purchase-orders
 * @desc    Get all purchase orders with filters
 * @access  Manager, Admin
 */
router.get('/', 
  authorize('manager', 'admin'), 
  purchaseOrderController.getAllPurchaseOrders
);

/**
 * @route   GET /api/v1/purchase-orders/:id
 * @desc    Get purchase order by ID
 * @access  Manager, Admin
 */
router.get('/:id', 
  authorize('manager', 'admin'), 
  purchaseOrderController.getPurchaseOrderById
);

/**
 * @route   PUT /api/v1/purchase-orders/:id
 * @desc    Update purchase order (draft only)
 * @access  Manager, Admin
 */
router.put('/:id', 
  authorize('manager', 'admin'), 
  purchaseOrderController.updatePurchaseOrder
);

/**
 * @route   PATCH /api/v1/purchase-orders/:id/status
 * @desc    Update purchase order status
 * @access  Manager, Admin
 */
router.patch('/:id/status', 
  authorize('manager', 'admin'), 
  purchaseOrderController.updatePurchaseOrderStatus
);

/**
 * @route   POST /api/v1/purchase-orders/:id/approve
 * @desc    Approve purchase order
 * @access  Manager, Admin
 */
router.post('/:id/approve', 
  authorize('manager', 'admin'), 
  purchaseOrderController.approvePurchaseOrder
);

/**
 * @route   POST /api/v1/purchase-orders/:id/receive
 * @desc    Receive purchase order (updates inventory)
 * @access  Manager, Admin
 */
router.post('/:id/receive', 
  authorize('manager', 'admin'), 
  purchaseOrderController.receivePurchaseOrder
);

/**
 * @route   DELETE /api/v1/purchase-orders/:id
 * @desc    Cancel purchase order
 * @access  Manager, Admin
 */
router.delete('/:id', 
  authorize('manager', 'admin'), 
  purchaseOrderController.cancelPurchaseOrder
);

module.exports = router;
