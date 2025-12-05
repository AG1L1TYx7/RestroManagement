-- ============================================================================
-- Restaurant Management System - Database Schema
-- Database: MySQL 8.0+
-- Normalization: 3NF (Third Normal Form)
-- ============================================================================

-- Drop database if exists and create new
DROP DATABASE IF EXISTS restaurant_management;
CREATE DATABASE restaurant_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE restaurant_management;

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB;

-- ============================================================================
-- 2. BRANCHES TABLE
-- ============================================================================
CREATE TABLE branches (
    branch_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_name VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch_name (branch_name)
) ENGINE=InnoDB;

-- ============================================================================
-- 3. USERS TABLE
-- ============================================================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL,
    branch_id INT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    INDEX idx_branch (branch_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 4. CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    loyalty_points INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_name (first_name, last_name)
) ENGINE=InnoDB;

-- ============================================================================
-- 5. TABLES (Restaurant Tables)
-- ============================================================================
CREATE TABLE restaurant_tables (
    table_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    status ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available',
    location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE KEY unique_table_per_branch (branch_id, table_number),
    INDEX idx_status (status),
    INDEX idx_branch (branch_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 6. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_name (category_name),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 7. MENU ITEMS TABLE
-- ============================================================================
CREATE TABLE menu_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0.00,
    preparation_time INT DEFAULT 0 COMMENT 'in minutes',
    image_url VARCHAR(255),
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    availability_status ENUM('available', 'unavailable', 'discontinued') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    INDEX idx_item_name (item_name),
    INDEX idx_category (category_id),
    INDEX idx_status (availability_status),
    INDEX idx_price (price)
) ENGINE=InnoDB;

-- ============================================================================
-- 8. SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    lead_time_days INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_name (supplier_name),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 9. INGREDIENTS TABLE
-- ============================================================================
CREATE TABLE ingredients (
    ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    unit_of_measurement VARCHAR(20) NOT NULL COMMENT 'kg, g, l, ml, pieces, etc.',
    cost_per_unit DECIMAL(10,2) NOT NULL,
    supplier_id INT,
    category VARCHAR(50),
    reorder_level DECIMAL(10,2) DEFAULT 0.00,
    maximum_stock_level DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    INDEX idx_ingredient_name (ingredient_name),
    INDEX idx_supplier (supplier_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 10. RECIPES TABLE (Junction Table: Menu Items <-> Ingredients)
-- ============================================================================
CREATE TABLE recipes (
    recipe_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_item_ingredient (item_id, ingredient_id),
    INDEX idx_item (item_id),
    INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 11. INVENTORY TABLE
-- ============================================================================
CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id INT NOT NULL,
    branch_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL,
    last_restocked TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE KEY unique_ingredient_per_branch (ingredient_id, branch_id),
    INDEX idx_ingredient (ingredient_id),
    INDEX idx_branch (branch_id),
    INDEX idx_quantity (quantity)
) ENGINE=InnoDB;

-- ============================================================================
-- 12. STOCK TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE stock_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id INT NOT NULL,
    branch_id INT NOT NULL,
    transaction_type ENUM('received', 'deducted', 'adjustment', 'waste', 'transfer') NOT NULL,
    quantity_change DECIMAL(10,2) NOT NULL,
    quantity_before DECIMAL(10,2) NOT NULL,
    quantity_after DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50) COMMENT 'order, purchase_order, adjustment, etc.',
    reference_id INT,
    reason VARCHAR(255),
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_ingredient (ingredient_id),
    INDEX idx_branch (branch_id),
    INDEX idx_type (transaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 13. WASTE TRACKING TABLE
-- ============================================================================
CREATE TABLE waste_tracking (
    waste_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id INT NOT NULL,
    branch_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    waste_reason ENUM('expired', 'damaged', 'spoiled', 'overproduction', 'contaminated', 'other') NOT NULL,
    cost_impact DECIMAL(10,2) NOT NULL,
    notes TEXT,
    recorded_by INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_ingredient (ingredient_id),
    INDEX idx_branch (branch_id),
    INDEX idx_reason (waste_reason),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 14. ORDERS TABLE
-- ============================================================================
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    table_id INT,
    branch_id INT NOT NULL,
    order_type ENUM('dine-in', 'takeout', 'delivery') NOT NULL DEFAULT 'dine-in',
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    staff_id INT NOT NULL,
    notes TEXT,
    cancelled_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(table_id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_customer (customer_id),
    INDEX idx_table (table_id),
    INDEX idx_branch (branch_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 15. ORDER DETAILS TABLE
-- ============================================================================
CREATE TABLE order_details (
    order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    status ENUM('pending', 'preparing', 'ready', 'served') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_item (item_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 16. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'digital_wallet', 'other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    amount_tendered DECIMAL(10,2),
    change_amount DECIMAL(10,2),
    transaction_reference VARCHAR(100),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
    notes TEXT,
    processed_by INT NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT,
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_method (payment_method),
    INDEX idx_status (payment_status)
) ENGINE=InnoDB;

-- ============================================================================
-- 17. PURCHASE ORDERS TABLE
-- ============================================================================
CREATE TABLE purchase_orders (
    po_id INT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    branch_id INT NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'submitted', 'approved', 'ordered', 'received', 'cancelled') DEFAULT 'draft',
    notes TEXT,
    created_by INT NOT NULL,
    approved_by INT,
    received_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    received_at TIMESTAMP NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_po_number (po_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_branch (branch_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 18. PURCHASE ORDER DETAILS TABLE
-- ============================================================================
CREATE TABLE po_details (
    po_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_ordered DECIMAL(10,2) NOT NULL,
    quantity_received DECIMAL(10,2) DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    INDEX idx_po (po_id),
    INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB;

-- ============================================================================
-- DATABASE VIEWS
-- ============================================================================

-- View: Current Inventory Status with Stock Levels
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT 
    i.inventory_id,
    ing.ingredient_name,
    ing.category,
    b.branch_name,
    i.quantity,
    i.unit,
    ing.cost_per_unit,
    (i.quantity * ing.cost_per_unit) AS total_value,
    ing.reorder_level,
    ing.maximum_stock_level,
    CASE 
        WHEN i.quantity <= 0 THEN 'critical'
        WHEN i.quantity <= ing.reorder_level THEN 'low'
        WHEN i.quantity > ing.maximum_stock_level THEN 'overstocked'
        ELSE 'sufficient'
    END AS stock_status,
    i.last_restocked,
    i.updated_at
FROM inventory i
JOIN ingredients ing ON i.ingredient_id = ing.ingredient_id
JOIN branches b ON i.branch_id = b.branch_id;

-- View: Daily Sales Summary
CREATE OR REPLACE VIEW v_daily_sales AS
SELECT 
    DATE(o.created_at) AS sale_date,
    b.branch_name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.subtotal) AS total_subtotal,
    SUM(o.discount) AS total_discount,
    SUM(o.tax) AS total_tax,
    SUM(o.total) AS total_revenue,
    AVG(o.total) AS average_order_value,
    COUNT(DISTINCT o.customer_id) AS unique_customers
FROM orders o
JOIN branches b ON o.branch_id = b.branch_id
WHERE o.status NOT IN ('cancelled')
GROUP BY DATE(o.created_at), b.branch_name;

-- View: Menu Item Profitability
CREATE OR REPLACE VIEW v_menu_profitability AS
SELECT 
    mi.item_id,
    mi.item_name,
    c.category_name,
    mi.price,
    mi.cost,
    (mi.price - mi.cost) AS profit_per_item,
    CASE 
        WHEN mi.cost > 0 THEN ((mi.price - mi.cost) / mi.price * 100)
        ELSE 0
    END AS profit_margin_percentage,
    COUNT(od.order_detail_id) AS times_ordered,
    SUM(od.quantity) AS total_quantity_sold,
    SUM(od.subtotal) AS total_revenue,
    SUM(od.quantity * mi.cost) AS total_cost,
    SUM(od.subtotal - (od.quantity * mi.cost)) AS total_profit
FROM menu_items mi
JOIN categories c ON mi.category_id = c.category_id
LEFT JOIN order_details od ON mi.item_id = od.item_id
GROUP BY mi.item_id, mi.item_name, c.category_name, mi.price, mi.cost;

-- View: Low Stock Items
CREATE OR REPLACE VIEW v_low_stock_items AS
SELECT 
    i.inventory_id,
    ing.ingredient_name,
    b.branch_name,
    i.quantity,
    i.unit,
    ing.reorder_level,
    (ing.reorder_level - i.quantity) AS quantity_to_reorder,
    ing.cost_per_unit,
    ((ing.reorder_level - i.quantity) * ing.cost_per_unit) AS estimated_cost,
    s.supplier_name,
    s.lead_time_days
FROM inventory i
JOIN ingredients ing ON i.ingredient_id = ing.ingredient_id
JOIN branches b ON i.branch_id = b.branch_id
LEFT JOIN suppliers s ON ing.supplier_id = s.supplier_id
WHERE i.quantity <= ing.reorder_level;

-- ============================================================================
-- DATABASE TRIGGERS
-- ============================================================================

-- Trigger: Update menu item cost when recipe changes
DELIMITER //
CREATE TRIGGER trg_update_menu_cost_after_recipe_insert
AFTER INSERT ON recipes
FOR EACH ROW
BEGIN
    UPDATE menu_items
    SET cost = (
        SELECT COALESCE(SUM(r.quantity * ing.cost_per_unit), 0)
        FROM recipes r
        JOIN ingredients ing ON r.ingredient_id = ing.ingredient_id
        WHERE r.item_id = NEW.item_id
    )
    WHERE item_id = NEW.item_id;
END;//

CREATE TRIGGER trg_update_menu_cost_after_recipe_update
AFTER UPDATE ON recipes
FOR EACH ROW
BEGIN
    UPDATE menu_items
    SET cost = (
        SELECT COALESCE(SUM(r.quantity * ing.cost_per_unit), 0)
        FROM recipes r
        JOIN ingredients ing ON r.ingredient_id = ing.ingredient_id
        WHERE r.item_id = NEW.item_id
    )
    WHERE item_id = NEW.item_id;
END;//

CREATE TRIGGER trg_update_menu_cost_after_recipe_delete
AFTER DELETE ON recipes
FOR EACH ROW
BEGIN
    UPDATE menu_items
    SET cost = (
        SELECT COALESCE(SUM(r.quantity * ing.cost_per_unit), 0)
        FROM recipes r
        JOIN ingredients ing ON r.ingredient_id = ing.ingredient_id
        WHERE r.item_id = OLD.item_id
    )
    WHERE item_id = OLD.item_id;
END;//

-- Trigger: Log stock transactions when inventory is updated
CREATE TRIGGER trg_log_inventory_update
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    IF OLD.quantity != NEW.quantity THEN
        INSERT INTO stock_transactions (
            ingredient_id,
            branch_id,
            transaction_type,
            quantity_change,
            quantity_before,
            quantity_after,
            reference_type,
            reason,
            created_by
        ) VALUES (
            NEW.ingredient_id,
            NEW.branch_id,
            IF(NEW.quantity > OLD.quantity, 'received', 'deducted'),
            NEW.quantity - OLD.quantity,
            OLD.quantity,
            NEW.quantity,
            'adjustment',
            'Automatic log from inventory update',
            1
        );
    END IF;
END;//

-- Trigger: Update customer statistics on new order
CREATE TRIGGER trg_update_customer_stats_on_order
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.customer_id IS NOT NULL AND NEW.status NOT IN ('cancelled') THEN
        UPDATE customers
        SET 
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total
        WHERE customer_id = NEW.customer_id;
    END IF;
END;//

-- Trigger: Update customer statistics on order completion
CREATE TRIGGER trg_update_customer_stats_on_order_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.customer_id IS NOT NULL THEN
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            -- Order was cancelled, decrease stats
            UPDATE customers
            SET 
                total_orders = total_orders - 1,
                total_spent = total_spent - OLD.total
            WHERE customer_id = NEW.customer_id;
        ELSEIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
            -- Order was un-cancelled, increase stats
            UPDATE customers
            SET 
                total_orders = total_orders + 1,
                total_spent = total_spent + NEW.total
            WHERE customer_id = NEW.customer_id;
        END IF;
    END IF;
END;//

DELIMITER ;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Receive Purchase Order and Update Inventory
DELIMITER //
CREATE PROCEDURE sp_receive_purchase_order(
    IN p_po_id INT,
    IN p_received_by INT
)
BEGIN
    DECLARE v_branch_id INT;
    DECLARE v_ingredient_id INT;
    DECLARE v_quantity_received DECIMAL(10,2);
    DECLARE v_unit VARCHAR(20);
    DECLARE done INT DEFAULT FALSE;
    
    -- Declare cursor for PO details
    DECLARE po_cursor CURSOR FOR
        SELECT ingredient_id, quantity_received, unit
        FROM po_details
        WHERE po_id = p_po_id AND quantity_received > 0;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Get branch_id from purchase order
    SELECT branch_id INTO v_branch_id
    FROM purchase_orders
    WHERE po_id = p_po_id;
    
    -- Open cursor
    OPEN po_cursor;
    
    read_loop: LOOP
        FETCH po_cursor INTO v_ingredient_id, v_quantity_received, v_unit;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Update inventory
        INSERT INTO inventory (ingredient_id, branch_id, quantity, unit)
        VALUES (v_ingredient_id, v_branch_id, v_quantity_received, v_unit)
        ON DUPLICATE KEY UPDATE
            quantity = quantity + v_quantity_received,
            last_restocked = CURRENT_TIMESTAMP;
        
        -- Log transaction
        INSERT INTO stock_transactions (
            ingredient_id,
            branch_id,
            transaction_type,
            quantity_change,
            quantity_before,
            quantity_after,
            reference_type,
            reference_id,
            reason,
            created_by
        )
        SELECT 
            v_ingredient_id,
            v_branch_id,
            'received',
            v_quantity_received,
            COALESCE((SELECT quantity FROM inventory 
                     WHERE ingredient_id = v_ingredient_id 
                     AND branch_id = v_branch_id), 0) - v_quantity_received,
            COALESCE((SELECT quantity FROM inventory 
                     WHERE ingredient_id = v_ingredient_id 
                     AND branch_id = v_branch_id), 0),
            'purchase_order',
            p_po_id,
            CONCAT('Received from PO #', p_po_id),
            p_received_by;
    END LOOP;
    
    CLOSE po_cursor;
    
    -- Update purchase order status
    UPDATE purchase_orders
    SET 
        status = 'received',
        received_by = p_received_by,
        actual_delivery_date = CURRENT_DATE,
        received_at = CURRENT_TIMESTAMP
    WHERE po_id = p_po_id;
    
    COMMIT;
END;//

-- Procedure: Deduct Inventory for Order
CREATE PROCEDURE sp_deduct_inventory_for_order(
    IN p_order_id INT,
    IN p_branch_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_item_id INT;
    DECLARE v_quantity INT;
    DECLARE v_ingredient_id INT;
    DECLARE v_recipe_quantity DECIMAL(10,3);
    DECLARE v_total_quantity_needed DECIMAL(10,2);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor for order items
    DECLARE order_cursor CURSOR FOR
        SELECT item_id, quantity
        FROM order_details
        WHERE order_id = p_order_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    START TRANSACTION;
    
    OPEN order_cursor;
    
    order_loop: LOOP
        FETCH order_cursor INTO v_item_id, v_quantity;
        IF done THEN
            LEAVE order_loop;
        END IF;
        
        -- For each ingredient in the recipe
        BEGIN
            DECLARE recipe_done INT DEFAULT FALSE;
            DECLARE recipe_cursor CURSOR FOR
                SELECT ingredient_id, quantity
                FROM recipes
                WHERE item_id = v_item_id;
            
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET recipe_done = TRUE;
            
            OPEN recipe_cursor;
            
            recipe_loop: LOOP
                FETCH recipe_cursor INTO v_ingredient_id, v_recipe_quantity;
                IF recipe_done THEN
                    LEAVE recipe_loop;
                END IF;
                
                SET v_total_quantity_needed = v_recipe_quantity * v_quantity;
                
                -- Deduct from inventory
                UPDATE inventory
                SET quantity = quantity - v_total_quantity_needed
                WHERE ingredient_id = v_ingredient_id
                AND branch_id = p_branch_id;
                
                -- Log transaction
                INSERT INTO stock_transactions (
                    ingredient_id,
                    branch_id,
                    transaction_type,
                    quantity_change,
                    quantity_before,
                    quantity_after,
                    reference_type,
                    reference_id,
                    reason,
                    created_by
                )
                SELECT 
                    v_ingredient_id,
                    p_branch_id,
                    'deducted',
                    -v_total_quantity_needed,
                    quantity + v_total_quantity_needed,
                    quantity,
                    'order',
                    p_order_id,
                    CONCAT('Deducted for Order #', p_order_id),
                    p_user_id
                FROM inventory
                WHERE ingredient_id = v_ingredient_id
                AND branch_id = p_branch_id;
                
            END LOOP;
            
            CLOSE recipe_cursor;
        END;
    END LOOP;
    
    CLOSE order_cursor;
    
    COMMIT;
END;//

DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_orders_branch_status_date ON orders(branch_id, status, created_at);
CREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at);
CREATE INDEX idx_stock_transactions_branch_date ON stock_transactions(branch_id, created_at);
CREATE INDEX idx_inventory_branch_ingredient ON inventory(branch_id, ingredient_id);

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
