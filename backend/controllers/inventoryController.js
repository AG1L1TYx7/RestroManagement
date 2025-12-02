const Inventory = require('../models/Inventory');

/**
 * Get all inventory items
 */
exports.getAllInventory = async (req, res) => {
  try {
    const filters = {
      stock_status: req.query.stock_status, // out_of_stock, low_stock, sufficient
      category: req.query.category,
      supplier_id: req.query.supplier_id ? parseInt(req.query.supplier_id) : undefined,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const result = await Inventory.findAll(filters);
    
    res.json({
      success: true,
      data: result.inventory,
      count: result.inventory.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Get all inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory'
    });
  }
};

/**
 * Get inventory by ingredient ID
 */
exports.getInventoryByIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    
    const inventory = await Inventory.findByIngredientId(ingredientId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory by ingredient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item'
    });
  }
};

/**
 * Adjust inventory stock
 */
exports.adjustStock = async (req, res) => {
  try {
    const {
      ingredient_id,
      quantity,
      transaction_type, // purchase, usage, wastage, adjustment, return
      reference_type, // order, purchase_order, manual
      reference_id,
      notes,
      unit_price
    } = req.body;

    // Validate required fields
    if (!ingredient_id || !quantity || !transaction_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ingredient_id, quantity, transaction_type'
      });
    }

    // Validate transaction type
    const validTypes = ['purchase', 'usage', 'wastage', 'adjustment', 'return'];
    if (!validTypes.includes(transaction_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transaction_type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const result = await Inventory.adjustStock({
      ingredient_id,
      quantity: parseFloat(quantity),
      transaction_type,
      reference_type,
      reference_id,
      notes,
      unit_cost: unit_price ? parseFloat(unit_price) : undefined,
      performed_by: req.user?.user_id // From auth middleware
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: result
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to adjust stock'
    });
  }
};

/**
 * Get low stock items
 */
exports.getLowStock = async (req, res) => {
  try {
    const items = await Inventory.getLowStock();
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock items'
    });
  }
};

/**
 * Get inventory valuation
 */
exports.getValuation = async (req, res) => {
  try {
    const valuation = await Inventory.getValuation();
    
    res.json({
      success: true,
      data: valuation
    });
  } catch (error) {
    console.error('Get inventory valuation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate inventory valuation'
    });
  }
};

/**
 * Get transaction history for ingredient
 */
exports.getTransactionHistory = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    
    const filters = {
      transaction_type: req.query.transaction_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const transactions = await Inventory.getTransactionHistory(ingredientId, filters);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
};

/**
 * Get all transactions
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const filters = {
      transaction_type: req.query.transaction_type,
      ingredient_id: req.query.ingredient_id ? parseInt(req.query.ingredient_id) : undefined,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const transactions = await Inventory.getAllTransactions(filters);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

/**
 * Get inventory statistics
 */
exports.getInventoryStatistics = async (req, res) => {
  try {
    const stats = await Inventory.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get inventory statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory statistics'
    });
  }
};
