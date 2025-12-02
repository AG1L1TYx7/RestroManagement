
const { pool } = require('../config/database');

class Analytics {
    /**
     * Get sales overview statistics
     * @param {Object} filters - Date range and other filters
     * @returns {Object} Sales statistics
     */
    static async getSalesOverview(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date, order_type } = filters;

            let whereClause = "WHERE o.status = 'completed'";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            if (order_type) {
                whereClause += ' AND o.order_type = ?';
                params.push(order_type);
            }

            // Overall statistics
            const [overview] = await connection.query(
                `SELECT 
                    COUNT(*) as total_orders,
                    SUM(o.total) as total_revenue,
                    AVG(o.total) as average_order_value,
                    SUM(o.discount) as total_discounts,
                    SUM(o.tax) as total_tax
                FROM orders o
                ${whereClause}`,
                params
            );

            // Revenue by order type
            const [byOrderType] = await connection.query(
                `SELECT 
                    o.order_type,
                    COUNT(*) as order_count,
                    SUM(o.total) as revenue
                FROM orders o
                ${whereClause}
                GROUP BY o.order_type
                ORDER BY revenue DESC`,
                params
            );

            // Revenue by payment method
            const [byPaymentMethod] = await connection.query(
                `SELECT 
                    o.payment_method,
                    COUNT(*) as order_count,
                    SUM(o.total) as revenue
                FROM orders o
                ${whereClause}
                GROUP BY o.payment_method
                ORDER BY revenue DESC`,
                params
            );

            // Daily revenue trend (last 7 days)
            const [dailyTrend] = await connection.query(
                `SELECT 
                    DATE(o.created_at) as date,
                    COUNT(*) as orders,
                    SUM(o.total) as revenue
                FROM orders o
                ${whereClause}
                GROUP BY DATE(o.created_at)
                ORDER BY date DESC
                LIMIT 7`,
                params
            );

            return {
                overview: overview[0],
                by_order_type: byOrderType,
                by_payment_method: byPaymentMethod,
                daily_trend: dailyTrend
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get top selling menu items
     * @param {Object} filters - Date range and limit
     * @returns {Array} Top selling items
     */
    static async getTopSellingItems(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date, limit = 10 } = filters;

            let whereClause = "WHERE o.status = 'completed'";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            params.push(parseInt(limit));

            const [items] = await connection.query(
                `SELECT 
                    m.item_id,
                    m.name,
                    m.price,
                    m.cost,
                    c.name as category,
                    COUNT(oi.order_item_id) as times_ordered,
                    SUM(oi.quantity) as total_quantity_sold,
                    SUM(oi.subtotal) as total_revenue,
                    SUM(oi.quantity * (m.price - m.cost)) as total_profit,
                    ROUND(SUM(oi.quantity * (m.price - m.cost)) / SUM(oi.subtotal) * 100, 2) as profit_margin_percentage
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.item_id
                JOIN categories c ON m.category_id = c.category_id
                JOIN orders o ON oi.order_id = o.order_id
                ${whereClause}
                GROUP BY m.item_id
                ORDER BY total_quantity_sold DESC, total_revenue DESC
                LIMIT ?`,
                params
            );

            return items;
        } finally {
            connection.release();
        }
    }

    /**
     * Get category performance
     * @param {Object} filters - Date range
     * @returns {Array} Category statistics
     */
    static async getCategoryPerformance(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;

            let whereClause = "WHERE o.status = 'completed'";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            const [categories] = await connection.query(
                `SELECT 
                    c.category_id,
                    c.name as category_name,
                    COUNT(DISTINCT oi.order_id) as order_count,
                    COUNT(DISTINCT oi.item_id) as unique_items_sold,
                    SUM(oi.quantity) as total_items_sold,
                    SUM(oi.subtotal) as total_revenue,
                    AVG(oi.unit_price) as average_item_price
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.item_id
                JOIN categories c ON m.category_id = c.category_id
                JOIN orders o ON oi.order_id = o.order_id
                ${whereClause}
                GROUP BY c.category_id
                ORDER BY total_revenue DESC`,
                params
            );

            return categories;
        } finally {
            connection.release();
        }
    }

    /**
     * Get inventory analytics
     * @returns {Object} Inventory statistics and insights
     */
    static async getInventoryAnalytics() {
        const connection = await pool.getConnection();
        try {
            // Current stock status
            const [stockStatus] = await connection.query(
                `SELECT 
                    COUNT(*) as total_ingredients,
                    SUM(CASE WHEN inv.current_stock <= i.min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
                    SUM(CASE WHEN inv.current_stock > i.min_stock_level THEN 1 ELSE 0 END) as adequate_stock_count,
                    SUM(inv.current_stock * i.cost_per_unit) as total_inventory_value
                FROM ingredients i
                LEFT JOIN inventory inv ON i.ingredient_id = inv.ingredient_id`
            );

            // Low stock items
            const [lowStockItems] = await connection.query(
                `SELECT 
                    i.ingredient_id,
                    i.name,
                    i.unit,
                    inv.current_stock,
                    i.min_stock_level,
                    i.reorder_quantity,
                    i.cost_per_unit,
                    (i.reorder_quantity - inv.current_stock) as quantity_needed,
                    (i.reorder_quantity - inv.current_stock) * i.cost_per_unit as estimated_cost
                FROM ingredients i
                LEFT JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
                WHERE inv.current_stock <= i.min_stock_level
                ORDER BY (inv.current_stock / i.min_stock_level) ASC
                LIMIT 20`
            );

            // Inventory turnover (last 30 days)
            const [turnover] = await connection.query(
                `SELECT 
                    i.ingredient_id,
                    i.name,
                    i.unit,
                    inv.current_stock,
                    COALESCE(SUM(CASE WHEN it.transaction_type = 'usage' THEN it.quantity ELSE 0 END), 0) as total_used,
                    COALESCE(SUM(CASE WHEN it.transaction_type = 'purchase' THEN it.quantity ELSE 0 END), 0) as total_purchased,
                    COALESCE(SUM(CASE WHEN it.transaction_type = 'adjustment' THEN it.quantity ELSE 0 END), 0) as total_adjusted
                FROM ingredients i
                LEFT JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
                LEFT JOIN inventory_transactions it ON i.ingredient_id = it.ingredient_id 
                    AND it.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY i.ingredient_id
                ORDER BY total_used DESC
                LIMIT 20`
            );

            // Recent inventory transactions
            const [recentTransactions] = await connection.query(
                `SELECT 
                    it.transaction_id,
                    it.transaction_type,
                    i.name as ingredient_name,
                    it.quantity,
                    i.unit,
                    it.unit_cost,
                    it.reference_type,
                    it.reference_id,
                    u.full_name as performed_by_name,
                    it.notes,
                    it.created_at
                FROM inventory_transactions it
                JOIN ingredients i ON it.ingredient_id = i.ingredient_id
                LEFT JOIN users u ON it.performed_by = u.user_id
                ORDER BY it.created_at DESC
                LIMIT 50`
            );

            return {
                stock_status: stockStatus[0],
                low_stock_items: lowStockItems,
                inventory_turnover: turnover,
                recent_transactions: recentTransactions
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get staff performance metrics
     * @param {Object} filters - Date range
     * @returns {Array} Staff performance data
     */
    static async getStaffPerformance(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;

            let whereClause = "WHERE o.status = 'completed'";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            const [staff] = await connection.query(
                `SELECT 
                    u.user_id,
                    u.full_name,
                    u.role,
                    COUNT(o.order_id) as orders_processed,
                    SUM(o.total) as total_sales,
                    AVG(o.total) as average_order_value,
                    MIN(o.created_at) as first_order_date,
                    MAX(o.created_at) as last_order_date
                FROM orders o
                JOIN users u ON o.created_by = u.user_id
                ${whereClause}
                GROUP BY u.user_id
                ORDER BY total_sales DESC`,
                params
            );

            return staff;
        } finally {
            connection.release();
        }
    }

    /**
     * Get purchase order analytics
     * @param {Object} filters - Date range
     * @returns {Object} PO statistics
     */
    static async getPurchaseOrderAnalytics(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;

            let whereClause = "WHERE 1=1";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(po.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(po.created_at) <= ?';
                params.push(to_date);
            }

            // Overall PO statistics
            const [overview] = await connection.query(
                `SELECT 
                    COUNT(*) as total_pos,
                    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
                    COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                    COUNT(CASE WHEN status = 'received' THEN 1 END) as received_count,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
                    SUM(total) as total_value,
                    AVG(total) as average_po_value,
                    AVG(CASE 
                        WHEN status = 'received' 
                        THEN DATEDIFF(actual_delivery_date, order_date)
                        ELSE NULL 
                    END) as average_delivery_days
                FROM purchase_orders po
                ${whereClause}`,
                params
            );

            // Top suppliers by value
            const [topSuppliers] = await connection.query(
                `SELECT 
                    s.supplier_id,
                    s.name,
                    s.contact_person,
                    COUNT(po.po_id) as total_pos,
                    SUM(po.total) as total_value,
                    AVG(po.total) as average_po_value,
                    COUNT(CASE WHEN po.status = 'received' THEN 1 END) as completed_pos
                FROM purchase_orders po
                JOIN suppliers s ON po.supplier_id = s.supplier_id
                ${whereClause}
                GROUP BY s.supplier_id
                ORDER BY total_value DESC
                LIMIT 10`,
                params
            );

            // Most ordered ingredients
            const [topIngredients] = await connection.query(
                `SELECT 
                    i.ingredient_id,
                    i.name,
                    i.unit,
                    COUNT(DISTINCT po.po_id) as times_ordered,
                    SUM(pod.quantity_ordered) as total_quantity_ordered,
                    SUM(pod.quantity_received) as total_quantity_received,
                    SUM(pod.subtotal) as total_value
                FROM po_details pod
                JOIN purchase_orders po ON pod.po_id = po.po_id
                JOIN ingredients i ON pod.ingredient_id = i.ingredient_id
                ${whereClause.replace('po.', 'po.')}
                GROUP BY i.ingredient_id
                ORDER BY total_value DESC
                LIMIT 10`,
                params
            );

            return {
                overview: overview[0],
                top_suppliers: topSuppliers,
                top_ingredients: topIngredients
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get revenue trends over time
     * @param {String} period - 'daily', 'weekly', or 'monthly'
     * @param {Object} filters - Date range
     * @returns {Array} Revenue trend data
     */
    static async getRevenueTrend(period = 'daily', filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;

            let dateGrouping;
            let dateFormat;
            
            switch (period) {
                case 'weekly':
                    dateGrouping = 'YEARWEEK(o.created_at, 1)';
                    dateFormat = 'YEARWEEK(o.created_at, 1)';
                    break;
                case 'monthly':
                    dateGrouping = 'DATE_FORMAT(o.created_at, "%Y-%m")';
                    dateFormat = 'DATE_FORMAT(o.created_at, "%Y-%m")';
                    break;
                default: // daily
                    dateGrouping = 'DATE(o.created_at)';
                    dateFormat = 'DATE(o.created_at)';
            }

            let whereClause = "WHERE o.status = 'completed'";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            const [trend] = await connection.query(
                `SELECT 
                    ${dateFormat} as period,
                    COUNT(*) as order_count,
                    SUM(o.total) as revenue,
                    AVG(o.total) as average_order_value,
                    SUM(o.discount) as total_discounts,
                    SUM(o.tax) as total_tax
                FROM orders o
                ${whereClause}
                GROUP BY ${dateGrouping}
                ORDER BY period DESC
                LIMIT 30`,
                params
            );

            return trend;
        } finally {
            connection.release();
        }
    }

    /**
     * Get comprehensive dashboard statistics
     * @param {Object} filters - Date range
     * @returns {Object} Dashboard data
     */
    static async getDashboard(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;

            let whereClause = "WHERE o.status = 'completed'";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            // Today's statistics
            const [today] = await connection.query(
                `SELECT 
                    COUNT(*) as orders_today,
                    SUM(total) as revenue_today,
                    AVG(total) as avg_order_today
                FROM orders o
                WHERE o.status = 'completed' 
                AND DATE(o.created_at) = CURDATE()`
            );

            // This week's statistics
            const [thisWeek] = await connection.query(
                `SELECT 
                    COUNT(*) as orders_this_week,
                    SUM(total) as revenue_this_week
                FROM orders o
                WHERE o.status = 'completed' 
                AND YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1)`
            );

            // This month's statistics
            const [thisMonth] = await connection.query(
                `SELECT 
                    COUNT(*) as orders_this_month,
                    SUM(total) as revenue_this_month
                FROM orders o
                WHERE o.status = 'completed' 
                AND YEAR(o.created_at) = YEAR(CURDATE())
                AND MONTH(o.created_at) = MONTH(CURDATE())`
            );

            // Pending orders
            const [pending] = await connection.query(
                `SELECT 
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                    COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
                    COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders
                FROM orders`
            );

            // Low stock alert
            const [lowStock] = await connection.query(
                `SELECT COUNT(*) as low_stock_count
                FROM ingredients i
                LEFT JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
                WHERE inv.current_stock <= i.min_stock_level`
            );

            // Pending POs
            const [pendingPOs] = await connection.query(
                `SELECT 
                    COUNT(CASE WHEN status = 'submitted' THEN 1 END) as awaiting_approval,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as awaiting_receipt
                FROM purchase_orders`
            );

            return {
                today: today[0],
                this_week: thisWeek[0],
                this_month: thisMonth[0],
                pending_orders: pending[0],
                inventory_alerts: lowStock[0],
                purchase_orders: pendingPOs[0]
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get profit analysis
     * @param {Object} filters - Date range
     * @returns {Object} Profit statistics
     */
    static async getProfitAnalysis(filters = {}) {
        const connection = await pool.getConnection();
        try {
            const { from_date, to_date } = filters;

            let whereClause = "WHERE o.status = 'completed'";
            const params = [];

            if (from_date) {
                whereClause += ' AND DATE(o.created_at) >= ?';
                params.push(from_date);
            }

            if (to_date) {
                whereClause += ' AND DATE(o.created_at) <= ?';
                params.push(to_date);
            }

            // Overall profit calculation
            const [profitOverview] = await connection.query(
                `SELECT 
                    SUM(oi.subtotal) as total_revenue,
                    SUM(oi.quantity * m.cost) as total_cost,
                    SUM(oi.quantity * (m.price - m.cost)) as gross_profit,
                    ROUND(SUM(oi.quantity * (m.price - m.cost)) / SUM(oi.subtotal) * 100, 2) as profit_margin_percentage
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.item_id
                JOIN orders o ON oi.order_id = o.order_id
                ${whereClause}`,
                params
            );

            // Profit by category
            const [profitByCategory] = await connection.query(
                `SELECT 
                    c.name as category,
                    SUM(oi.subtotal) as revenue,
                    SUM(oi.quantity * m.cost) as cost,
                    SUM(oi.quantity * (m.price - m.cost)) as profit,
                    ROUND(SUM(oi.quantity * (m.price - m.cost)) / SUM(oi.subtotal) * 100, 2) as margin_percentage
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.item_id
                JOIN categories c ON m.category_id = c.category_id
                JOIN orders o ON oi.order_id = o.order_id
                ${whereClause}
                GROUP BY c.category_id
                ORDER BY profit DESC`,
                params
            );

            // Most profitable items
            const [topProfitItems] = await connection.query(
                `SELECT 
                    m.name,
                    m.price,
                    m.cost,
                    (m.price - m.cost) as profit_per_unit,
                    ROUND((m.price - m.cost) / m.price * 100, 2) as margin_percentage,
                    SUM(oi.quantity) as quantity_sold,
                    SUM(oi.quantity * (m.price - m.cost)) as total_profit
                FROM order_items oi
                JOIN menu_items m ON oi.item_id = m.item_id
                JOIN orders o ON oi.order_id = o.order_id
                ${whereClause}
                GROUP BY m.item_id
                ORDER BY total_profit DESC
                LIMIT 10`,
                params
            );

            return {
                overview: profitOverview[0],
                by_category: profitByCategory,
                top_profit_items: topProfitItems
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = Analytics;
