const { pool } = require('../config/database');

class OrderItem {
    /**
     * Check if sufficient inventory exists for menu items
     * @param {Array} items - Array of {item_id, quantity}
     * @param {Object} connection - Database connection
     * @returns {Object} {sufficient: boolean, insufficientItems: Array}
     */
    static async checkInventoryAvailability(items, connection) {
        const insufficientItems = [];

        for (const item of items) {
            // Get recipe for this menu item
            const [recipes] = await connection.query(
                `SELECT r.ingredient_id, r.quantity_required, 
                        i.name as ingredient_name, i.unit,
                        inv.current_stock
                 FROM recipes r
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 LEFT JOIN inventory inv ON r.ingredient_id = inv.ingredient_id
                 WHERE r.item_id = ?`,
                [item.item_id]
            );

            // Check if any recipes exist
            if (recipes.length === 0) {
                continue; // No recipe defined, skip inventory check
            }

            // Check each ingredient
            for (const recipe of recipes) {
                const requiredQty = parseFloat(recipe.quantity_required) * parseInt(item.quantity);
                const availableQty = parseFloat(recipe.current_stock) || 0;

                if (availableQty < requiredQty) {
                    insufficientItems.push({
                        item_id: item.item_id,
                        ingredient_id: recipe.ingredient_id,
                        ingredient_name: recipe.ingredient_name,
                        unit: recipe.unit,
                        required: requiredQty,
                        available: availableQty,
                        shortage: requiredQty - availableQty
                    });
                }
            }
        }

        return {
            sufficient: insufficientItems.length === 0,
            insufficientItems
        };
    }

    /**
     * Deduct inventory for menu items based on recipes
     * @param {Array} items - Array of {item_id, quantity}
     * @param {Number} orderId - Order ID for transaction reference
     * @param {Number} userId - User ID who created the order
     * @param {Object} connection - Database connection
     */
    static async deductInventory(items, orderId, userId, connection) {
        for (const item of items) {
            // Get recipe for this menu item
            const [recipes] = await connection.query(
                `SELECT r.ingredient_id, r.quantity_required, i.unit
                 FROM recipes r
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 WHERE r.item_id = ?`,
                [item.item_id]
            );

            if (recipes.length === 0) {
                continue; // No recipe, no deduction needed
            }

            // Deduct each ingredient
            for (const recipe of recipes) {
                const deductQty = parseFloat(recipe.quantity_required) * parseInt(item.quantity);

                // Update inventory
                await connection.query(
                    `UPDATE inventory 
                     SET current_stock = current_stock - ?
                     WHERE ingredient_id = ?`,
                    [deductQty, recipe.ingredient_id]
                );

                // Log transaction
                await connection.query(
                    `INSERT INTO inventory_transactions 
                     (ingredient_id, transaction_type, quantity, unit_cost, reference_type, reference_id, notes, performed_by)
                     VALUES (?, 'usage', ?, 0, 'order', ?, ?, ?)`,
                    [
                        recipe.ingredient_id,
                        deductQty,
                        orderId,
                        `Used for order #${orderId}`,
                        userId
                    ]
                );
            }
        }
    }

    static async createMultiple(orderId, items, userId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // First, check inventory availability
            const inventoryCheck = await this.checkInventoryAvailability(items, connection);
            
            if (!inventoryCheck.sufficient) {
                const insufficientList = inventoryCheck.insufficientItems
                    .map(item => `${item.ingredient_name}: need ${item.required}${item.unit}, have ${item.available}${item.unit}`)
                    .join('; ');
                throw new Error(`Insufficient inventory: ${insufficientList}`);
            }

            const createdItems = [];

            for (const item of items) {
                const [menuItems] = await connection.query(
                    'SELECT price, name, is_available FROM menu_items WHERE item_id = ?',
                    [item.item_id]
                );

                if (menuItems.length === 0) {
                    throw new Error(`Menu item ${item.item_id} not found`);
                }

                const menuItem = menuItems[0];

                if (!menuItem.is_available) {
                    throw new Error(`Menu item "${menuItem.name}" is not available`);
                }

                const unit_price = parseFloat(menuItem.price);
                const quantity = parseInt(item.quantity);
                const subtotal = unit_price * quantity;

                const [result] = await connection.query(
                    `INSERT INTO order_items 
                    (order_id, item_id, quantity, unit_price, subtotal, special_instructions, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                    [orderId, item.item_id, quantity, unit_price, subtotal, item.special_instructions || null]
                );

                createdItems.push({
                    order_item_id: result.insertId,
                    order_id: orderId,
                    item_id: item.item_id,
                    item_name: menuItem.name,
                    quantity,
                    unit_price,
                    subtotal,
                    special_instructions: item.special_instructions || null
                });
            }

            // Deduct inventory after creating order items
            await this.deductInventory(items, orderId, userId, connection);

            await connection.commit();
            return createdItems;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findByOrderId(orderId) {
        const connection = await pool.getConnection();
        try {
            const [items] = await connection.query(
                `SELECT oi.*, 
                        m.name as item_name,
                        m.image_url,
                        m.preparation_time,
                        c.name as category_name
                 FROM order_items oi
                 JOIN menu_items m ON oi.item_id = m.item_id
                 JOIN categories c ON m.category_id = c.category_id
                 WHERE oi.order_id = ?
                 ORDER BY oi.order_item_id ASC`,
                [orderId]
            );

            return items;
        } finally {
            connection.release();
        }
    }

    static async getPopularItems(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date, limit = 10 } = filters;

            let query = `
                SELECT m.item_id, m.name, m.image_url,
                       c.name as category_name,
                       COUNT(oi.order_item_id) as order_count,
                       SUM(oi.quantity) as total_quantity,
                       SUM(oi.subtotal) as total_revenue
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.item_id
                JOIN categories c ON m.category_id = c.category_id
                JOIN orders o ON oi.order_id = o.order_id
                WHERE o.status = 'completed'
            `;

            const params = [];

            if (from_date) {
                query += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                query += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            query += ' GROUP BY m.item_id';
            query += ' ORDER BY order_count DESC, total_quantity DESC';
            query += ' LIMIT ?';
            params.push(parseInt(limit));

            const [items] = await connection.query(query, params);
            return items;
        } finally {
            connection.release();
        }
    }

    static async getRevenueByCategory(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;

            let query = `
                SELECT c.category_id, c.name as category_name,
                       COUNT(DISTINCT oi.order_id) as order_count,
                       SUM(oi.quantity) as total_items_sold,
                       SUM(oi.subtotal) as total_revenue
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.item_id
                JOIN categories c ON m.category_id = c.category_id
                JOIN orders o ON oi.order_id = o.order_id
                WHERE o.status = 'completed'
            `;

            const params = [];

            if (from_date) {
                query += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                query += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            query += ' GROUP BY c.category_id ORDER BY total_revenue DESC';

            const [categories] = await connection.query(query, params);
            return categories;
        } finally {
            connection.release();
        }
    }
}

module.exports = OrderItem;
