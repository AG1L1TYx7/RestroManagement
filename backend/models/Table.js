const { pool } = require('../config/database');

class Table {
  /**
   * Create a new table
   */
  static async create({ table_number, capacity, location, status = 'available' }) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO tables (table_number, capacity, location, status) VALUES (?, ?, ?, ?)',
        [table_number, capacity, location || null, status]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Find table by ID
   */
  static async findById(tableId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          table_id,
          table_number,
          capacity,
          status,
          location,
          created_at,
          updated_at
        FROM tables
        WHERE table_id = ?`,
        [tableId]
      );

      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Find table by table number
   */
  static async findByTableNumber(tableNumber) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          table_id,
          table_number,
          capacity,
          status,
          location,
          created_at,
          updated_at
        FROM tables
        WHERE table_number = ?`,
        [tableNumber]
      );

      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all tables with optional filters
   */
  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          t.table_id,
          t.table_number,
          t.capacity,
          t.status,
          t.location,
          t.created_at,
          t.updated_at,
          o.order_id,
          o.order_number,
          o.total
        FROM tables t
        LEFT JOIN orders o ON t.table_id = o.table_id 
          AND o.status IN ('pending', 'preparing', 'ready')
        WHERE 1=1
      `;

      const params = [];

      if (filters.status) {
        query += ' AND t.status = ?';
        params.push(filters.status);
      }

      if (filters.location) {
        query += ' AND t.location = ?';
        params.push(filters.location);
      }

      if (filters.min_capacity) {
        query += ' AND t.capacity >= ?';
        params.push(filters.min_capacity);
      }

      if (filters.max_capacity) {
        query += ' AND t.capacity <= ?';
        params.push(filters.max_capacity);
      }

      query += ' ORDER BY t.table_number';

      const [rows] = await connection.query(query, params);

      // Group by table_id to handle multiple active orders
      const tablesMap = new Map();
      rows.forEach(row => {
        if (!tablesMap.has(row.table_id)) {
          tablesMap.set(row.table_id, {
            table_id: row.table_id,
            table_number: row.table_number,
            capacity: row.capacity,
            status: row.status,
            location: row.location,
            created_at: row.created_at,
            updated_at: row.updated_at,
            active_orders: []
          });
        }

        if (row.order_id) {
          tablesMap.get(row.table_id).active_orders.push({
            order_id: row.order_id,
            order_number: row.order_number,
            total: row.total
          });
        }
      });

      return Array.from(tablesMap.values());
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update table
   */
  static async update(tableId, updates) {
    const connection = await pool.getConnection();
    try {
      const allowedFields = ['table_number', 'capacity', 'location', 'status'];
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

      values.push(tableId);

      await connection.query(
        `UPDATE tables SET ${fields.join(', ')} WHERE table_id = ?`,
        values
      );

      return await this.findById(tableId);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update table status
   */
  static async updateStatus(tableId, status) {
    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await this.update(tableId, { status });
  }

  /**
   * Delete table
   */
  static async delete(tableId) {
    const connection = await pool.getConnection();
    try {
      // Check if table has active orders
      const [orders] = await connection.query(
        'SELECT order_id FROM orders WHERE table_id = ? AND status IN (?, ?, ?)',
        [tableId, 'pending', 'preparing', 'ready']
      );

      if (orders.length > 0) {
        throw new Error('Cannot delete table with active orders');
      }

      const [result] = await connection.query(
        'DELETE FROM tables WHERE table_id = ?',
        [tableId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get table statistics
   */
  static async getStatistics() {
    const connection = await pool.getConnection();
    try {
      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as total_tables,
          SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_tables,
          SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_tables,
          SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved_tables,
          SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_tables,
          SUM(capacity) as total_capacity,
          AVG(capacity) as avg_capacity
        FROM tables
      `);

      return stats[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get available tables for given capacity and optional time
   */
  static async findAvailable(capacity, dateTime = null) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          table_id,
          table_number,
          capacity,
          status,
          location,
          created_at,
          updated_at
        FROM tables
        WHERE capacity >= ? 
          AND status = 'available'
      `;

      const params = [capacity];

      // If dateTime provided, check for reservations
      if (dateTime) {
        query += ` AND table_id NOT IN (
          SELECT table_id 
          FROM reservations 
          WHERE status IN ('pending', 'confirmed')
            AND DATE(reservation_date) = DATE(?)
            AND TIME(reservation_date) BETWEEN 
              TIME(? - INTERVAL 2 HOUR) AND TIME(? + INTERVAL 2 HOUR)
        )`;
        params.push(dateTime, dateTime, dateTime);
      }

      query += ' ORDER BY capacity ASC';

      const [rows] = await connection.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Table;
