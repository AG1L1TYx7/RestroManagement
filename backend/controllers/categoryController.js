const Category = require('../models/Category');

/**
 * Create a new category
 * @route POST /api/v1/categories
 * @access Private (Admin/Manager)
 */
const createCategory = async (req, res) => {
    try {
        const { name, description, is_active } = req.body;

        // Check if category name already exists
        const exists = await Category.nameExists(name);
        if (exists) {
            return res.status(409).json({
                status: 'error',
                message: 'Category name already exists'
            });
        }

        const category = await Category.create({ name, description, is_active });

        res.status(201).json({
            status: 'success',
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create category',
            error: error.message
        });
    }
};

/**
 * Get all categories
 * @route GET /api/v1/categories
 * @access Public
 */
const getAllCategories = async (req, res) => {
    try {
        const { active_only, with_count } = req.query;
        
        let categories;
        if (with_count === 'true') {
            categories = await Category.findAllWithItemCount();
        } else {
            categories = await Category.findAll(active_only === 'true');
        }

        res.status(200).json({
            status: 'success',
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

/**
 * Get category by ID
 * @route GET /api/v1/categories/:id
 * @access Public
 */
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch category',
            error: error.message
        });
    }
};

/**
 * Update category
 * @route PUT /api/v1/categories/:id
 * @access Private (Admin/Manager)
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        // Check if updating name and new name already exists
        if (updates.name && updates.name !== category.name) {
            const exists = await Category.nameExists(updates.name, id);
            if (exists) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Category name already exists'
                });
            }
        }

        const updatedCategory = await Category.update(id, updates);

        res.status(200).json({
            status: 'success',
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update category',
            error: error.message
        });
    }
};

/**
 * Delete category (soft delete)
 * @route DELETE /api/v1/categories/:id
 * @access Private (Admin)
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        await Category.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        
        if (error.message.includes('existing menu items')) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete category',
            error: error.message
        });
    }
};

/**
 * Toggle category active status
 * @route PATCH /api/v1/categories/:id/toggle
 * @access Private (Admin/Manager)
 */
const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        const updatedCategory = await Category.toggleActive(id);

        res.status(200).json({
            status: 'success',
            message: `Category ${updatedCategory.is_active ? 'activated' : 'deactivated'} successfully`,
            data: updatedCategory
        });
    } catch (error) {
        console.error('Toggle category status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to toggle category status',
            error: error.message
        });
    }
};

/**
 * Get menu items for a category
 * @route GET /api/v1/categories/:id/items
 * @access Public
 */
const getCategoryMenuItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { available_only } = req.query;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        const items = await Category.getMenuItems(id, available_only === 'true');

        res.status(200).json({
            status: 'success',
            category: category.name,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get category items error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch category items',
            error: error.message
        });
    }
};

/**
 * Get category statistics
 * @route GET /api/v1/categories/stats
 * @access Private (Admin/Manager)
 */
const getCategoryStats = async (req, res) => {
    try {
        const categories = await Category.findAllWithItemCount();
        
        const stats = {
            total_categories: categories.length,
            active_categories: categories.filter(c => c.is_active).length,
            inactive_categories: categories.filter(c => !c.is_active).length,
            total_menu_items: categories.reduce((sum, c) => sum + parseInt(c.item_count || 0), 0),
            categories_with_items: categories.filter(c => parseInt(c.item_count || 0) > 0).length,
            empty_categories: categories.filter(c => parseInt(c.item_count || 0) === 0).length
        };

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Get category stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch category statistics',
            error: error.message
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getCategoryMenuItems,
    getCategoryStats
};
