const { pool } = require('../config/database');

class Reservation {
  /**
   * Convert ISO8601 datetime to MySQL datetime format
   */
  static convertToMySQLDatetime(isoDate) {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Create a new reservation
   */
  static async create(data) {
    const connection = await pool.getConnection();
    try {
      const {
        table_id,
        customer_name,
        customer_phone,
        customer_email,
        party_size,
        reservation_date,
        duration_minutes = 120,
        special_requests,
        created_by
      } = data;

      // Convert ISO8601 to MySQL datetime
      const mysqlDate = this.convertToMySQLDatetime(reservation_date);

      // Check if table exists and get its capacity
      const [tables] = await connection.query(
        'SELECT table_id, capacity FROM tables WHERE table_id = ?',
        [table_id]
      );

      if (tables.length === 0) {
        throw new Error('Table not found');
      }

      if (party_size > tables[0].capacity) {
        throw new Error(`Party size (${party_size}) exceeds table capacity (${tables[0].capacity})`);
      }

      // Check for conflicts
      const hasConflict = await this.checkConflict(table_id, mysqlDate, duration_minutes, null);
      if (hasConflict) {
        throw new Error('This time slot is already reserved');
      }

      const [result] = await connection.query(
        `INSERT INTO reservations 
        (table_id, customer_name, customer_phone, customer_email, party_size, 
         reservation_date, duration_minutes, special_requests, created_by, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          table_id,
          customer_name,
          customer_phone,
          customer_email || null,
          party_size,
          mysqlDate,
          duration_minutes,
          special_requests || null,
          created_by
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Check if there's a reservation conflict
   */
  static async checkConflict(tableId, reservationDate, durationMinutes, excludeReservationId = null) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT reservation_id 
        FROM reservations 
        WHERE table_id = ?
          AND status IN ('pending', 'confirmed', 'seated')
          AND (
            (reservation_date <= ? AND DATE_ADD(reservation_date, INTERVAL duration_minutes MINUTE) > ?)
            OR (reservation_date < DATE_ADD(?, INTERVAL ? MINUTE) AND reservation_date >= ?)
          )
      `;

      const params = [
        tableId,
        reservationDate,
        reservationDate,
        reservationDate,
        durationMinutes,
        reservationDate
      ];

      if (excludeReservationId) {
        query += ' AND reservation_id != ?';
        params.push(excludeReservationId);
      }

      const [conflicts] = await connection.query(query, params);
      return conflicts.length > 0;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Find reservation by ID
   */
  static async findById(reservationId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          r.reservation_id,
          r.table_id,
          r.customer_name,
          r.customer_phone,
          r.customer_email,
          r.party_size,
          r.reservation_date,
          r.duration_minutes,
          r.status,
          r.special_requests,
          r.created_by,
          r.created_at,
          r.updated_at,
          t.table_number,
          t.capacity,
          t.location,
          u.full_name as created_by_name
        FROM reservations r
        JOIN tables t ON r.table_id = t.table_id
        JOIN users u ON r.created_by = u.user_id
        WHERE r.reservation_id = ?`,
        [reservationId]
      );

      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all reservations with optional filters
   */
  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          r.reservation_id,
          r.table_id,
          r.customer_name,
          r.customer_phone,
          r.customer_email,
          r.party_size,
          r.reservation_date,
          r.duration_minutes,
          r.status,
          r.special_requests,
          r.created_by,
          r.created_at,
          r.updated_at,
          t.table_number,
          t.capacity,
          t.location,
          u.full_name as created_by_name
        FROM reservations r
        JOIN tables t ON r.table_id = t.table_id
        JOIN users u ON r.created_by = u.user_id
        WHERE 1=1
      `;

      const params = [];

      if (filters.status) {
        query += ' AND r.status = ?';
        params.push(filters.status);
      }

      if (filters.table_id) {
        query += ' AND r.table_id = ?';
        params.push(filters.table_id);
      }

      if (filters.customer_phone) {
        query += ' AND r.customer_phone = ?';
        params.push(filters.customer_phone);
      }

      if (filters.date) {
        query += ' AND DATE(r.reservation_date) = DATE(?)';
        params.push(filters.date);
      }

      if (filters.from_date) {
        query += ' AND r.reservation_date >= ?';
        params.push(filters.from_date);
      }

      if (filters.to_date) {
        query += ' AND r.reservation_date <= ?';
        params.push(filters.to_date);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      query += ' ORDER BY r.reservation_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await connection.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get upcoming reservations
   */
  static async findUpcoming(hoursAhead = 24) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          r.reservation_id,
          r.table_id,
          r.customer_name,
          r.customer_phone,
          r.customer_email,
          r.party_size,
          r.reservation_date,
          r.duration_minutes,
          r.status,
          r.special_requests,
          r.created_at,
          t.table_number,
          t.capacity,
          t.location
        FROM reservations r
        JOIN tables t ON r.table_id = t.table_id
        WHERE r.status IN ('pending', 'confirmed')
          AND r.reservation_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)
        ORDER BY r.reservation_date ASC`,
        [hoursAhead]
      );

      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update reservation
   */
  static async update(reservationId, updates) {
    const connection = await pool.getConnection();
    try {
      // Convert ISO8601 to MySQL datetime if reservation_date is being updated
      if (updates.reservation_date) {
        updates.reservation_date = this.convertToMySQLDatetime(updates.reservation_date);
      }

      // If updating table or time, check for conflicts
      if (updates.table_id || updates.reservation_date || updates.duration_minutes) {
        const current = await this.findById(reservationId);
        if (!current) {
          throw new Error('Reservation not found');
        }

        const tableId = updates.table_id || current.table_id;
        const reservationDate = updates.reservation_date || current.reservation_date;
        const durationMinutes = updates.duration_minutes || current.duration_minutes;

        const hasConflict = await this.checkConflict(
          tableId,
          reservationDate,
          durationMinutes,
          reservationId
        );

        if (hasConflict) {
          throw new Error('This time slot is already reserved');
        }

        // Check capacity if party size updated
        if (updates.party_size) {
          const [tables] = await connection.query(
            'SELECT capacity FROM tables WHERE table_id = ?',
            [tableId]
          );
          if (tables.length > 0 && updates.party_size > tables[0].capacity) {
            throw new Error(`Party size (${updates.party_size}) exceeds table capacity (${tables[0].capacity})`);
          }
        }
      }

      const allowedFields = [
        'table_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'party_size',
        'reservation_date',
        'duration_minutes',
        'special_requests',
        'status'
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

      values.push(reservationId);

      await connection.query(
        `UPDATE reservations SET ${fields.join(', ')} WHERE reservation_id = ?`,
        values
      );

      return await this.findById(reservationId);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update reservation status
   */
  static async updateStatus(reservationId, status) {
    const validStatuses = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await this.update(reservationId, { status });
  }

  /**
   * Cancel reservation
   */
  static async cancel(reservationId) {
    return await this.updateStatus(reservationId, 'cancelled');
  }

  /**
   * Delete reservation
   */
  static async delete(reservationId) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'DELETE FROM reservations WHERE reservation_id = ?',
        [reservationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get reservation statistics
   */
  static async getStatistics(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          COUNT(*) as total_reservations,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'seated' THEN 1 ELSE 0 END) as seated,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as no_shows,
          AVG(party_size) as avg_party_size,
          SUM(party_size) as total_guests
        FROM reservations
        WHERE 1=1
      `;

      const params = [];

      if (filters.from_date) {
        query += ' AND reservation_date >= ?';
        params.push(filters.from_date);
      }

      if (filters.to_date) {
        query += ' AND reservation_date <= ?';
        params.push(filters.to_date);
      }

      const [stats] = await connection.query(query, params);
      return stats[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Reservation;
