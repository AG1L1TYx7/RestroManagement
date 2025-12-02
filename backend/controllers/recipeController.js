const Recipe = require('../models/Recipe');
const MenuItem = require('../models/MenuItem');

/**
 * Create recipe (add ingredient to menu item)
 * @route POST /api/v1/recipes
 * @access Private (Admin/Manager)
 */
const createRecipe = async (req, res) => {
    try {
        const { item_id, ingredient_id, quantity_required } = req.body;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(item_id);
        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        // Check if recipe already exists
        const exists = await Recipe.exists(item_id, ingredient_id);
        if (exists) {
            return res.status(409).json({
                status: 'error',
                message: 'This ingredient is already added to the menu item'
            });
        }

        const recipe = await Recipe.create({ item_id, ingredient_id, quantity_required });

        res.status(201).json({
            status: 'success',
            message: 'Recipe created successfully',
            data: recipe
        });
    } catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create recipe',
            error: error.message
        });
    }
};

/**
 * Get all recipes for a menu item
 * @route GET /api/v1/recipes/item/:itemId
 * @access Public
 */
const getRecipesByMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const recipes = await Recipe.findByMenuItem(itemId);

        res.status(200).json({
            status: 'success',
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recipes',
            error: error.message
        });
    }
};

/**
 * Get all recipes
 * @route GET /api/v1/recipes
 * @access Public
 */
const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.findAll();

        res.status(200).json({
            status: 'success',
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        console.error('Get all recipes error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recipes',
            error: error.message
        });
    }
};

/**
 * Update recipe quantity
 * @route PUT /api/v1/recipes/:id
 * @access Private (Admin/Manager)
 */
const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity_required } = req.body;

        // Check if recipe exists
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }

        const updatedRecipe = await Recipe.update(id, quantity_required);

        res.status(200).json({
            status: 'success',
            message: 'Recipe updated successfully',
            data: updatedRecipe
        });
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update recipe',
            error: error.message
        });
    }
};

/**
 * Delete recipe
 * @route DELETE /api/v1/recipes/:id
 * @access Private (Admin/Manager)
 */
const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if recipe exists
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipe not found'
            });
        }

        await Recipe.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete recipe',
            error: error.message
        });
    }
};

/**
 * Check menu item availability based on inventory
 * @route GET /api/v1/recipes/item/:itemId/availability
 * @access Public
 */
const checkMenuItemAvailability = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity = 1 } = req.query;

        const availability = await Recipe.checkAvailability(itemId, parseInt(quantity));

        res.status(200).json({
            status: 'success',
            data: availability
        });
    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check availability',
            error: error.message
        });
    }
};

/**
 * Get menu items using specific ingredient
 * @route GET /api/v1/recipes/ingredient/:ingredientId
 * @access Public
 */
const getItemsByIngredient = async (req, res) => {
    try {
        const { ingredientId } = req.params;

        const items = await Recipe.findItemsByIngredient(ingredientId);

        res.status(200).json({
            status: 'success',
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get items by ingredient error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch items',
            error: error.message
        });
    }
};

/**
 * Get ingredient cost breakdown for menu item
 * @route GET /api/v1/recipes/item/:itemId/cost
 * @access Private (Admin/Manager)
 */
const getIngredientCost = async (req, res) => {
    try {
        const { itemId } = req.params;

        const costBreakdown = await Recipe.calculateIngredientCost(itemId);

        res.status(200).json({
            status: 'success',
            data: costBreakdown
        });
    } catch (error) {
        console.error('Get ingredient cost error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to calculate cost',
            error: error.message
        });
    }
};

module.exports = {
    createRecipe,
    getRecipesByMenuItem,
    getAllRecipes,
    updateRecipe,
    deleteRecipe,
    checkMenuItemAvailability,
    getItemsByIngredient,
    getIngredientCost
};
