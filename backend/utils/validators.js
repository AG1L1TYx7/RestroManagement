const { body, validationResult } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('full_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    
    body('role')
        .isIn(['admin', 'manager', 'staff', 'kitchen'])
        .withMessage('Role must be one of: admin, manager, staff, kitchen'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Phone number must be between 10 and 15 digits')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
    body('identifier')
        .trim()
        .notEmpty()
        .withMessage('Email or username is required'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Validation rules for password update
 */
const passwordUpdateValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

/**
 * Validation rules for profile update
 */
const profileUpdateValidation = [
    body('full_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Phone number must be between 10 and 15 digits'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];

/**
 * Middleware to handle validation errors
 */
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

/**
 * Validation rules for category creation/update
 */
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean value')
];

/**
 * Validation rules for menu item creation/update
 */
const menuItemValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Item name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Item name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    
    body('category_id')
        .notEmpty()
        .withMessage('Category ID is required')
        .isInt({ min: 1 })
        .withMessage('Category ID must be a positive integer'),
    
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('cost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Cost must be a positive number'),
    
    body('image_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Image URL must be a valid URL'),
    
    body('is_available')
        .optional()
        .isBoolean()
        .withMessage('is_available must be a boolean value'),
    
    body('preparation_time')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Preparation time must be a positive integer (in minutes)')
];

/**
 * Validation rules for menu item update (all fields optional)
 */
const menuItemUpdateValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Item name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    
    body('category_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Category ID must be a positive integer'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('cost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Cost must be a positive number'),
    
    body('image_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Image URL must be a valid URL'),
    
    body('is_available')
        .optional()
        .isBoolean()
        .withMessage('is_available must be a boolean value'),
    
    body('preparation_time')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Preparation time must be a positive integer (in minutes)')
];

/**
 * Validation rules for order creation
 */
const orderValidation = [
    body('table_number')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Table number must be a positive integer'),
    
    body('order_type')
        .isIn(['dine-in', 'takeout', 'delivery'])
        .withMessage('Order type must be one of: dine-in, takeout, delivery'),
    
    body('payment_method')
        .isIn(['cash', 'card', 'online', 'upi'])
        .withMessage('Payment method must be one of: cash, card, online, upi'),
    
    body('discount_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount amount must be a positive number'),
    
    body('tax_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Tax amount must be a positive number'),
    
    body('special_instructions')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Special instructions cannot exceed 500 characters'),
    
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    
    body('items.*.item_id')
        .isInt({ min: 1 })
        .withMessage('Item ID must be a positive integer'),
    
    body('items.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100'),
    
    body('items.*.special_instructions')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Item special instructions cannot exceed 200 characters')
];

/**
 * Validation rules for order status update
 */
const orderStatusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'])
        .withMessage('Invalid order status')
];

/**
 * Validation rules for payment status update
 */
const paymentStatusValidation = [
    body('payment_status')
        .isIn(['unpaid', 'paid', 'refunded', 'failed'])
        .withMessage('Invalid payment status')
];

/**
 * Validation rules for table creation/update
 */
const tableValidation = [
    body('table_number')
        .trim()
        .notEmpty()
        .withMessage('Table number is required')
        .isLength({ min: 1, max: 20 })
        .withMessage('Table number must be between 1 and 20 characters'),
    
    body('capacity')
        .notEmpty()
        .withMessage('Capacity is required')
        .isInt({ min: 1, max: 20 })
        .withMessage('Capacity must be between 1 and 20'),
    
    body('location')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Location must not exceed 50 characters'),
    
    body('status')
        .optional()
        .isIn(['available', 'occupied', 'reserved', 'maintenance'])
        .withMessage('Status must be one of: available, occupied, reserved, maintenance')
];

/**
 * Validation rules for table status update
 */
const tableStatusValidation = [
    body('status')
        .isIn(['available', 'occupied', 'reserved', 'maintenance'])
        .withMessage('Status must be one of: available, occupied, reserved, maintenance')
];

/**
 * Validation rules for reservation creation/update
 */
const reservationValidation = [
    body('table_id')
        .notEmpty()
        .withMessage('Table ID is required')
        .isInt({ min: 1 })
        .withMessage('Table ID must be a positive integer'),
    
    body('customer_name')
        .trim()
        .notEmpty()
        .withMessage('Customer name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Customer name must be between 2 and 100 characters'),
    
    body('customer_phone')
        .trim()
        .notEmpty()
        .withMessage('Customer phone is required')
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Phone number must be between 10 and 15 digits'),
    
    body('customer_email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('party_size')
        .notEmpty()
        .withMessage('Party size is required')
        .isInt({ min: 1, max: 20 })
        .withMessage('Party size must be between 1 and 20'),
    
    body('reservation_date')
        .notEmpty()
        .withMessage('Reservation date is required')
        .isISO8601()
        .withMessage('Reservation date must be a valid date-time'),
    
    body('duration_minutes')
        .optional()
        .isInt({ min: 30, max: 480 })
        .withMessage('Duration must be between 30 and 480 minutes'),
    
    body('special_requests')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Special requests cannot exceed 500 characters')
];

/**
 * Validation rules for reservation status update
 */
const reservationStatusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'])
        .withMessage('Status must be one of: pending, confirmed, seated, completed, cancelled, no-show')
];

module.exports = {
    registerValidation,
    loginValidation,
    passwordUpdateValidation,
    profileUpdateValidation,
    categoryValidation,
    menuItemValidation,
    menuItemUpdateValidation,
    orderValidation,
    orderStatusValidation,
    paymentStatusValidation,
    tableValidation,
    tableStatusValidation,
    reservationValidation,
    reservationStatusValidation,
    validate
};
