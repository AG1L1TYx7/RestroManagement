const PurchaseOrder = require('../models/PurchaseOrder');

/**
 * Create a new purchase order
 * POST /api/v1/purchase-orders
 */
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, expected_delivery_date, notes, items } = req.body;

    // Validation
    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'supplier_id and items array are required'
        }
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.ingredient_id || !item.quantity || !item.unit_cost) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Each item must have ingredient_id, quantity, and unit_cost'
          }
        });
      }
    }

    const po = await PurchaseOrder.create(req.body, req.user.user_id);

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: { purchase_order: po }
    });
  } catch (error) {
    console.error('Create PO error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to create purchase order'
      }
    });
  }
};

/**
 * Get all purchase orders
 * GET /api/v1/purchase-orders
 */
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      supplier_id: req.query.supplier_id,
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await PurchaseOrder.findAll(filters);

    res.json({
      success: true,
      data: {
        purchase_orders: result.data,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get all POs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to fetch purchase orders'
      }
    });
  }
};

/**
 * Get purchase order by ID
 * GET /api/v1/purchase-orders/:id
 */
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase order not found'
        }
      });
    }

    res.json({
      success: true,
      data: { purchase_order: po }
    });
  } catch (error) {
    console.error('Get PO by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to fetch purchase order'
      }
    });
  }
};

/**
 * Update purchase order
 * PUT /api/v1/purchase-orders/:id
 */
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Purchase order updated successfully',
      data: { purchase_order: po }
    });
  } catch (error) {
    console.error('Update PO error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: error.message || 'Failed to update purchase order'
      }
    });
  }
};

/**
 * Update purchase order status
 * PATCH /api/v1/purchase-orders/:id/status
 */
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required'
        }
      });
    }

    const po = await PurchaseOrder.updateStatus(req.params.id, status, req.user.user_id);

    res.json({
      success: true,
      message: 'Purchase order status updated successfully',
      data: { purchase_order: po }
    });
  } catch (error) {
    console.error('Update PO status error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'STATUS_UPDATE_ERROR',
        message: error.message || 'Failed to update purchase order status'
      }
    });
  }
};

/**
 * Approve purchase order
 * POST /api/v1/purchase-orders/:id/approve
 */
exports.approvePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.approve(req.params.id, req.user.user_id);

    res.json({
      success: true,
      message: 'Purchase order approved successfully',
      data: { purchase_order: po }
    });
  } catch (error) {
    console.error('Approve PO error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'APPROVAL_ERROR',
        message: error.message || 'Failed to approve purchase order'
      }
    });
  }
};

/**
 * Receive purchase order
 * POST /api/v1/purchase-orders/:id/receive
 */
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'items array is required with po_detail_id and quantity_received'
        }
      });
    }

    const po = await PurchaseOrder.receive(req.params.id, items, req.user.user_id);

    res.json({
      success: true,
      message: 'Purchase order received successfully. Inventory updated.',
      data: { purchase_order: po }
    });
  } catch (error) {
    console.error('Receive PO error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'RECEIVE_ERROR',
        message: error.message || 'Failed to receive purchase order'
      }
    });
  }
};

/**
 * Cancel purchase order
 * DELETE /api/v1/purchase-orders/:id
 */
exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.cancel(req.params.id);

    res.json({
      success: true,
      message: 'Purchase order cancelled successfully',
      data: { purchase_order: po }
    });
  } catch (error) {
    console.error('Cancel PO error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'CANCEL_ERROR',
        message: error.message || 'Failed to cancel purchase order'
      }
    });
  }
};

/**
 * Auto-generate purchase orders from low stock
 * POST /api/v1/purchase-orders/auto-generate
 */
exports.autoGeneratePurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.autoGenerateFromLowStock(req.user.user_id);

    if (pos.length === 0) {
      return res.json({
        success: true,
        message: 'No low stock items found. No purchase orders generated.',
        data: { purchase_orders: [] }
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully generated ${pos.length} purchase order(s) from low stock items`,
      data: { purchase_orders: pos }
    });
  } catch (error) {
    console.error('Auto-generate POs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTO_GENERATE_ERROR',
        message: error.message || 'Failed to auto-generate purchase orders'
      }
    });
  }
};

/**
 * Get purchase order statistics
 * GET /api/v1/purchase-orders/statistics
 */
exports.getPurchaseOrderStatistics = async (req, res) => {
  try {
    const stats = await PurchaseOrder.getStatistics();

    res.json({
      success: true,
      data: { statistics: stats }
    });
  } catch (error) {
    console.error('Get PO statistics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to fetch statistics'
      }
    });
  }
};
