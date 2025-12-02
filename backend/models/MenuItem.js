const { pool } = require('../config/database');

class MenuItem {
    /**
     * Create a new menu item
     * @param {Object} itemData - Menu item data
     * @returns {Object} Created menu item
     */
    static async create({ name, description, category_id, price, cost, image_url, is_available = true, preparation_time }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(
                `INSERT INTO menu_items (name, description, category_id, price, cost, 
                                        image_url, is_available, preparation_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, description, category_id, price, cost, image_url, is_available, preparation_time]
            );
            
            return await this.findById(result.insertId);
        } finally {
            connection.release();
        }
    }

    /**
     * Find menu item by ID
     * @param {number} id - Item ID
     * @returns {Object|null} Menu item object or null
     */
    static async findById(id) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT m.item_id, m.name, m.description, m.category_id, 
                        m.price, m.cost, m.image_url, m.is_available, 
                        m.preparation_time, m.created_at, m.updated_at,
                        c.name as category_name
                 FROM menu_items m
                 JOIN categories c ON m.category_id = c.category_id
                 WHERE m.item_id = ?`,
                [id]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Get all menu items
     * @param {Object} filters - Filter options
     * @returns {Array} Array of menu items
     */
    static async findAll({ category_id, available_only = false, search = null } = {}) {
        const connection = await pool.getConnection();
        try {
            let query = `SELECT m.item_id, m.name, m.description, m.category_id, 
                               m.price, m.cost, m.image_url, m.is_available, 
                               m.preparation_time, m.created_at, m.updated_at,
                               c.name as category_name
                        FROM menu_items m
                        JOIN categories c ON m.category_id = c.category_id
                        WHERE 1=1`;
            
            const params = [];

            if (category_id) {
                query += ` AND m.category_id = ?`;
                params.push(category_id);
            }

            if (available_only) {
                query += ` AND m.is_available = true`;
            }

            if (search) {
                query += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
            
            query += ` ORDER BY c.name ASC, m.name ASC`;
            
            const [rows] = await connection.query(query, params);
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Get menu items grouped by category
     * @param {boolean} availableOnly - Return only available items
     * @returns {Array} Array of categories with their menu items
     */
    static async findAllGroupedByCategory(availableOnly = false) {
        const connection = await pool.getConnection();
        try {
            let query = `SELECT c.category_id, c.name as category_name, c.description as category_description,
                               m.item_id, m.name, m.description, m.price, m.cost,
                               m.image_url, m.is_available, m.preparation_time
                        FROM categories c
                        LEFT JOIN menu_items m ON c.category_id = m.category_id`;
            
            if (availableOnly) {
                query += ` WHERE c.is_active = true AND (m.item_id IS NULL OR m.is_available = true)`;
            }
            
            query += ` ORDER BY c.name ASC, m.name ASC`;
            
            const [rows] = await connection.query(query);
            
            // Group items by category
            const grouped = {};
            rows.forEach(row => {
                if (!grouped[row.category_id]) {
                    grouped[row.category_id] = {
                        category_id: row.category_id,
                        category_name: row.category_name,
                        category_description: row.category_description,
                        items: []
                    };
                }
                
                if (row.item_id) {
                    grouped[row.category_id].items.push({
                        item_id: row.item_id,
                        name: row.name,
                        description: row.description,
                        price: parseFloat(row.price),
                        cost: parseFloat(row.cost),
                        image_url: row.image_url,
                        is_available: row.is_available,
                        preparation_time: row.preparation_time
                    });
                }
            });
            
            return Object.values(grouped);
        } finally {
            connection.release();
        }
    }

    /**
     * Update menu item
     * @param {number} itemId - Item ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated menu item
     */
    static async update(itemId, updates) {
        const connection = await pool.getConnection();
        try {
            const allowedFields = ['name', 'description', 'category_id', 'price', 'cost', 
                                  'image_url', 'is_available', 'preparation_time'];
            const updateFields = [];
            const values = [];

            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            values.push(itemId);
            await connection.query(
                `UPDATE menu_items SET ${updateFields.join(', ')} WHERE item_id = ?`,
                values
            );

            return await this.findById(itemId);
        } finally {
            connection.release();
        }
    }

    /**
     * Delete menu item (soft delete)
     * @param {number} itemId - Item ID
     * @returns {boolean} Success status
     */
    static async delete(itemId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE menu_items SET is_available = false WHERE item_id = ?`,
                [itemId]
            );
            
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Hard delete menu item
     * @param {number} itemId - Item ID
     * @returns {boolean} Success status
     */
    static async hardDelete(itemId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `DELETE FROM menu_items WHERE item_id = ?`,
                [itemId]
            );
            
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Toggle menu item availability
     * @param {number} itemId - Item ID
     * @returns {Object} Updated menu item
     */
    static async toggleAvailability(itemId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE menu_items 
                 SET is_available = NOT is_available 
                 WHERE item_id = ?`,
                [itemId]
            );
            
            return await this.findById(itemId);
        } finally {
            connection.release();
        }
    }

    /**
     * Get menu items by price range
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     * @returns {Array} Array of menu items
     */
    static async findByPriceRange(minPrice, maxPrice) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT m.item_id, m.name, m.description, m.category_id, 
                        m.price, m.cost, m.image_url, m.is_available, 
                        m.preparation_time, m.created_at, m.updated_at,
                        c.name as category_name
                 FROM menu_items m
                 JOIN categories c ON m.category_id = c.category_id
                 WHERE m.price BETWEEN ? AND ?
                 ORDER BY m.price ASC`,
                [minPrice, maxPrice]
            );
            
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Calculate profit margin for menu item
     * @param {number} itemId - Item ID
     * @returns {Object} Profit analysis
     */
    static async getProfitAnalysis(itemId) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT item_id, name, price, cost,
                        (price - cost) as profit,
                        ROUND(((price - cost) / price * 100), 2) as profit_margin_percentage
                 FROM menu_items
                 WHERE item_id = ?`,
                [itemId]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Get popular menu items (based on order count)
     * @param {number} limit - Number of items to return
     * @returns {Array} Popular menu items
     */
    static async getPopular(limit = 10) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT m.item_id, m.name, m.description, m.price,
                        m.image_url, c.name as category_name,
                        COUNT(oi.order_item_id) as order_count,
                        SUM(oi.quantity) as total_quantity_sold
                 FROM menu_items m
                 JOIN categories c ON m.category_id = c.category_id
                 LEFT JOIN order_items oi ON m.item_id = oi.item_id
                 GROUP BY m.item_id
                 ORDER BY order_count DESC, total_quantity_sold DESC
                 LIMIT ?`,
                [limit]
            );
            
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Search menu items
     * @param {string} searchTerm - Search term
     * @returns {Array} Matching menu items
     */
    static async search(searchTerm) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT m.item_id, m.name, m.description, m.category_id, 
                        m.price, m.cost, m.image_url, m.is_available, 
                        m.preparation_time, c.name as category_name
                 FROM menu_items m
                 JOIN categories c ON m.category_id = c.category_id
                 WHERE m.name LIKE ? OR m.description LIKE ? OR c.name LIKE ?
                 ORDER BY m.name ASC`,
                [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
            );
            
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Update menu item availability based on ingredient inventory
     * @param {number} itemId - Menu item ID
     * @returns {Object} Updated availability status
     */
    static async updateAvailabilityByInventory(itemId) {
        const connection = await pool.getConnection();
        try {
            // Check if all required ingredients are available
            const [availability] = await connection.query(
                `SELECT 
                    CASE 
                        WHEN COUNT(*) = 0 THEN 1
                        WHEN COUNT(*) = SUM(
                            CASE 
                                WHEN COALESCE(inv.current_stock, 0) >= r.quantity_required 
                                THEN 1 
                                ELSE 0 
                            END
                        ) THEN 1
                        ELSE 0
                    END as can_prepare
                 FROM recipes r
                 LEFT JOIN inventory inv ON r.ingredient_id = inv.ingredient_id
                 WHERE r.item_id = ?`,
                [itemId]
            );

            const isAvailable = availability[0].can_prepare === 1;

            // Update menu item availability
            await connection.query(
                `UPDATE menu_items SET is_available = ? WHERE item_id = ?`,
                [isAvailable, itemId]
            );

            return {
                item_id: itemId,
                is_available: isAvailable,
                message: isAvailable ? 'Item is available' : 'Item unavailable due to insufficient ingredients'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Update availability for all menu items based on inventory
     * @returns {Object} Summary of updates
     */
    static async updateAllAvailabilityByInventory() {
        const connection = await pool.getConnection();
        try {
            // Get all menu items with recipes
            const [items] = await connection.query(
                `SELECT DISTINCT item_id FROM recipes`
            );

            let updated = 0;
            let madeAvailable = 0;
            let madeUnavailable = 0;

            for (const item of items) {
                const result = await this.updateAvailabilityByInventory(item.item_id);
                updated++;
                if (result.is_available) {
                    madeAvailable++;
                } else {
                    madeUnavailable++;
                }
            }

            return {
                total_updated: updated,
                made_available: madeAvailable,
                made_unavailable: madeUnavailable
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = MenuItem;
