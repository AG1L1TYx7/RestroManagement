const { pool } = require('../config/database');

class Order {
    static async create(orderData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const {
                created_by,
                table_id: raw_table_id = null,
                order_type = 'dine-in',
                payment_method = 'cash',
                notes = null,
                discount = 0,
                tax = 0
            } = orderData;

            // For non-dine-in orders, do not require a table
            const table_id = order_type === 'dine-in' ? raw_table_id : null;

            // Generate unique order number
            const orderNumber = 'ORD' + Date.now();
            const subtotal = 0;
            const total = subtotal - discount + tax;

            const [result] = await connection.query(
                `INSERT INTO orders 
                (order_number, table_id, order_type, status, subtotal, tax, discount, total, 
                 payment_status, payment_method, notes, created_by)
                VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, 'pending', ?, ?, ?)`,
                [orderNumber, table_id, order_type, subtotal, tax, discount, total, payment_method, notes, created_by]
            );

            await connection.commit();

            return {
                order_id: result.insertId,
                order_number: orderNumber,
                created_by,
                table_id,
                order_type,
                status: 'pending',
                payment_method,
                payment_status: 'pending',
                subtotal,
                discount,
                tax,
                total,
                notes
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findById(orderId) {
        const connection = await pool.getConnection();
        try {
            const [orders] = await connection.query(
                `SELECT o.*, 
                        u.username as customer_username,
                        u.full_name as customer_name,
                        u.email as customer_email
                 FROM orders o
                 LEFT JOIN users u ON o.created_by = u.user_id
                 WHERE o.order_id = ?`,
                [orderId]
            );

            if (orders.length === 0) return null;

            const order = orders[0];

            const [items] = await connection.query(
                `SELECT oi.*, 
                        m.name as item_name,
                        m.image_url,
                        c.name as category_name
                 FROM order_items oi
                 JOIN menu_items m ON oi.item_id = m.item_id
                 JOIN categories c ON m.category_id = c.category_id
                 WHERE oi.order_id = ?
                 ORDER BY oi.order_item_id ASC`,
                [orderId]
            );

            order.items = items;
            order.items_count = items.length;

            return order;
        } finally {
            connection.release();
        }
    }

    static async findAll(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const {
                created_by,
                status,
                payment_status,
                order_type,
                from_date,
                to_date,
                limit = 50,
                offset = 0
            } = filters;

            let query = `
                SELECT o.*, 
                       u.username as customer_username,
                       u.full_name as customer_name,
                       COUNT(oi.order_item_id) as items_count
                FROM orders o
                LEFT JOIN users u ON o.created_by = u.user_id
                LEFT JOIN order_items oi ON o.order_id = oi.order_id
                WHERE 1=1
            `;

            const params = [];

            if (created_by) {
                query += ' AND o.created_by = ?';
                params.push(created_by);
            }

            if (status) {
                query += ' AND o.status = ?';
                params.push(status);
            }

            if (payment_status) {
                query += ' AND o.payment_status = ?';
                params.push(payment_status);
            }

            if (order_type) {
                query += ' AND o.order_type = ?';
                params.push(order_type);
            }

            if (from_date) {
                query += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                query += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            query += ' GROUP BY o.order_id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const [orders] = await connection.query(query, params);
            return orders;
        } finally {
            connection.release();
        }
    }

    static async updateStatus(orderId, newStatus) {
        const connection = await pool.getConnection();
        try {
            const validStatuses = ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
            // Map external 'confirmed' to a valid stored status
            const statusToStore = newStatus === 'confirmed' ? 'preparing' : newStatus;

            if (!validStatuses.includes(statusToStore)) {
                throw new Error(`Invalid status: ${newStatus}`);
            }

            const updateFields = ['status = ?', 'updated_at = NOW()'];
            const params = [statusToStore];

            if (statusToStore === 'completed') {
                updateFields.push('completed_at = NOW()');
            }

            params.push(orderId);

            await connection.query(
                `UPDATE orders SET ${updateFields.join(', ')} WHERE order_id = ?`,
                params
            );

            const updatedRow = await this.findById(orderId);
            const updated = JSON.parse(JSON.stringify(updatedRow));
            if (newStatus === 'confirmed') {
                updated.status = 'confirmed';
            }
            return updated;
        } finally {
            connection.release();
        }
    }

    static async updatePaymentStatus(orderId, paymentStatus) {
        const connection = await pool.getConnection();
        try {
            const validPaymentStatuses = ['pending', 'paid', 'refunded'];
            
            if (!validPaymentStatuses.includes(paymentStatus)) {
                throw new Error(`Invalid payment status: ${paymentStatus}`);
            }

            await connection.query(
                `UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE order_id = ?`,
                [paymentStatus, orderId]
            );

            return await this.findById(orderId);
        } finally {
            connection.release();
        }
    }

    static async updateTotals(orderId) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(
                `SELECT COALESCE(SUM(quantity * unit_price), 0) as subtotal
                 FROM order_items WHERE order_id = ?`,
                [orderId]
            );

            const subtotal = parseFloat(result[0].subtotal);

            const [order] = await connection.query(
                'SELECT discount, tax FROM orders WHERE order_id = ?',
                [orderId]
            );

            const discount = parseFloat(order[0].discount);
            const tax = parseFloat(order[0].tax);
            const total = subtotal - discount + tax;

            await connection.query(
                `UPDATE orders SET subtotal = ?, total = ?, updated_at = NOW() WHERE order_id = ?`,
                [subtotal, total, orderId]
            );

            return await this.findById(orderId);
        } finally {
            connection.release();
        }
    }

    static async getStatistics(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;
            let query = 'SELECT ';
            query += 'COUNT(*) as total_orders, ';
            query += 'SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_orders, ';
            query += 'SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_orders, ';
            query += 'SUM(CASE WHEN payment_status = "paid" THEN total ELSE 0 END) as total_revenue, ';
            query += 'AVG(CASE WHEN payment_status = "paid" THEN total ELSE NULL END) as avg_order_value ';
            query += 'FROM orders WHERE 1=1';

            const params = [];

            if (from_date) {
                query += ' AND DATE(created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                query += ' AND DATE(created_at) <= ?';
                params.push(to_date);
            }

            const [stats] = await connection.query(query, params);
            return stats[0];
        } finally {
            connection.release();
        }
    }

    static async findByStatuses(statuses) {
        const connection = await pool.getConnection();
        try {
            const placeholders = statuses.map(() => '?').join(',');
            
            const [orders] = await connection.query(
                `SELECT o.*, 
                        u.full_name as customer_name,
                        COUNT(oi.order_item_id) as items_count,
                        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as minutes_waiting
                 FROM orders o
                 LEFT JOIN users u ON o.created_by = u.user_id
                 LEFT JOIN order_items oi ON o.order_id = oi.order_id
                 WHERE o.status IN (${placeholders})
                 GROUP BY o.order_id
                 ORDER BY o.created_at ASC`,
                statuses
            );

            return orders;
        } finally {
            connection.release();
        }
    }
}

module.exports = Order;
