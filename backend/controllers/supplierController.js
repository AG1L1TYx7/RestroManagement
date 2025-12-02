const Supplier = require('../models/Supplier');

/**
 * Create a new supplier
 */
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Supplier with this name already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create supplier'
    });
  }
};

/**
 * Get all suppliers
 */
exports.getAllSuppliers = async (req, res) => {
  try {
    const filters = {
      is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
      search: req.query.search,
      min_rating: req.query.min_rating ? parseFloat(req.query.min_rating) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const result = await Supplier.findAll(filters);
    
    res.json({
      success: true,
      data: result.suppliers,
      count: result.suppliers.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Get all suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers'
    });
  }
};

/**
 * Get supplier by ID
 */
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const withIngredients = req.query.include === 'ingredients';

    let supplier;
    if (withIngredients) {
      supplier = await Supplier.findByIdWithIngredients(id);
    } else {
      supplier = await Supplier.findById(id);
    }

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier'
    });
  }
};

/**
 * Update supplier
 */
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await Supplier.update(id, req.body);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Supplier with this name already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update supplier'
    });
  }
};

/**
 * Delete supplier
 */
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Supplier.delete(id);

    if (result.deactivated) {
      res.json({
        success: true,
        message: 'Supplier deactivated successfully (has associated ingredients)',
        data: { deactivated: true }
      });
    } else {
      res.json({
        success: true,
        message: 'Supplier deleted successfully',
        data: { deleted: true }
      });
    }
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier'
    });
  }
};

/**
 * Get supplier statistics
 */
exports.getSupplierStatistics = async (req, res) => {
  try {
    const stats = await Supplier.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get supplier statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier statistics'
    });
  }
};
