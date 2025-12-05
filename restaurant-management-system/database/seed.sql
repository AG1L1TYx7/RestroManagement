-- ============================================================================
-- Restaurant Management System - Seed Data
-- This file contains initial/sample data for testing and development
-- ============================================================================

USE restaurant_management;

-- ============================================================================
-- 1. INSERT ROLES
-- ============================================================================
INSERT INTO roles (role_name, description, permissions) VALUES
('admin', 'System Administrator', '["*"]'),
('manager', 'Restaurant Manager', '["orders.*", "inventory.*", "reports.*", "menu.*", "suppliers.*", "purchase_orders.*"]'),
('staff', 'Restaurant Staff', '["orders.create", "orders.view", "customers.*", "menu.view"]'),
('kitchen', 'Kitchen Staff', '["orders.view", "orders.update_status"]');

-- ============================================================================
-- 2. INSERT BRANCHES
-- ============================================================================
INSERT INTO branches (branch_name, address, city, state, postal_code, phone, email, manager_name, status) VALUES
('Downtown Branch', '123 Main Street', 'Boston', 'MA', '02101', '617-555-0001', 'downtown@restaurant.com', 'John Smith', 'active'),
('Uptown Branch', '456 Park Avenue', 'Boston', 'MA', '02102', '617-555-0002', 'uptown@restaurant.com', 'Jane Doe', 'active'),
('Harbor Branch', '789 Harbor View', 'Boston', 'MA', '02103', '617-555-0003', 'harbor@restaurant.com', 'Mike Johnson', 'active');

-- ============================================================================
-- 3. INSERT USERS
-- Password for all users: "password123" (hashed with BCrypt)
-- ============================================================================
INSERT INTO users (username, email, password_hash, full_name, phone, role_id, branch_id, status) VALUES
('admin', 'admin@restaurant.com', '$2a$10$YQ7Y5xQfKr5GKF5kKF5kKuH5kKF5kKF5kKF5kKF5kKF5kKF5kKF5k', 'Administrator', '617-555-1001', 1, 1, 'active'),
('manager1', 'manager1@restaurant.com', '$2a$10$YQ7Y5xQfKr5GKF5kKF5kKuH5kKF5kKF5kKF5kKF5kKF5kKF5kKF5k', 'Alice Manager', '617-555-1002', 2, 1, 'active'),
('manager2', 'manager2@restaurant.com', '$2a$10$YQ7Y5xQfKr5GKF5kKF5kKuH5kKF5kKF5kKF5kKF5kKF5kKF5kKF5k', 'Bob Manager', '617-555-1003', 2, 2, 'active'),
('staff1', 'staff1@restaurant.com', '$2a$10$YQ7Y5xQfKr5GKF5kKF5kKuH5kKF5kKF5kKF5kKF5kKF5kKF5kKF5k', 'Charlie Staff', '617-555-1004', 3, 1, 'active'),
('staff2', 'staff2@restaurant.com', '$2a$10$YQ7Y5xQfKr5GKF5kKF5kKuH5kKF5kKF5kKF5kKF5kKF5kKF5kKF5k', 'Diana Staff', '617-555-1005', 3, 2, 'active'),
('kitchen1', 'kitchen1@restaurant.com', '$2a$10$YQ7Y5xQfKr5GKF5kKF5kKuH5kKF5kKF5kKF5kKF5kKF5kKF5kKF5k', 'Edward Chef', '617-555-1006', 4, 1, 'active'),
('kitchen2', 'kitchen2@restaurant.com', '$2a$10$YQ7Y5xQfKr5GKF5kKF5kKuH5kKF5kKF5kKF5kKF5kKF5kKF5kKF5k', 'Fiona Chef', '617-555-1007', 4, 2, 'active');

-- ============================================================================
-- 4. INSERT CUSTOMERS
-- ============================================================================
INSERT INTO customers (first_name, last_name, phone, email, address, city, postal_code, loyalty_points, total_orders, total_spent) VALUES
('Michael', 'Brown', '617-555-2001', 'michael.brown@email.com', '111 Oak Street', 'Boston', '02101', 150, 12, 480.50),
('Sarah', 'Wilson', '617-555-2002', 'sarah.wilson@email.com', '222 Maple Ave', 'Boston', '02102', 200, 18, 720.00),
('David', 'Lee', '617-555-2003', 'david.lee@email.com', '333 Pine Road', 'Boston', '02103', 100, 8, 320.25),
('Emily', 'Taylor', '617-555-2004', 'emily.taylor@email.com', '444 Birch Lane', 'Boston', '02101', 180, 15, 600.75),
('James', 'Anderson', '617-555-2005', 'james.anderson@email.com', '555 Cedar Drive', 'Boston', '02102', 90, 7, 280.00),
('Jennifer', 'Martinez', '617-555-2006', 'jennifer.martinez@email.com', '666 Elm Street', 'Boston', '02103', 220, 20, 880.50),
('Robert', 'Garcia', '617-555-2007', 'robert.garcia@email.com', '777 Spruce Way', 'Boston', '02101', 130, 10, 420.00),
('Lisa', 'Rodriguez', '617-555-2008', 'lisa.rodriguez@email.com', '888 Willow Court', 'Boston', '02102', 160, 13, 520.25);

-- ============================================================================
-- 5. INSERT RESTAURANT TABLES
-- ============================================================================
INSERT INTO restaurant_tables (branch_id, table_number, capacity, status, location) VALUES
-- Downtown Branch Tables
(1, 'T1', 2, 'available', 'Window'),
(1, 'T2', 2, 'available', 'Window'),
(1, 'T3', 4, 'available', 'Center'),
(1, 'T4', 4, 'available', 'Center'),
(1, 'T5', 6, 'available', 'Corner'),
(1, 'T6', 8, 'available', 'Private Room'),
-- Uptown Branch Tables
(2, 'T1', 2, 'available', 'Bar Area'),
(2, 'T2', 2, 'available', 'Bar Area'),
(2, 'T3', 4, 'available', 'Main Hall'),
(2, 'T4', 4, 'available', 'Main Hall'),
(2, 'T5', 6, 'available', 'Patio'),
(2, 'T6', 6, 'available', 'Patio'),
-- Harbor Branch Tables
(3, 'T1', 2, 'available', 'Harbor View'),
(3, 'T2', 4, 'available', 'Harbor View'),
(3, 'T3', 4, 'available', 'Inside'),
(3, 'T4', 6, 'available', 'VIP Section');

-- ============================================================================
-- 6. INSERT CATEGORIES
-- ============================================================================
INSERT INTO categories (category_name, description, display_order, status) VALUES
('Appetizers', 'Starters and small plates', 1, 'active'),
('Soups & Salads', 'Fresh soups and salads', 2, 'active'),
('Main Course', 'Main entrees and dishes', 3, 'active'),
('Pasta & Rice', 'Pasta and rice dishes', 4, 'active'),
('Seafood', 'Fresh seafood selections', 5, 'active'),
('Grilled Items', 'Grilled meats and vegetables', 6, 'active'),
('Vegetarian', 'Vegetarian specialties', 7, 'active'),
('Desserts', 'Sweet treats and desserts', 8, 'active'),
('Beverages', 'Hot and cold drinks', 9, 'active');

-- ============================================================================
-- 7. INSERT SUPPLIERS
-- ============================================================================
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, city, postal_code, tax_id, payment_terms, lead_time_days, rating, status) VALUES
('Fresh Produce Co', 'Tom Green', '617-555-3001', 'orders@freshproduce.com', '100 Farm Road', 'Boston', '02104', 'TAX-001', 'Net 30', 2, 4.5, 'active'),
('Ocean Fresh Seafood', 'Mary Blue', '617-555-3002', 'orders@oceanfresh.com', '200 Harbor Street', 'Boston', '02105', 'TAX-002', 'Net 15', 1, 4.8, 'active'),
('Prime Meats Inc', 'Jack Red', '617-555-3003', 'orders@primemeats.com', '300 Industrial Ave', 'Boston', '02106', 'TAX-003', 'Net 30', 3, 4.6, 'active'),
('Dairy Delights', 'Susan White', '617-555-3004', 'orders@dairydelights.com', '400 Milk Lane', 'Boston', '02107', 'TAX-004', 'Net 20', 2, 4.7, 'active'),
('Spice World', 'Ahmed Khan', '617-555-3005', 'orders@spiceworld.com', '500 Flavor Street', 'Boston', '02108', 'TAX-005', 'Net 45', 5, 4.4, 'active'),
('Beverage Distributors', 'Lisa Brown', '617-555-3006', 'orders@beveragedist.com', '600 Drink Road', 'Boston', '02109', 'TAX-006', 'Net 30', 3, 4.5, 'active');

-- ============================================================================
-- 8. INSERT INGREDIENTS
-- ============================================================================
INSERT INTO ingredients (ingredient_name, description, unit_of_measurement, cost_per_unit, supplier_id, category, reorder_level, maximum_stock_level) VALUES
-- Vegetables
('Tomatoes', 'Fresh Roma tomatoes', 'kg', 3.50, 1, 'Vegetables', 10.00, 50.00),
('Lettuce', 'Iceberg lettuce', 'kg', 2.80, 1, 'Vegetables', 8.00, 40.00),
('Onions', 'Yellow onions', 'kg', 2.20, 1, 'Vegetables', 15.00, 60.00),
('Bell Peppers', 'Mixed bell peppers', 'kg', 4.50, 1, 'Vegetables', 8.00, 35.00),
('Mushrooms', 'Button mushrooms', 'kg', 6.80, 1, 'Vegetables', 5.00, 25.00),
('Garlic', 'Fresh garlic', 'kg', 8.00, 1, 'Vegetables', 3.00, 15.00),
('Broccoli', 'Fresh broccoli', 'kg', 4.20, 1, 'Vegetables', 7.00, 30.00),
-- Seafood
('Salmon', 'Atlantic salmon fillets', 'kg', 25.00, 2, 'Seafood', 5.00, 20.00),
('Shrimp', 'Large shrimp', 'kg', 22.00, 2, 'Seafood', 5.00, 25.00),
('Tuna', 'Yellowfin tuna steaks', 'kg', 28.00, 2, 'Seafood', 3.00, 15.00),
-- Meats
('Chicken Breast', 'Boneless chicken breast', 'kg', 12.50, 3, 'Meats', 10.00, 50.00),
('Beef Steak', 'Prime ribeye steak', 'kg', 35.00, 3, 'Meats', 8.00, 30.00),
('Pork Chops', 'Center cut pork chops', 'kg', 15.00, 3, 'Meats', 7.00, 30.00),
('Ground Beef', 'Lean ground beef', 'kg', 10.00, 3, 'Meats', 12.00, 45.00),
-- Dairy
('Milk', 'Whole milk', 'liter', 1.50, 4, 'Dairy', 20.00, 80.00),
('Butter', 'Unsalted butter', 'kg', 8.50, 4, 'Dairy', 5.00, 25.00),
('Cheese', 'Cheddar cheese', 'kg', 12.00, 4, 'Dairy', 8.00, 35.00),
('Cream', 'Heavy cream', 'liter', 4.50, 4, 'Dairy', 10.00, 40.00),
('Eggs', 'Large eggs', 'dozen', 3.50, 4, 'Dairy', 30.00, 100.00),
-- Pantry
('Rice', 'Jasmine rice', 'kg', 2.50, 5, 'Pantry', 25.00, 100.00),
('Pasta', 'Spaghetti pasta', 'kg', 2.80, 5, 'Pantry', 20.00, 80.00),
('Flour', 'All-purpose flour', 'kg', 1.80, 5, 'Pantry', 30.00, 120.00),
('Sugar', 'White sugar', 'kg', 2.00, 5, 'Pantry', 20.00, 80.00),
('Salt', 'Table salt', 'kg', 1.20, 5, 'Pantry', 10.00, 50.00),
('Olive Oil', 'Extra virgin olive oil', 'liter', 12.00, 5, 'Pantry', 8.00, 30.00),
('Soy Sauce', 'Dark soy sauce', 'liter', 4.50, 5, 'Pantry', 5.00, 20.00),
-- Beverages
('Coffee Beans', 'Arabica coffee beans', 'kg', 18.00, 6, 'Beverages', 5.00, 25.00),
('Tea Leaves', 'Black tea leaves', 'kg', 12.00, 6, 'Beverages', 3.00, 15.00),
('Orange Juice', 'Fresh orange juice', 'liter', 5.50, 6, 'Beverages', 10.00, 40.00),
('Coca Cola', 'Coca Cola 330ml', 'case', 15.00, 6, 'Beverages', 8.00, 30.00);

-- ============================================================================
-- 9. INSERT MENU ITEMS
-- ============================================================================
INSERT INTO menu_items (category_id, item_name, description, price, cost, preparation_time, is_vegetarian, is_vegan, is_gluten_free, availability_status) VALUES
-- Appetizers
(1, 'Caesar Salad', 'Classic Caesar salad with romaine lettuce, parmesan, and croutons', 8.99, 2.50, 10, 1, 0, 0, 'available'),
(1, 'Garlic Bread', 'Toasted bread with garlic butter and herbs', 5.99, 1.20, 8, 1, 0, 0, 'available'),
(1, 'Bruschetta', 'Toasted bread topped with tomatoes, basil, and olive oil', 7.99, 1.80, 10, 1, 1, 0, 'available'),
(1, 'Chicken Wings', 'Spicy buffalo chicken wings with ranch dip', 11.99, 3.50, 15, 0, 0, 1, 'available'),
-- Soups & Salads
(2, 'Tomato Soup', 'Creamy tomato soup with basil', 6.99, 1.50, 12, 1, 0, 1, 'available'),
(2, 'Greek Salad', 'Mixed greens with feta cheese, olives, and tomatoes', 9.99, 2.80, 10, 1, 0, 1, 'available'),
(2, 'Chicken Noodle Soup', 'Homemade chicken soup with vegetables', 7.99, 2.20, 15, 0, 0, 0, 'available'),
-- Main Course
(3, 'Grilled Chicken', 'Marinated grilled chicken breast with vegetables', 16.99, 5.50, 25, 0, 0, 1, 'available'),
(3, 'Beef Steak', 'Prime ribeye steak with mashed potatoes', 28.99, 12.00, 30, 0, 0, 1, 'available'),
(3, 'Pork Chops', 'Grilled pork chops with apple sauce', 18.99, 6.50, 25, 0, 0, 1, 'available'),
-- Pasta & Rice
(4, 'Spaghetti Carbonara', 'Classic Italian carbonara with bacon and cream', 14.99, 4.20, 20, 0, 0, 0, 'available'),
(4, 'Mushroom Risotto', 'Creamy risotto with mixed mushrooms', 15.99, 4.80, 25, 1, 0, 1, 'available'),
(4, 'Chicken Alfredo', 'Fettuccine with chicken in alfredo sauce', 16.99, 5.50, 22, 0, 0, 0, 'available'),
-- Seafood
(5, 'Grilled Salmon', 'Fresh Atlantic salmon with lemon butter', 24.99, 10.50, 20, 0, 0, 1, 'available'),
(5, 'Shrimp Scampi', 'Garlic butter shrimp over linguine', 22.99, 9.20, 18, 0, 0, 0, 'available'),
(5, 'Tuna Steak', 'Seared tuna steak with wasabi', 26.99, 11.50, 15, 0, 0, 1, 'available'),
-- Vegetarian
(7, 'Veggie Burger', 'House-made veggie patty with fries', 12.99, 3.80, 18, 1, 1, 0, 'available'),
(7, 'Vegetable Stir Fry', 'Mixed vegetables in soy sauce with rice', 13.99, 3.50, 15, 1, 1, 1, 'available'),
-- Desserts
(8, 'Chocolate Cake', 'Rich chocolate layer cake', 7.99, 2.20, 5, 1, 0, 0, 'available'),
(8, 'Cheesecake', 'New York style cheesecake', 8.99, 2.80, 5, 1, 0, 0, 'available'),
(8, 'Ice Cream Sundae', 'Vanilla ice cream with toppings', 6.99, 1.80, 5, 1, 0, 1, 'available'),
-- Beverages
(9, 'Coffee', 'Freshly brewed coffee', 2.99, 0.50, 3, 1, 1, 1, 'available'),
(9, 'Cappuccino', 'Espresso with steamed milk', 4.99, 0.80, 5, 1, 0, 1, 'available'),
(9, 'Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 1.20, 3, 1, 1, 1, 'available'),
(9, 'Coca Cola', 'Classic Coca Cola', 2.99, 0.60, 2, 1, 1, 1, 'available');

-- ============================================================================
-- 10. INSERT RECIPES (Linking Menu Items to Ingredients)
-- ============================================================================

-- Caesar Salad (item_id = 1)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(1, 2, 0.150, 'kg'),  -- Lettuce
(1, 17, 0.030, 'kg'), -- Cheese
(1, 25, 0.020, 'liter'); -- Olive Oil

-- Garlic Bread (item_id = 2)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(2, 22, 0.100, 'kg'),  -- Flour
(2, 16, 0.030, 'kg'),  -- Butter
(2, 6, 0.020, 'kg');   -- Garlic

-- Grilled Chicken (item_id = 8)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(8, 11, 0.250, 'kg'),  -- Chicken Breast
(8, 4, 0.050, 'kg'),   -- Bell Peppers
(8, 25, 0.015, 'liter'); -- Olive Oil

-- Beef Steak (item_id = 9)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(9, 12, 0.300, 'kg'),  -- Beef Steak
(9, 16, 0.020, 'kg');  -- Butter

-- Spaghetti Carbonara (item_id = 11)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(11, 21, 0.200, 'kg'),  -- Pasta
(11, 18, 0.050, 'liter'), -- Cream
(11, 17, 0.030, 'kg'),  -- Cheese
(11, 19, 2.000, 'pieces'); -- Eggs

-- Grilled Salmon (item_id = 14)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(14, 8, 0.200, 'kg'),   -- Salmon
(14, 16, 0.020, 'kg'),  -- Butter
(14, 25, 0.010, 'liter'); -- Olive Oil

-- Shrimp Scampi (item_id = 15)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(15, 9, 0.150, 'kg'),   -- Shrimp
(15, 21, 0.150, 'kg'),  -- Pasta
(15, 6, 0.015, 'kg'),   -- Garlic
(15, 16, 0.025, 'kg');  -- Butter

-- Vegetable Stir Fry (item_id = 18)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(18, 4, 0.100, 'kg'),   -- Bell Peppers
(18, 5, 0.080, 'kg'),   -- Mushrooms
(18, 7, 0.100, 'kg'),   -- Broccoli
(18, 20, 0.150, 'kg'),  -- Rice
(18, 26, 0.030, 'liter'); -- Soy Sauce

-- Coffee (item_id = 22)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(22, 27, 0.015, 'kg');  -- Coffee Beans

-- Fresh Orange Juice (item_id = 24)
INSERT INTO recipes (item_id, ingredient_id, quantity, unit) VALUES
(24, 29, 0.250, 'liter'); -- Orange Juice

-- ============================================================================
-- 11. INSERT INITIAL INVENTORY (for Downtown Branch)
-- ============================================================================
INSERT INTO inventory (ingredient_id, branch_id, quantity, unit, last_restocked) VALUES
-- Vegetables
(1, 1, 30.00, 'kg', CURRENT_TIMESTAMP),  -- Tomatoes
(2, 1, 25.00, 'kg', CURRENT_TIMESTAMP),  -- Lettuce
(3, 1, 40.00, 'kg', CURRENT_TIMESTAMP),  -- Onions
(4, 1, 20.00, 'kg', CURRENT_TIMESTAMP),  -- Bell Peppers
(5, 1, 15.00, 'kg', CURRENT_TIMESTAMP),  -- Mushrooms
(6, 1, 8.00, 'kg', CURRENT_TIMESTAMP),   -- Garlic
(7, 1, 18.00, 'kg', CURRENT_TIMESTAMP),  -- Broccoli
-- Seafood
(8, 1, 12.00, 'kg', CURRENT_TIMESTAMP),  -- Salmon
(9, 1, 15.00, 'kg', CURRENT_TIMESTAMP),  -- Shrimp
(10, 1, 8.00, 'kg', CURRENT_TIMESTAMP),  -- Tuna
-- Meats
(11, 1, 35.00, 'kg', CURRENT_TIMESTAMP), -- Chicken Breast
(12, 1, 20.00, 'kg', CURRENT_TIMESTAMP), -- Beef Steak
(13, 1, 18.00, 'kg', CURRENT_TIMESTAMP), -- Pork Chops
(14, 1, 30.00, 'kg', CURRENT_TIMESTAMP), -- Ground Beef
-- Dairy
(15, 1, 50.00, 'liter', CURRENT_TIMESTAMP), -- Milk
(16, 1, 15.00, 'kg', CURRENT_TIMESTAMP),    -- Butter
(17, 1, 20.00, 'kg', CURRENT_TIMESTAMP),    -- Cheese
(18, 1, 25.00, 'liter', CURRENT_TIMESTAMP), -- Cream
(19, 1, 60.00, 'dozen', CURRENT_TIMESTAMP), -- Eggs
-- Pantry
(20, 1, 80.00, 'kg', CURRENT_TIMESTAMP),  -- Rice
(21, 1, 60.00, 'kg', CURRENT_TIMESTAMP),  -- Pasta
(22, 1, 100.00, 'kg', CURRENT_TIMESTAMP), -- Flour
(23, 1, 50.00, 'kg', CURRENT_TIMESTAMP),  -- Sugar
(24, 1, 30.00, 'kg', CURRENT_TIMESTAMP),  -- Salt
(25, 1, 20.00, 'liter', CURRENT_TIMESTAMP), -- Olive Oil
(26, 1, 12.00, 'liter', CURRENT_TIMESTAMP), -- Soy Sauce
-- Beverages
(27, 1, 15.00, 'kg', CURRENT_TIMESTAMP),    -- Coffee Beans
(28, 1, 8.00, 'kg', CURRENT_TIMESTAMP),     -- Tea Leaves
(29, 1, 30.00, 'liter', CURRENT_TIMESTAMP), -- Orange Juice
(30, 1, 20.00, 'case', CURRENT_TIMESTAMP);  -- Coca Cola

-- ============================================================================
-- 12. INSERT SAMPLE ORDERS
-- ============================================================================

-- Order 1: Dine-in at Downtown Branch
INSERT INTO orders (customer_id, table_id, branch_id, order_type, subtotal, discount, tax, total, status, payment_status, staff_id, notes, created_at) VALUES
(1, 1, 1, 'dine-in', 45.97, 0.00, 3.68, 49.65, 'completed', 'paid', 4, 'Extra napkins please', DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal, status) VALUES
(1, 1, 1, 8.99, 8.99, 'served'),   -- Caesar Salad
(1, 8, 1, 16.99, 16.99, 'served'),  -- Grilled Chicken
(1, 14, 1, 24.99, 24.99, 'served'), -- Grilled Salmon
(1, 22, 2, 2.99, 5.98, 'served');   -- Coffee x2

INSERT INTO payments (order_id, payment_method, amount, amount_tendered, change_amount, payment_status, processed_by) VALUES
(1, 'cash', 49.65, 60.00, 10.35, 'completed', 4);

-- Order 2: Takeout order
INSERT INTO orders (customer_id, table_id, branch_id, order_type, subtotal, discount, tax, total, status, payment_status, staff_id, notes, created_at) VALUES
(2, NULL, 1, 'takeout', 31.97, 2.00, 2.40, 32.37, 'completed', 'paid', 4, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal, status) VALUES
(2, 2, 2, 5.99, 11.98, 'served'),   -- Garlic Bread x2
(2, 11, 1, 14.99, 14.99, 'served'), -- Spaghetti Carbonara
(2, 24, 2, 2.99, 5.98, 'served');   -- Coca Cola x2

INSERT INTO payments (order_id, payment_method, amount, transaction_reference, payment_status, processed_by) VALUES
(2, 'credit_card', 32.37, 'TXN-20231201-001', 'completed', 4);

-- Order 3: Current pending order
INSERT INTO orders (customer_id, table_id, branch_id, order_type, subtotal, discount, tax, total, status, payment_status, staff_id, notes) VALUES
(3, 3, 1, 'dine-in', 68.96, 5.00, 5.12, 69.08, 'preparing', 'unpaid', 4, 'Table for celebration');

INSERT INTO order_details (order_id, item_id, quantity, unit_price, subtotal, status) VALUES
(3, 9, 2, 28.99, 57.98, 'preparing'), -- Beef Steak x2
(3, 6, 1, 9.99, 9.99, 'preparing'),   -- Greek Salad
(3, 23, 1, 4.99, 4.99, 'preparing');  -- Cappuccino

-- ============================================================================
-- 13. INSERT SAMPLE PURCHASE ORDERS
-- ============================================================================

-- PO 1: Fresh Produce (Received)
INSERT INTO purchase_orders (po_number, supplier_id, branch_id, expected_delivery_date, actual_delivery_date, subtotal, tax, total, status, notes, created_by, approved_by, received_by, approved_at, received_at) VALUES
('PO-2023-001', 1, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 245.00, 0.00, 245.00, 'received', 'Weekly produce delivery', 2, 2, 2, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO po_details (po_id, ingredient_id, quantity_ordered, quantity_received, unit, unit_cost, subtotal) VALUES
(1, 1, 20.00, 20.00, 'kg', 3.50, 70.00),  -- Tomatoes
(1, 2, 15.00, 15.00, 'kg', 2.80, 42.00),  -- Lettuce
(1, 3, 20.00, 20.00, 'kg', 2.20, 44.00),  -- Onions
(1, 4, 10.00, 10.00, 'kg', 4.50, 45.00),  -- Bell Peppers
(1, 7, 10.00, 10.00, 'kg', 4.20, 42.00);  -- Broccoli

-- PO 2: Pending approval
INSERT INTO purchase_orders (po_number, supplier_id, branch_id, expected_delivery_date, subtotal, tax, total, status, notes, created_by) VALUES
('PO-2023-002', 2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 375.00, 0.00, 375.00, 'submitted', 'Weekly seafood order', 2);

INSERT INTO po_details (po_id, ingredient_id, quantity_ordered, quantity_received, unit, unit_cost, subtotal) VALUES
(2, 8, 10.00, 0.00, 'kg', 25.00, 250.00),  -- Salmon
(2, 9, 5.00, 0.00, 'kg', 22.00, 110.00),   -- Shrimp
(2, 10, 5.00, 0.00, 'kg', 28.00, 140.00);  -- Tuna

-- ============================================================================
-- 14. INSERT SAMPLE WASTE TRACKING
-- ============================================================================
INSERT INTO waste_tracking (ingredient_id, branch_id, quantity, unit, waste_reason, cost_impact, notes, recorded_by, recorded_at) VALUES
(1, 1, 2.50, 'kg', 'spoiled', 8.75, 'Tomatoes went bad over weekend', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 1.20, 'kg', 'expired', 3.36, 'Lettuce past expiration date', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 1, 0.80, 'kg', 'overproduction', 10.00, 'Too much chicken prepared', 6, NOW());

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================

SELECT 'Seed data inserted successfully!' AS Status;
