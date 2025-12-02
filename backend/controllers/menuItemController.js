const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

/**
 * Create a new menu item
 * @route POST /api/v1/menu-items
 * @access Private (Admin/Manager)
 */
const createMenuItem = async (req, res) => {
    try {
        const { name, description, category_id, price, cost, image_url, is_available, preparation_time } = req.body;

        // Verify category exists
        const category = await Category.findById(category_id);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        const menuItem = await MenuItem.create({
            name,
            description,
            category_id,
            price,
            cost,
            image_url,
            is_available,
            preparation_time
        });

        res.status(201).json({
            status: 'success',
            message: 'Menu item created successfully',
            data: menuItem
        });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create menu item',
            error: error.message
        });
    }
};

/**
 * Get all menu items
 * @route GET /api/v1/menu-items
 * @access Public
 */
const getAllMenuItems = async (req, res) => {
    try {
        const { category_id, available_only, search, grouped } = req.query;

        let menuItems;
        
        if (grouped === 'true') {
            menuItems = await MenuItem.findAllGroupedByCategory(available_only === 'true');
            return res.status(200).json({
                status: 'success',
                count: menuItems.length,
                data: menuItems
            });
        }

        const filters = {};
        if (category_id) filters.category_id = category_id;
        if (available_only === 'true') filters.available_only = true;
        if (search) filters.search = search;

        menuItems = await MenuItem.findAll(filters);

        res.status(200).json({
            status: 'success',
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch menu items',
            error: error.message
        });
    }
};

/**
 * Get menu item by ID
 * @route GET /api/v1/menu-items/:id
 * @access Public
 */
const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findById(id);

        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: menuItem
        });
    } catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch menu item',
            error: error.message
        });
    }
};

/**
 * Update menu item
 * @route PUT /api/v1/menu-items/:id
 * @access Private (Admin/Manager)
 */
const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        // If updating category, verify new category exists
        if (updates.category_id) {
            const category = await Category.findById(updates.category_id);
            if (!category) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Category not found'
                });
            }
        }

        const updatedMenuItem = await MenuItem.update(id, updates);

        res.status(200).json({
            status: 'success',
            message: 'Menu item updated successfully',
            data: updatedMenuItem
        });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update menu item',
            error: error.message
        });
    }
};

/**
 * Delete menu item (soft delete)
 * @route DELETE /api/v1/menu-items/:id
 * @access Private (Admin)
 */
const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        await MenuItem.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete menu item',
            error: error.message
        });
    }
};

/**
 * Toggle menu item availability
 * @route PATCH /api/v1/menu-items/:id/toggle
 * @access Private (Admin/Manager)
 */
const toggleMenuItemAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        const updatedMenuItem = await MenuItem.toggleAvailability(id);

        res.status(200).json({
            status: 'success',
            message: `Menu item ${updatedMenuItem.is_available ? 'made available' : 'made unavailable'}`,
            data: updatedMenuItem
        });
    } catch (error) {
        console.error('Toggle menu item availability error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to toggle menu item availability',
            error: error.message
        });
    }
};

/**
 * Search menu items
 * @route GET /api/v1/menu-items/search
 * @access Public
 */
const searchMenuItems = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Search query is required'
            });
        }

        const menuItems = await MenuItem.search(q.trim());

        res.status(200).json({
            status: 'success',
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        console.error('Search menu items error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to search menu items',
            error: error.message
        });
    }
};

/**
 * Get popular menu items
 * @route GET /api/v1/menu-items/popular
 * @access Public
 */
const getPopularMenuItems = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const menuItems = await MenuItem.getPopular(parseInt(limit));

        res.status(200).json({
            status: 'success',
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        console.error('Get popular menu items error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch popular menu items',
            error: error.message
        });
    }
};

/**
 * Get menu item profit analysis
 * @route GET /api/v1/menu-items/:id/profit
 * @access Private (Admin/Manager)
 */
const getMenuItemProfit = async (req, res) => {
    try {
        const { id } = req.params;
        
        const analysis = await MenuItem.getProfitAnalysis(id);
        
        if (!analysis) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: analysis
        });
    } catch (error) {
        console.error('Get menu item profit error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch profit analysis',
            error: error.message
        });
    }
};

/**
 * Update menu item availability based on inventory
 * @route POST /api/v1/menu-items/:id/update-availability
 * @access Private (Admin/Manager)
 */
const updateMenuItemAvailabilityByInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        const result = await MenuItem.updateAvailabilityByInventory(id);

        res.status(200).json({
            status: 'success',
            message: 'Availability updated based on inventory',
            data: result
        });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update availability',
            error: error.message
        });
    }
};

/**
 * Update all menu items availability based on inventory
 * @route POST /api/v1/menu-items/update-all-availability
 * @access Private (Admin/Manager)
 */
const updateAllAvailabilityByInventory = async (req, res) => {
    try {
        const result = await MenuItem.updateAllAvailabilityByInventory();

        res.status(200).json({
            status: 'success',
            message: 'All menu items availability updated',
            data: result
        });
    } catch (error) {
        console.error('Update all availability error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update availability',
            error: error.message
        });
    }
};

/**
 * Get menu item statistics
 * @route GET /api/v1/menu-items/stats
 * @access Private (Admin/Manager)
 */
const getMenuItemStats = async (req, res) => {
    try {
        const allItems = await MenuItem.findAll({});
        
        const stats = {
            total_items: allItems.length,
            available_items: allItems.filter(item => item.is_available).length,
            unavailable_items: allItems.filter(item => !item.is_available).length,
            average_price: allItems.length > 0 
                ? (allItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) / allItems.length).toFixed(2)
                : '0.00',
            average_cost: allItems.length > 0
                ? (allItems.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0) / allItems.length).toFixed(2)
                : '0.00',
            total_categories: [...new Set(allItems.map(item => item.category_id))].length
        };

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Get menu item stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch menu item statistics',
            error: error.message
        });
    }
};

module.exports = {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    searchMenuItems,
    getPopularMenuItems,
    getMenuItemProfit,
    updateMenuItemAvailabilityByInventory,
    updateAllAvailabilityByInventory,
    getMenuItemStats
};
