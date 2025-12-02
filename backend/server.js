const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { authenticate } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Import routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const menuItemRoutes = require('./routes/menuItems');
const recipeRoutes = require('./routes/recipes');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const reservationRoutes = require('./routes/reservations');
const supplierRoutes = require('./routes/suppliers');
const inventoryRoutes = require('./routes/inventory');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const analyticsRoutes = require('./routes/analytics');

// API routes
app.get('/api/v1', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Restaurant Management API v1',
        version: '1.0.0'
    });
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/menu-items', menuItemRoutes);
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
// Alias for analytics (backward compatibility)
app.use('/api/v1/reports', analyticsRoutes);

// Stub endpoint for branches (not implemented yet)
app.get('/api/v1/branches', authenticate, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: []
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
    try {
        // Test database connection first
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('Failed to connect to database. Server not started.');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV}`);
            console.log(`✓ Health check: http://localhost:${PORT}/health`);
            console.log(`✓ API endpoint: http://localhost:${PORT}/api/v1`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
