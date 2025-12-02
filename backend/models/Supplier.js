const { pool } = require('../config/database');

class Supplier {
  /**
   * Create a new supplier
   */
  static async create(data) {
    const connection = await pool.getConnection();
    try {
      const {
        name,
        contact_person,
        email,
        phone,
        address,
        payment_terms,
        lead_time_days = 7,
        rating = 5.00,
        notes
      } = data;

      const [result] = await connection.query(
        `INSERT INTO suppliers 
        (name, contact_person, email, phone, address, payment_terms, lead_time_days, rating, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, contact_person || null, email || null, phone, address || null, 
         payment_terms || null, lead_time_days, rating, notes || null]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Find supplier by ID
   */
  static async findById(supplierId) {
    const connection = await pool.getConnection();
    try {
      const [suppliers] = await connection.query(
        `SELECT * FROM suppliers WHERE supplier_id = ?`,
        [supplierId]
      );

      return suppliers[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Find all suppliers with optional filters
   */
  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `SELECT * FROM suppliers WHERE 1=1`;
      const params = [];

      if (filters.is_active !== undefined) {
        query += ` AND is_active = ?`;
        params.push(filters.is_active);
      }

      if (filters.search) {
        query += ` AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.min_rating) {
        query += ` AND rating >= ?`;
        params.push(filters.min_rating);
      }

      query += ` ORDER BY name ASC`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ` OFFSET ?`;
          params.push(parseInt(filters.offset));
        }
      }

      const [suppliers] = await connection.query(query, params);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM suppliers WHERE 1=1`;
      const countParams = [];

      if (filters.is_active !== undefined) {
        countQuery += ` AND is_active = ?`;
        countParams.push(filters.is_active);
      }

      if (filters.search) {
        countQuery += ` AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)`;
        const searchTerm = `%${filters.search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const [countResult] = await connection.query(countQuery, countParams);

      return {
        suppliers,
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
   * Update supplier
   */
  static async update(supplierId, updates) {
    const connection = await pool.getConnection();
    try {
      const allowedFields = [
        'name', 'contact_person', 'email', 'phone', 'address',
        'payment_terms', 'lead_time_days', 'rating', 'notes', 'is_active'
      ];

      const fields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(supplierId);

      await connection.query(
        `UPDATE suppliers SET ${fields.join(', ')} WHERE supplier_id = ?`,
        values
      );

      return await this.findById(supplierId);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete supplier (soft delete by setting is_active = false)
   */
  static async delete(supplierId) {
    const connection = await pool.getConnection();
    try {
      // Check if supplier has ingredients
      const [ingredients] = await connection.query(
        `SELECT COUNT(*) as count FROM ingredients WHERE supplier_id = ?`,
        [supplierId]
      );

      if (ingredients[0].count > 0) {
        // Soft delete
        await connection.query(
          `UPDATE suppliers SET is_active = false WHERE supplier_id = ?`,
          [supplierId]
        );
        return { deleted: false, deactivated: true };
      } else {
        // Hard delete
        await connection.query(
          `DELETE FROM suppliers WHERE supplier_id = ?`,
          [supplierId]
        );
        return { deleted: true, deactivated: false };
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get supplier statistics
   */
  static async getStatistics() {
    const connection = await pool.getConnection();
    try {
      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as total_suppliers,
          SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_suppliers,
          SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive_suppliers,
          AVG(rating) as average_rating,
          AVG(lead_time_days) as average_lead_time
        FROM suppliers
      `);

      return stats[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get supplier with their ingredients
   */
  static async findByIdWithIngredients(supplierId) {
    const connection = await pool.getConnection();
    try {
      const [suppliers] = await connection.query(
        `SELECT * FROM suppliers WHERE supplier_id = ?`,
        [supplierId]
      );

      if (suppliers.length === 0) {
        return null;
      }

      const supplier = suppliers[0];

      const [ingredients] = await connection.query(
        `SELECT i.*, inv.current_stock 
         FROM ingredients i
         LEFT JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
         WHERE i.supplier_id = ?
         ORDER BY i.name`,
        [supplierId]
      );

      supplier.ingredients = ingredients;
      return supplier;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Supplier;
