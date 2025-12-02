const Table = require('../models/Table');

exports.createTable = async (req, res) => {
  try {
    const { table_number, capacity, location, status } = req.body;

    // Check if table number already exists
    const existing = await Table.findByTableNumber(table_number);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists'
      });
    }

    const table = await Table.create({
      table_number,
      capacity,
      location,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create table'
    });
  }
};

exports.getAllTables = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      location: req.query.location,
      min_capacity: req.query.min_capacity,
      max_capacity: req.query.max_capacity
    };

    const tables = await Table.findAll(filters);

    res.json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    console.error('Get all tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tables'
    });
  }
};

exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    console.error('Get table by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve table'
    });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const { table_number, capacity, location, status } = req.body;

    // If updating table number, check for conflicts
    if (table_number) {
      const existing = await Table.findByTableNumber(table_number);
      if (existing && existing.table_id !== parseInt(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Table number already exists'
        });
      }
    }

    const table = await Table.update(req.params.id, {
      table_number,
      capacity,
      location,
      status
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      message: 'Table updated successfully',
      data: table
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update table'
    });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const table = await Table.updateStatus(req.params.id, status);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      message: 'Table status updated successfully',
      data: table
    });
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update table status'
    });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const deleted = await Table.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete table'
    });
  }
};

exports.getTableStatistics = async (req, res) => {
  try {
    const stats = await Table.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get table statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve table statistics'
    });
  }
};

exports.getAvailableTables = async (req, res) => {
  try {
    const { capacity, date_time } = req.query;

    if (!capacity) {
      return res.status(400).json({
        success: false,
        message: 'Capacity is required'
      });
    }

    const tables = await Table.findAvailable(parseInt(capacity), date_time);

    res.json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available tables'
    });
  }
};
