const { pool } = require('../config/database');

class PurchaseOrder {
  /**
   * Create a new purchase order
   * @param {Object} poData - { supplier_id, expected_delivery_date, notes, items: [{ingredient_id, quantity, unit_cost}] }
   * @param {Number} userId - User creating the PO
   * @returns {Object} Created purchase order
   */
  static async create(poData, userId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Generate PO number
      const poNumber = `PO${Date.now()}`;
      
      // Calculate totals
      let subtotal = 0;
      for (const item of poData.items) {
        subtotal += item.quantity * item.unit_cost;
      }
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      // Insert purchase order
      const [result] = await connection.query(
        `INSERT INTO purchase_orders 
        (po_number, supplier_id, expected_delivery_date, subtotal, tax, total, notes, created_by, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [poNumber, poData.supplier_id, poData.expected_delivery_date, subtotal, tax, total, poData.notes, userId]
      );

      const poId = result.insertId;

      // Insert PO details
      for (const item of poData.items) {
        const itemSubtotal = item.quantity * item.unit_cost;
        await connection.query(
          `INSERT INTO po_details 
          (po_id, ingredient_id, quantity_ordered, unit_cost, subtotal, notes) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [poId, item.ingredient_id, item.quantity, item.unit_cost, itemSubtotal, item.notes]
        );
      }

      await connection.commit();

      // Fetch and return complete PO
      return await this.findById(poId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Find purchase order by ID with details
   * @param {Number} poId - Purchase order ID
   * @returns {Object|null} Purchase order with details
   */
  static async findById(poId) {
    const [pos] = await pool.query(
      `SELECT po.*, s.name as supplier_name, s.contact_person, s.email as supplier_email, s.phone as supplier_phone,
              u1.full_name as created_by_name, u2.full_name as approved_by_name, u3.full_name as received_by_name
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.supplier_id
       LEFT JOIN users u1 ON po.created_by = u1.user_id
       LEFT JOIN users u2 ON po.approved_by = u2.user_id
       LEFT JOIN users u3 ON po.received_by = u3.user_id
       WHERE po.po_id = ?`,
      [poId]
    );

    if (pos.length === 0) return null;

    const po = pos[0];

    // Get PO details
    const [details] = await pool.query(
      `SELECT pd.*, i.name as ingredient_name, i.unit
       FROM po_details pd
       JOIN ingredients i ON pd.ingredient_id = i.ingredient_id
       WHERE pd.po_id = ?
       ORDER BY pd.po_detail_id`,
      [poId]
    );

    po.items = details;
    return po;
  }

  /**
   * Find all purchase orders with filters
   * @param {Object} filters - { status, supplier_id, from_date, to_date, page, limit }
   * @returns {Array} Purchase orders
   */
  static async findAll(filters = {}) {
    const {
      status,
      supplier_id,
      from_date,
      to_date,
      page = 1,
      limit = 20
    } = filters;

    let query = `
      SELECT po.*, s.name as supplier_name, u.full_name as created_by_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.supplier_id
      LEFT JOIN users u ON po.created_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND po.status = ?';
      params.push(status);
    }

    if (supplier_id) {
      query += ' AND po.supplier_id = ?';
      params.push(supplier_id);
    }

    if (from_date) {
      query += ' AND DATE(po.order_date) >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND DATE(po.order_date) <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY po.order_date DESC';

    if (limit) {
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [pos] = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM purchase_orders po
      WHERE 1=1
    `;
    const countParams = [];

    if (status) {
      countQuery += ' AND po.status = ?';
      countParams.push(status);
    }

    if (supplier_id) {
      countQuery += ' AND po.supplier_id = ?';
      countParams.push(supplier_id);
    }

    if (from_date) {
      countQuery += ' AND DATE(po.order_date) >= ?';
      countParams.push(from_date);
    }

    if (to_date) {
      countQuery += ' AND DATE(po.order_date) <= ?';
      countParams.push(to_date);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      data: pos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update purchase order
   * @param {Number} poId - Purchase order ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated purchase order
   */
  static async update(poId, updates) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if PO is in draft status
      const [po] = await connection.query(
        'SELECT status FROM purchase_orders WHERE po_id = ?',
        [poId]
      );

      if (po.length === 0) {
        throw new Error('Purchase order not found');
      }

      if (po[0].status !== 'draft') {
        throw new Error('Can only update draft purchase orders');
      }

      const allowedFields = ['supplier_id', 'expected_delivery_date', 'notes'];
      const updateFields = [];
      const values = [];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          values.push(updates[field]);
        }
      }

      if (updateFields.length > 0) {
        values.push(poId);
        await connection.query(
          `UPDATE purchase_orders SET ${updateFields.join(', ')} WHERE po_id = ?`,
          values
        );
      }

      // Update items if provided
      if (updates.items) {
        // Delete existing items
        await connection.query('DELETE FROM po_details WHERE po_id = ?', [poId]);

        // Calculate new totals
        let subtotal = 0;
        for (const item of updates.items) {
          subtotal += item.quantity * item.unit_cost;
          
          const itemSubtotal = item.quantity * item.unit_cost;
          await connection.query(
            `INSERT INTO po_details 
            (po_id, ingredient_id, quantity_ordered, unit_cost, subtotal, notes) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [poId, item.ingredient_id, item.quantity, item.unit_cost, itemSubtotal, item.notes]
          );
        }

        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        await connection.query(
          'UPDATE purchase_orders SET subtotal = ?, tax = ?, total = ? WHERE po_id = ?',
          [subtotal, tax, total, poId]
        );
      }

      await connection.commit();

      return await this.findById(poId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update purchase order status
   * @param {Number} poId - Purchase order ID
   * @param {String} status - New status
   * @param {Number} userId - User performing the action
   * @returns {Object} Updated purchase order
   */
  static async updateStatus(poId, status, userId) {
    const validTransitions = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['approved', 'cancelled'],
      'approved': ['received', 'cancelled'],
      'received': [],
      'cancelled': []
    };

    const [po] = await pool.query(
      'SELECT status FROM purchase_orders WHERE po_id = ?',
      [poId]
    );

    if (po.length === 0) {
      throw new Error('Purchase order not found');
    }

    const currentStatus = po[0].status;

    if (!validTransitions[currentStatus].includes(status)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${status}`);
    }

    await pool.query(
      'UPDATE purchase_orders SET status = ? WHERE po_id = ?',
      [status, poId]
    );

    return await this.findById(poId);
  }

  /**
   * Approve purchase order
   * @param {Number} poId - Purchase order ID
   * @param {Number} userId - User approving the PO
   * @returns {Object} Updated purchase order
   */
  static async approve(poId, userId) {
    const [result] = await pool.query(
      `UPDATE purchase_orders 
       SET status = 'approved', approved_by = ? 
       WHERE po_id = ? AND status = 'submitted'`,
      [userId, poId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Purchase order not found or not in submitted status');
    }

    return await this.findById(poId);
  }

  /**
   * Receive purchase order (updates inventory)
   * @param {Number} poId - Purchase order ID
   * @param {Array} receivedItems - [{po_detail_id, quantity_received}]
   * @param {Number} userId - User receiving the PO
   * @returns {Object} Updated purchase order
   */
  static async receive(poId, receivedItems, userId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check PO status
      const [po] = await connection.query(
        'SELECT status, supplier_id FROM purchase_orders WHERE po_id = ?',
        [poId]
      );

      if (po.length === 0) {
        throw new Error('Purchase order not found');
      }

      if (po[0].status !== 'approved') {
        throw new Error('Can only receive approved purchase orders');
      }

      // Update each received item
      for (const item of receivedItems) {
        // Get PO detail
        const [detail] = await connection.query(
          'SELECT ingredient_id, unit_cost FROM po_details WHERE po_detail_id = ? AND po_id = ?',
          [item.po_detail_id, poId]
        );

        if (detail.length === 0) continue;

        const { ingredient_id, unit_cost } = detail[0];

        // Update quantity received in PO details
        await connection.query(
          'UPDATE po_details SET quantity_received = ? WHERE po_detail_id = ?',
          [item.quantity_received, item.po_detail_id]
        );

        // Update inventory
        await connection.query(
          `INSERT INTO inventory (ingredient_id, current_stock, last_restocked)
           VALUES (?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
           current_stock = current_stock + ?,
           last_restocked = NOW()`,
          [ingredient_id, item.quantity_received, item.quantity_received]
        );

        // Log transaction
        await connection.query(
          `INSERT INTO inventory_transactions 
          (ingredient_id, transaction_type, quantity, unit_cost, reference_type, reference_id, notes, performed_by)
          VALUES (?, 'purchase', ?, ?, 'purchase_order', ?, 'Received from PO', ?)`,
          [ingredient_id, item.quantity_received, unit_cost, poId, userId]
        );
      }

      // Update PO status
      await connection.query(
        `UPDATE purchase_orders 
         SET status = 'received', received_by = ?, actual_delivery_date = CURDATE() 
         WHERE po_id = ?`,
        [userId, poId]
      );

      await connection.commit();

      return await this.findById(poId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Cancel purchase order
   * @param {Number} poId - Purchase order ID
   * @returns {Object} Updated purchase order
   */
  static async cancel(poId) {
    const [result] = await pool.query(
      `UPDATE purchase_orders 
       SET status = 'cancelled' 
       WHERE po_id = ? AND status IN ('draft', 'submitted', 'approved')`,
      [poId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Purchase order not found or cannot be cancelled');
    }

    return await this.findById(poId);
  }

  /**
   * Auto-generate purchase orders from low stock items
   * @param {Number} userId - User generating POs
   * @returns {Array} Generated purchase orders
   */
  static async autoGenerateFromLowStock(userId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get low stock items grouped by supplier
      const [lowStockItems] = await connection.query(
        `SELECT i.ingredient_id, i.name, i.supplier_id, i.unit, i.cost_per_unit,
                i.reorder_quantity, inv.current_stock, i.min_stock_level,
                s.name as supplier_name, s.lead_time_days
         FROM ingredients i
         JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
         LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
         WHERE inv.current_stock <= i.min_stock_level
           AND i.supplier_id IS NOT NULL
         ORDER BY i.supplier_id`
      );

      if (lowStockItems.length === 0) {
        await connection.commit();
        return [];
      }

      // Group by supplier
      const supplierGroups = {};
      for (const item of lowStockItems) {
        if (!supplierGroups[item.supplier_id]) {
          supplierGroups[item.supplier_id] = {
            supplier_id: item.supplier_id,
            supplier_name: item.supplier_name,
            lead_time_days: item.lead_time_days,
            items: []
          };
        }
        supplierGroups[item.supplier_id].items.push({
          ingredient_id: item.ingredient_id,
          name: item.name,
          quantity: item.reorder_quantity,
          unit_cost: item.cost_per_unit,
          notes: `Auto-reorder (current: ${item.current_stock}, min: ${item.min_stock_level})`
        });
      }

      // Create PO for each supplier
      const createdPOs = [];
      for (const supplierId in supplierGroups) {
        const group = supplierGroups[supplierId];
        
        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + (group.lead_time_days || 7));

        const po = await this.create({
          supplier_id: group.supplier_id,
          expected_delivery_date: expectedDeliveryDate.toISOString().split('T')[0],
          notes: `Auto-generated PO for low stock items (${group.items.length} items)`,
          items: group.items
        }, userId);

        createdPOs.push(po);
      }

      await connection.commit();

      return createdPOs;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get purchase order statistics
   * @returns {Object} Statistics
   */
  static async getStatistics() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_pos,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(CASE WHEN status = 'received' THEN total ELSE 0 END) as total_received_value,
        SUM(CASE WHEN status IN ('submitted', 'approved') THEN total ELSE 0 END) as pending_value,
        COUNT(CASE WHEN DATE(order_date) = CURDATE() THEN 1 END) as today_count,
        COUNT(CASE WHEN YEARWEEK(order_date, 1) = YEARWEEK(CURDATE(), 1) THEN 1 END) as this_week_count,
        COUNT(CASE WHEN YEAR(order_date) = YEAR(CURDATE()) AND MONTH(order_date) = MONTH(CURDATE()) THEN 1 END) as this_month_count
      FROM purchase_orders
    `);

    return stats[0];
  }
}

module.exports = PurchaseOrder;
