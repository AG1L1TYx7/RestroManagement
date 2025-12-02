const { pool } = require('../config/database');

class Category {
    /**
     * Create a new category
     * @param {Object} categoryData - Category data
     * @returns {Object} Created category
     */
    static async create({ name, description, is_active = true }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(
                `INSERT INTO categories (name, description, is_active) 
                 VALUES (?, ?, ?)`,
                [name, description, is_active]
            );
            
            return await this.findById(result.insertId);
        } finally {
            connection.release();
        }
    }

    /**
     * Find category by ID
     * @param {number} id - Category ID
     * @returns {Object|null} Category object or null
     */
    static async findById(id) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT category_id, name, description, is_active, 
                        created_at, updated_at 
                 FROM categories 
                 WHERE category_id = ?`,
                [id]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find category by name
     * @param {string} name - Category name
     * @returns {Object|null} Category object or null
     */
    static async findByName(name) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT category_id, name, description, is_active, 
                        created_at, updated_at 
                 FROM categories 
                 WHERE name = ?`,
                [name]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Get all categories
     * @param {boolean} activeOnly - Return only active categories
     * @returns {Array} Array of categories
     */
    static async findAll(activeOnly = false) {
        const connection = await pool.getConnection();
        try {
            let query = `SELECT category_id, name, description, is_active, 
                               created_at, updated_at 
                        FROM categories`;
            
            if (activeOnly) {
                query += ` WHERE is_active = true`;
            }
            
            query += ` ORDER BY name ASC`;
            
            const [rows] = await connection.query(query);
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Get categories with menu item count
     * @returns {Array} Categories with item counts
     */
    static async findAllWithItemCount() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT c.category_id, c.name, c.description, c.is_active,
                        c.created_at, c.updated_at,
                        COUNT(m.item_id) as item_count
                 FROM categories c
                 LEFT JOIN menu_items m ON c.category_id = m.category_id
                 GROUP BY c.category_id
                 ORDER BY c.name ASC`
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Update category
     * @param {number} categoryId - Category ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated category
     */
    static async update(categoryId, updates) {
        const connection = await pool.getConnection();
        try {
            const allowedFields = ['name', 'description', 'is_active'];
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

            values.push(categoryId);
            await connection.query(
                `UPDATE categories SET ${updateFields.join(', ')} WHERE category_id = ?`,
                values
            );

            return await this.findById(categoryId);
        } finally {
            connection.release();
        }
    }

    /**
     * Delete category (soft delete by setting is_active to false)
     * @param {number} categoryId - Category ID
     * @returns {boolean} Success status
     */
    static async delete(categoryId) {
        const connection = await pool.getConnection();
        try {
            // Check if category has menu items
            const [items] = await connection.query(
                `SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?`,
                [categoryId]
            );

            if (items[0].count > 0) {
                throw new Error('Cannot delete category with existing menu items');
            }

            await connection.query(
                `UPDATE categories SET is_active = false WHERE category_id = ?`,
                [categoryId]
            );
            
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Hard delete category (permanent deletion)
     * @param {number} categoryId - Category ID
     * @returns {boolean} Success status
     */
    static async hardDelete(categoryId) {
        const connection = await pool.getConnection();
        try {
            // Check if category has menu items
            const [items] = await connection.query(
                `SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?`,
                [categoryId]
            );

            if (items[0].count > 0) {
                throw new Error('Cannot delete category with existing menu items');
            }

            await connection.query(
                `DELETE FROM categories WHERE category_id = ?`,
                [categoryId]
            );
            
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Toggle category active status
     * @param {number} categoryId - Category ID
     * @returns {Object} Updated category
     */
    static async toggleActive(categoryId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE categories 
                 SET is_active = NOT is_active 
                 WHERE category_id = ?`,
                [categoryId]
            );
            
            return await this.findById(categoryId);
        } finally {
            connection.release();
        }
    }

    /**
     * Check if category name exists
     * @param {string} name - Category name
     * @param {number} excludeId - Category ID to exclude from check
     * @returns {boolean} Exists status
     */
    static async nameExists(name, excludeId = null) {
        const connection = await pool.getConnection();
        try {
            let query = `SELECT COUNT(*) as count FROM categories WHERE name = ?`;
            const params = [name];

            if (excludeId) {
                query += ` AND category_id != ?`;
                params.push(excludeId);
            }

            const [rows] = await connection.query(query, params);
            return rows[0].count > 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Get menu items by category
     * @param {number} categoryId - Category ID
     * @param {boolean} availableOnly - Return only available items
     * @returns {Array} Array of menu items
     */
    static async getMenuItems(categoryId, availableOnly = false) {
        const connection = await pool.getConnection();
        try {
            let query = `SELECT item_id, name, description, price, cost, 
                               image_url, is_available, preparation_time,
                               created_at, updated_at
                        FROM menu_items 
                        WHERE category_id = ?`;
            
            if (availableOnly) {
                query += ` AND is_available = true`;
            }
            
            query += ` ORDER BY name ASC`;
            
            const [rows] = await connection.query(query, [categoryId]);
            return rows;
        } finally {
            connection.release();
        }
    }
}

module.exports = Category;
