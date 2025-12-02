const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authenticate } = require('../middleware/auth');
const { managerAccess } = require('../middleware/rbac');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

const recipeValidation = [
    body('item_id')
        .notEmpty()
        .withMessage('Menu item ID is required')
        .isInt({ min: 1 })
        .withMessage('Menu item ID must be a positive integer'),
    body('ingredient_id')
        .notEmpty()
        .withMessage('Ingredient ID is required')
        .isInt({ min: 1 })
        .withMessage('Ingredient ID must be a positive integer'),
    body('quantity_required')
        .notEmpty()
        .withMessage('Quantity required is required')
        .isFloat({ min: 0 })
        .withMessage('Quantity must be a positive number')
];

const updateRecipeValidation = [
    body('quantity_required')
        .notEmpty()
        .withMessage('Quantity required is required')
        .isFloat({ min: 0 })
        .withMessage('Quantity must be a positive number')
];

/**
 * @route   GET /api/v1/recipes/item/:itemId/availability
 * @desc    Check menu item availability based on inventory
 * @access  Public
 */
router.get('/item/:itemId/availability', recipeController.checkMenuItemAvailability);

/**
 * @route   GET /api/v1/recipes/item/:itemId/cost
 * @desc    Get ingredient cost breakdown
 * @access  Private (Admin/Manager)
 */
router.get(
    '/item/:itemId/cost',
    authenticate,
    managerAccess,
    recipeController.getIngredientCost
);

/**
 * @route   GET /api/v1/recipes/item/:itemId
 * @desc    Get all recipes for a menu item
 * @access  Public
 */
router.get('/item/:itemId', recipeController.getRecipesByMenuItem);

/**
 * @route   GET /api/v1/recipes/ingredient/:ingredientId
 * @desc    Get menu items using specific ingredient
 * @access  Public
 */
router.get('/ingredient/:ingredientId', recipeController.getItemsByIngredient);

/**
 * @route   GET /api/v1/recipes
 * @desc    Get all recipes
 * @access  Public
 */
router.get('/', recipeController.getAllRecipes);

/**
 * @route   POST /api/v1/recipes
 * @desc    Create recipe (add ingredient to menu item)
 * @access  Private (Admin/Manager)
 */
router.post(
    '/',
    authenticate,
    managerAccess,
    recipeValidation,
    validate,
    recipeController.createRecipe
);

/**
 * @route   PUT /api/v1/recipes/:id
 * @desc    Update recipe quantity
 * @access  Private (Admin/Manager)
 */
router.put(
    '/:id',
    authenticate,
    managerAccess,
    updateRecipeValidation,
    validate,
    recipeController.updateRecipe
);

/**
 * @route   DELETE /api/v1/recipes/:id
 * @desc    Delete recipe
 * @access  Private (Admin/Manager)
 */
router.delete(
    '/:id',
    authenticate,
    managerAccess,
    recipeController.deleteRecipe
);

module.exports = router;
