const { pool } = require('../config/database');

class Recipe {
    /**
     * Create recipe entry (menu item ingredient)
     * @param {Object} recipeData - Recipe data
     * @returns {Object} Created recipe
     */
    static async create({ item_id, ingredient_id, quantity_required }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(
                `INSERT INTO recipes (item_id, ingredient_id, quantity_required) 
                 VALUES (?, ?, ?)`,
                [item_id, ingredient_id, quantity_required]
            );
            
            return await this.findById(result.insertId);
        } finally {
            connection.release();
        }
    }

    /**
     * Find recipe by ID
     * @param {number} id - Recipe ID
     * @returns {Object|null} Recipe object or null
     */
    static async findById(id) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT r.recipe_id, r.item_id, r.ingredient_id, r.quantity_required,
                        m.name as item_name, i.name as ingredient_name, i.unit
                 FROM recipes r
                 JOIN menu_items m ON r.item_id = m.item_id
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 WHERE r.recipe_id = ?`,
                [id]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Get all recipes for a menu item
     * @param {number} itemId - Menu item ID
     * @returns {Array} Array of recipe ingredients
     */
    static async findByMenuItem(itemId) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT r.recipe_id, r.item_id, r.ingredient_id, r.quantity_required,
                        i.name as ingredient_name, i.unit,
                        inv.current_stock,
                        CASE 
                            WHEN inv.current_stock >= r.quantity_required 
                            THEN true 
                            ELSE false 
                        END as is_available
                 FROM recipes r
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 LEFT JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
                 WHERE r.item_id = ?
                 ORDER BY i.name ASC`,
                [itemId]
            );
            
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Get all recipes with ingredient details
     * @returns {Array} Array of all recipes
     */
    static async findAll() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT r.recipe_id, r.item_id, r.ingredient_id, r.quantity_required,
                        m.name as item_name, i.name as ingredient_name, i.unit
                 FROM recipes r
                 JOIN menu_items m ON r.item_id = m.item_id
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 ORDER BY m.name ASC, i.name ASC`
            );
            
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Update recipe quantity
     * @param {number} recipeId - Recipe ID
     * @param {number} quantityRequired - New quantity required
     * @returns {Object} Updated recipe
     */
    static async update(recipeId, quantityRequired) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE recipes SET quantity_required = ? WHERE recipe_id = ?`,
                [quantityRequired, recipeId]
            );

            return await this.findById(recipeId);
        } finally {
            connection.release();
        }
    }

    /**
     * Delete recipe
     * @param {number} recipeId - Recipe ID
     * @returns {boolean} Success status
     */
    static async delete(recipeId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `DELETE FROM recipes WHERE recipe_id = ?`,
                [recipeId]
            );
            
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Delete all recipes for a menu item
     * @param {number} itemId - Menu item ID
     * @returns {boolean} Success status
     */
    static async deleteByMenuItem(itemId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `DELETE FROM recipes WHERE item_id = ?`,
                [itemId]
            );
            
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Check if recipe exists for item and ingredient
     * @param {number} itemId - Menu item ID
     * @param {number} ingredientId - Ingredient ID
     * @returns {boolean} Exists status
     */
    static async exists(itemId, ingredientId) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT COUNT(*) as count FROM recipes 
                 WHERE item_id = ? AND ingredient_id = ?`,
                [itemId, ingredientId]
            );
            
            return rows[0].count > 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Check if menu item can be prepared based on inventory
     * @param {number} itemId - Menu item ID
     * @param {number} quantity - Number of items to prepare (default: 1)
     * @returns {Object} Availability status and missing ingredients
     */
    static async checkAvailability(itemId, quantity = 1) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT r.ingredient_id, i.name as ingredient_name, i.unit,
                        r.quantity_required, 
                        r.quantity_required * ? as total_needed,
                        COALESCE(inv.current_stock, 0) as current_stock,
                        CASE 
                            WHEN COALESCE(inv.current_stock, 0) >= (r.quantity_required * ?)
                            THEN true 
                            ELSE false 
                        END as is_sufficient
                 FROM recipes r
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 LEFT JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
                 WHERE r.item_id = ?`,
                [quantity, quantity, itemId]
            );

            if (rows.length === 0) {
                return {
                    can_prepare: true,
                    message: 'No ingredients required',
                    missing_ingredients: []
                };
            }

            const missingIngredients = rows.filter(row => !row.is_sufficient);
            const canPrepare = missingIngredients.length === 0;

            return {
                can_prepare: canPrepare,
                message: canPrepare ? 'All ingredients available' : 'Insufficient ingredients',
                ingredients: rows,
                missing_ingredients: missingIngredients.map(ing => ({
                    ingredient_id: ing.ingredient_id,
                    ingredient_name: ing.ingredient_name,
                    needed: parseFloat(ing.total_needed),
                    available: parseFloat(ing.current_stock),
                    shortage: parseFloat(ing.total_needed - ing.current_stock),
                    unit: ing.unit
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get menu items that use a specific ingredient
     * @param {number} ingredientId - Ingredient ID
     * @returns {Array} Array of menu items
     */
    static async findItemsByIngredient(ingredientId) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT m.item_id, m.name, m.category_id, c.name as category_name,
                        r.quantity_required, i.unit
                 FROM recipes r
                 JOIN menu_items m ON r.item_id = m.item_id
                 JOIN categories c ON m.category_id = c.category_id
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 WHERE r.ingredient_id = ?
                 ORDER BY m.name ASC`,
                [ingredientId]
            );
            
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Calculate total cost of ingredients for a menu item
     * @param {number} itemId - Menu item ID
     * @returns {Object} Cost breakdown
     */
    static async calculateIngredientCost(itemId) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT r.quantity_required, i.cost_per_unit, i.unit,
                        (r.quantity_required * i.cost_per_unit) as ingredient_cost
                 FROM recipes r
                 JOIN ingredients i ON r.ingredient_id = i.ingredient_id
                 WHERE r.item_id = ?`,
                [itemId]
            );

            const totalCost = rows.reduce((sum, row) => sum + parseFloat(row.ingredient_cost), 0);

            return {
                item_id: itemId,
                ingredients_count: rows.length,
                ingredients: rows,
                total_ingredient_cost: parseFloat(totalCost.toFixed(2))
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = Recipe;
