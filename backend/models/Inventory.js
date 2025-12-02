const { pool } = require('../config/database');

class Inventory {
  /**
   * Get all inventory with ingredient details
   */
  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          inv.inventory_id,
          inv.ingredient_id,
          inv.current_stock,
          inv.last_restocked,
          inv.expiry_date,
          ing.name as ingredient_name,
          ing.unit,
          ing.cost_per_unit,
          ing.min_stock_level,
          ing.reorder_quantity,
          ing.category,
          s.name as supplier_name,
          s.supplier_id,
          (inv.current_stock * ing.cost_per_unit) as stock_value,
          CASE 
            WHEN inv.current_stock <= 0 THEN 'out_of_stock'
            WHEN inv.current_stock <= ing.min_stock_level THEN 'low_stock'
            ELSE 'sufficient'
          END as stock_status
        FROM inventory inv
        INNER JOIN ingredients ing ON inv.ingredient_id = ing.ingredient_id
        LEFT JOIN suppliers s ON ing.supplier_id = s.supplier_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.stock_status) {
        if (filters.stock_status === 'low') {
          query += ` AND inv.current_stock <= ing.min_stock_level`;
        } else if (filters.stock_status === 'out_of_stock') {
          query += ` AND inv.current_stock <= 0`;
        } else if (filters.stock_status === 'sufficient') {
          query += ` AND inv.current_stock > ing.min_stock_level`;
        }
      }

      if (filters.category) {
        query += ` AND ing.category = ?`;
        params.push(filters.category);
      }

      if (filters.supplier_id) {
        query += ` AND ing.supplier_id = ?`;
        params.push(filters.supplier_id);
      }

      if (filters.search) {
        query += ` AND ing.name LIKE ?`;
        params.push(`%${filters.search}%`);
      }

      query += ` ORDER BY ing.name ASC`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ` OFFSET ?`;
          params.push(parseInt(filters.offset));
        }
      }

      const [inventory] = await connection.query(query, params);

      // Get count
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM inventory inv
        INNER JOIN ingredients ing ON inv.ingredient_id = ing.ingredient_id
        WHERE 1=1
      `;
      const countParams = [];

      if (filters.stock_status) {
        if (filters.stock_status === 'low') {
          countQuery += ` AND inv.current_stock <= ing.min_stock_level`;
        } else if (filters.stock_status === 'out_of_stock') {
          countQuery += ` AND inv.current_stock <= 0`;
        }
      }

      if (filters.category) {
        countQuery += ` AND ing.category = ?`;
        countParams.push(filters.category);
      }

      const [countResult] = await connection.query(countQuery, countParams);

      return {
        inventory,
        total: countResult[0].total,
        page: filters.offset ? Math.floor(filters.offset / (filters.limit || 10)) + 1 : 1,
        totalPages: filters.limit ? Math.ceil(countResult[0].total / filters.limit) : 1
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get inventory by ingredient ID
   */
  static async findByIngredientId(ingredientId) {
    const connection = await pool.getConnection();
    try {
      const [inventory] = await connection.query(
        `SELECT 
          inv.*,
          ing.name as ingredient_name,
          ing.unit,
          ing.cost_per_unit,
          ing.min_stock_level,
          ing.reorder_quantity,
          s.name as supplier_name
         FROM inventory inv
         INNER JOIN ingredients ing ON inv.ingredient_id = ing.ingredient_id
         LEFT JOIN suppliers s ON ing.supplier_id = s.supplier_id
         WHERE inv.ingredient_id = ?`,
        [ingredientId]
      );

      return inventory[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Adjust stock level (add or subtract)
   */
  static async adjustStock(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        ingredient_id,
        quantity,
        transaction_type,
        unit_cost,
        reference_type,
        reference_id,
        notes,
        performed_by
      } = data;

      // Get current inventory
      const [inventory] = await connection.query(
        `SELECT * FROM inventory WHERE ingredient_id = ?`,
        [ingredient_id]
      );

      let newStock;
      if (inventory.length === 0) {
        // Create new inventory entry
        newStock = quantity;
        await connection.query(
          `INSERT INTO inventory (ingredient_id, current_stock, last_restocked) 
           VALUES (?, ?, NOW())`,
          [ingredient_id, newStock]
        );
      } else {
        // Update existing inventory
        const currentStock = parseFloat(inventory[0].current_stock);
        
        if (transaction_type === 'usage' || transaction_type === 'wastage') {
          newStock = currentStock - Math.abs(quantity);
        } else if (transaction_type === 'purchase' || transaction_type === 'return') {
          newStock = currentStock + Math.abs(quantity);
        } else if (transaction_type === 'adjustment') {
          newStock = currentStock + quantity; // Can be positive or negative
        } else {
          throw new Error(`Invalid transaction type: ${transaction_type}`);
        }

        // Prevent negative stock
        if (newStock < 0) {
          throw new Error(`Insufficient stock. Current: ${currentStock}, Requested: ${Math.abs(quantity)}`);
        }

        await connection.query(
          `UPDATE inventory 
           SET current_stock = ?,
               last_restocked = CASE WHEN ? IN ('purchase', 'return') THEN NOW() ELSE last_restocked END
           WHERE ingredient_id = ?`,
          [newStock, transaction_type, ingredient_id]
        );
      }

      // Log transaction
      await connection.query(
        `INSERT INTO inventory_transactions 
        (ingredient_id, transaction_type, quantity, unit_cost, reference_type, reference_id, notes, performed_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ingredient_id, transaction_type, quantity, unit_cost || null, 
         reference_type || null, reference_id || null, notes || null, performed_by]
      );

      await connection.commit();

      return await this.findByIngredientId(ingredient_id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get low stock items
   */
  static async getLowStock() {
    const connection = await pool.getConnection();
    try {
      const [items] = await connection.query(`
        SELECT 
          inv.inventory_id,
          inv.ingredient_id,
          inv.current_stock,
          ing.name as ingredient_name,
          ing.unit,
          ing.min_stock_level,
          ing.reorder_quantity,
          ing.cost_per_unit,
          s.name as supplier_name,
          s.supplier_id,
          s.lead_time_days,
          (ing.reorder_quantity * ing.cost_per_unit) as reorder_cost
        FROM inventory inv
        INNER JOIN ingredients ing ON inv.ingredient_id = ing.ingredient_id
        LEFT JOIN suppliers s ON ing.supplier_id = s.supplier_id
        WHERE inv.current_stock <= ing.min_stock_level
        ORDER BY 
          CASE WHEN inv.current_stock <= 0 THEN 0 ELSE 1 END,
          (inv.current_stock / ing.min_stock_level) ASC
      `);

      return items;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get inventory valuation
   */
  static async getValuation(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          SUM(inv.current_stock * ing.cost_per_unit) as total_value,
          COUNT(DISTINCT inv.ingredient_id) as total_items,
          SUM(CASE WHEN inv.current_stock <= 0 THEN 1 ELSE 0 END) as out_of_stock_count,
          SUM(CASE WHEN inv.current_stock > 0 AND inv.current_stock <= ing.min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
          SUM(CASE WHEN inv.current_stock > ing.min_stock_level THEN 1 ELSE 0 END) as sufficient_stock_count
        FROM inventory inv
        INNER JOIN ingredients ing ON inv.ingredient_id = ing.ingredient_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.category) {
        query += ` AND ing.category = ?`;
        params.push(filters.category);
      }

      const [result] = await connection.query(query, params);

      return result[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get transaction history for an ingredient
   */
  static async getTransactionHistory(ingredientId, filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          it.*,
          ing.name as ingredient_name,
          ing.unit,
          u.full_name as performed_by_name,
          u.username as performed_by_username
        FROM inventory_transactions it
        INNER JOIN ingredients ing ON it.ingredient_id = ing.ingredient_id
        INNER JOIN users u ON it.performed_by = u.user_id
        WHERE it.ingredient_id = ?
      `;
      const params = [ingredientId];

      if (filters.transaction_type) {
        query += ` AND it.transaction_type = ?`;
        params.push(filters.transaction_type);
      }

      if (filters.start_date) {
        query += ` AND it.created_at >= ?`;
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        query += ` AND it.created_at <= ?`;
        params.push(filters.end_date);
      }

      query += ` ORDER BY it.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(filters.limit));
      }

      const [transactions] = await connection.query(query, params);

      return transactions;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all transaction history with filters
   */
  static async getAllTransactions(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          it.*,
          ing.name as ingredient_name,
          ing.unit,
          u.full_name as performed_by_name
        FROM inventory_transactions it
        INNER JOIN ingredients ing ON it.ingredient_id = ing.ingredient_id
        INNER JOIN users u ON it.performed_by = u.user_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.transaction_type) {
        query += ` AND it.transaction_type = ?`;
        params.push(filters.transaction_type);
      }

      if (filters.start_date) {
        query += ` AND it.created_at >= ?`;
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        query += ` AND it.created_at <= ?`;
        params.push(filters.end_date);
      }

      query += ` ORDER BY it.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(filters.limit));

        if (filters.offset) {
          query += ` OFFSET ?`;
          params.push(parseInt(filters.offset));
        }
      }

      const [transactions] = await connection.query(query, params);

      return transactions;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get inventory statistics
   */
  static async getStatistics() {
    const connection = await pool.getConnection();
    try {
      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as total_items,
          SUM(inv.current_stock * ing.cost_per_unit) as total_value,
          SUM(CASE WHEN inv.current_stock <= 0 THEN 1 ELSE 0 END) as out_of_stock,
          SUM(CASE WHEN inv.current_stock > 0 AND inv.current_stock <= ing.min_stock_level THEN 1 ELSE 0 END) as low_stock,
          SUM(CASE WHEN inv.current_stock > ing.min_stock_level THEN 1 ELSE 0 END) as sufficient_stock,
          AVG(inv.current_stock) as avg_stock_level
        FROM inventory inv
        INNER JOIN ingredients ing ON inv.ingredient_id = ing.ingredient_id
      `);

      return stats[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Inventory;
