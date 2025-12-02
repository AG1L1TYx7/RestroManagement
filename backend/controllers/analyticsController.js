const Analytics = require('../models/Analytics');

/**
 * Get comprehensive dashboard statistics
 */
exports.getDashboard = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        const dashboard = await Analytics.getDashboard(filters);

        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard statistics'
        });
    }
};

/**
 * Get sales overview and statistics
 */
exports.getSalesOverview = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date,
            order_type: req.query.order_type
        };

        const sales = await Analytics.getSalesOverview(filters);

        res.json({
            success: true,
            data: sales
        });
    } catch (error) {
        console.error('Get sales overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve sales statistics'
        });
    }
};

/**
 * Get top selling menu items
 */
exports.getTopSellingItems = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date,
            limit: req.query.limit || 10
        };

        const items = await Analytics.getTopSellingItems(filters);

        res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get top selling items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve top selling items'
        });
    }
};

/**
 * Get category performance statistics
 */
exports.getCategoryPerformance = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        const categories = await Analytics.getCategoryPerformance(filters);

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Get category performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve category statistics'
        });
    }
};

/**
 * Get inventory analytics and insights
 */
exports.getInventoryAnalytics = async (req, res) => {
    try {
        const analytics = await Analytics.getInventoryAnalytics();

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Get inventory analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve inventory analytics'
        });
    }
};

/**
 * Get staff performance metrics
 */
exports.getStaffPerformance = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        const staff = await Analytics.getStaffPerformance(filters);

        res.json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (error) {
        console.error('Get staff performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve staff performance metrics'
        });
    }
};

/**
 * Get purchase order analytics
 */
exports.getPurchaseOrderAnalytics = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        const analytics = await Analytics.getPurchaseOrderAnalytics(filters);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Get PO analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve purchase order analytics'
        });
    }
};

/**
 * Get revenue trend over time
 */
exports.getRevenueTrend = async (req, res) => {
    try {
        const period = req.query.period || 'daily'; // daily, weekly, monthly
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        if (!['daily', 'weekly', 'monthly'].includes(period)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid period. Must be: daily, weekly, or monthly'
            });
        }

        const trend = await Analytics.getRevenueTrend(period, filters);

        res.json({
            success: true,
            period,
            count: trend.length,
            data: trend
        });
    } catch (error) {
        console.error('Get revenue trend error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve revenue trend'
        });
    }
};

/**
 * Get profit analysis
 */
exports.getProfitAnalysis = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        const profit = await Analytics.getProfitAnalysis(filters);

        res.json({
            success: true,
            data: profit
        });
    } catch (error) {
        console.error('Get profit analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profit analysis'
        });
    }
};

/**
 * Get comprehensive analytics report
 */
exports.getComprehensiveReport = async (req, res) => {
    try {
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        // Fetch all analytics in parallel
        const [
            dashboard,
            sales,
            topItems,
            categories,
            inventory,
            staff,
            purchaseOrders,
            profit
        ] = await Promise.all([
            Analytics.getDashboard(filters),
            Analytics.getSalesOverview(filters),
            Analytics.getTopSellingItems({ ...filters, limit: 5 }),
            Analytics.getCategoryPerformance(filters),
            Analytics.getInventoryAnalytics(),
            Analytics.getStaffPerformance(filters),
            Analytics.getPurchaseOrderAnalytics(filters),
            Analytics.getProfitAnalysis(filters)
        ]);

        res.json({
            success: true,
            data: {
                dashboard,
                sales,
                top_selling_items: topItems,
                category_performance: categories,
                inventory,
                staff_performance: staff,
                purchase_orders: purchaseOrders,
                profit_analysis: profit
            }
        });
    } catch (error) {
        console.error('Get comprehensive report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate comprehensive report'
        });
    }
};
