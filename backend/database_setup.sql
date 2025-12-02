-- Restaurant Management Database Setup
-- Run this script to create the database and all tables

-- Create database
CREATE DATABASE IF NOT EXISTS restaurant_management;
USE restaurant_management;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS order_item_ingredients;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS po_details;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS users;

-- 1. Users Table (3NF)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'staff', 'kitchen') NOT NULL,
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tables Table (Restaurant Tables) (3NF)
CREATE TABLE tables (
    table_id INT PRIMARY KEY AUTO_INCREMENT,
    table_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available',
    location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_table_number (table_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Reservations Table (3NF)
CREATE TABLE reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15) NOT NULL,
    customer_email VARCHAR(100),
    party_size INT NOT NULL,
    reservation_date DATETIME NOT NULL,
    duration_minutes INT DEFAULT 120,
    status ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show') DEFAULT 'pending',
    special_requests TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(table_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_table (table_id),
    INDEX idx_date (reservation_date),
    INDEX idx_status (status),
    INDEX idx_customer_phone (customer_phone),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Categories Table (3NF)
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Menu Items Table (3NF)
CREATE TABLE menu_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT true,
    preparation_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_name (name),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Suppliers Table (3NF)
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    payment_terms VARCHAR(100),
    lead_time_days INT DEFAULT 7,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Ingredients Table (3NF)
CREATE TABLE ingredients (
    ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    min_stock_level DECIMAL(10, 2) NOT NULL,
    reorder_quantity DECIMAL(10, 2) NOT NULL,
    supplier_id INT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_supplier (supplier_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Recipes Table (Junction table for Menu Items and Ingredients) (3NF)
CREATE TABLE recipes (
    recipe_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_required DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_recipe (item_id, ingredient_id),
    INDEX idx_item (item_id),
    INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Inventory Table (3NF)
CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id INT NOT NULL,
    current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    last_restocked TIMESTAMP NULL,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    UNIQUE KEY unique_inventory (ingredient_id),
    INDEX idx_ingredient (ingredient_id),
    INDEX idx_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Inventory Transactions Table (3NF)
CREATE TABLE inventory_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id INT NOT NULL,
    transaction_type ENUM('purchase', 'usage', 'wastage', 'adjustment', 'return') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2),
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    performed_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_ingredient (ingredient_id),
    INDEX idx_type (transaction_type),
    INDEX idx_date (created_at),
    INDEX idx_performed_by (performed_by),
    INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Purchase Orders Table (3NF)
CREATE TABLE purchase_orders (
    po_id INT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    status ENUM('draft', 'submitted', 'approved', 'received', 'cancelled') DEFAULT 'draft',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by INT NOT NULL,
    approved_by INT,
    received_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_po_number (po_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Purchase Order Details Table (3NF)
CREATE TABLE po_details (
    po_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_ordered DECIMAL(10, 2) NOT NULL,
    quantity_received DECIMAL(10, 2) DEFAULT 0,
    unit_cost DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    INDEX idx_po (po_id),
    INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Orders Table (3NF)
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    table_id INT,
    order_type ENUM('dine-in', 'takeout', 'delivery') NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'online') NULL,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(15),
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (table_id) REFERENCES tables(table_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_order_number (order_number),
    INDEX idx_table (table_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Order Items Table (3NF)
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_item (item_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Order Item Ingredients Table (for ingredient tracking per order item) (3NF)
CREATE TABLE order_item_ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_item_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_used DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE RESTRICT,
    INDEX idx_order_item (order_item_id),
    INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Notifications Table (3NF)
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('low_stock', 'out_of_stock', 'order_ready', 'table_ready', 'system', 'po_approval') NOT NULL,
    message TEXT NOT NULL,
    related_id INT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Audit Logs Table (3NF)
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Views

-- View: Low Stock Items
CREATE OR REPLACE VIEW low_stock_items AS
SELECT 
    i.ingredient_id,
    i.name,
    i.unit,
    inv.current_stock,
    i.min_stock_level,
    i.reorder_quantity,
    ROUND(((i.min_stock_level - inv.current_stock) / i.min_stock_level) * 100, 2) AS shortage_percentage
FROM ingredients i
JOIN inventory inv ON i.ingredient_id = inv.ingredient_id
WHERE inv.current_stock < i.min_stock_level;

-- View: Menu Items with Availability
CREATE OR REPLACE VIEW menu_availability AS
SELECT 
    mi.item_id,
    mi.name,
    mi.price,
    mi.is_available,
    c.name AS category_name,
    COUNT(DISTINCT r.ingredient_id) AS ingredient_count,
    MIN(CASE 
        WHEN inv.current_stock < r.quantity_required THEN 0 
        ELSE 1 
    END) AS has_all_ingredients
FROM menu_items mi
JOIN categories c ON mi.category_id = c.category_id
LEFT JOIN recipes r ON mi.item_id = r.item_id
LEFT JOIN inventory inv ON r.ingredient_id = inv.ingredient_id
GROUP BY mi.item_id, mi.name, mi.price, mi.is_available, c.name;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role, phone, is_active) 
VALUES ('admin', 'admin@restaurant.com', '$2b$10$tQIGnDzjiSIUOAuY4Gv91OwXYxwLt9Ic9BD0DUDTMlhJHGGKdWO2S', 'System Administrator', 'admin', '1234567890', true);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Appetizers', 'Starters and small plates'),
('Main Course', 'Primary dishes'),
('Desserts', 'Sweet treats'),
('Beverages', 'Drinks'),
('Salads', 'Fresh salads');

-- Insert sample tables
INSERT INTO tables (table_number, capacity, status, location) VALUES
('T01', 4, 'available', 'Main Hall'),
('T02', 2, 'available', 'Main Hall'),
('T03', 6, 'available', 'Main Hall'),
('T04', 4, 'available', 'Outdoor'),
('T05', 8, 'available', 'Private Room');

SELECT 'Database setup completed successfully!' AS status;
