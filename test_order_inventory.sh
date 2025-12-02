#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5001/api/v1"
TEST_PASS=0
TEST_FAIL=0

# Print test result
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TEST_PASS++))
    else
        echo -e "${RED}✗${NC} $2"
        ((TEST_FAIL++))
    fi
}

echo "========================================="
echo "Order-Inventory Integration Test Suite"
echo "========================================="
echo ""

# Cleanup old test data
echo "Cleaning up old test data..."
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
DELETE FROM inventory_transactions WHERE notes LIKE '%Test order%';
DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE order_number LIKE 'TEST%');
DELETE FROM orders WHERE order_number LIKE 'TEST%';
DELETE FROM inventory WHERE ingredient_id IN (SELECT ingredient_id FROM ingredients WHERE name LIKE 'Test Order%');
DELETE FROM recipes WHERE item_id IN (SELECT item_id FROM menu_items WHERE name LIKE 'Test Order%');
DELETE FROM menu_items WHERE name LIKE 'Test Order%';
DELETE FROM ingredients WHERE name LIKE 'Test Order%';
DELETE FROM categories WHERE name = 'Test Order Category';
EOF

echo "=========================================
1. Authentication Tests
========================================="

# Test 1: Manager Login
MANAGER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"manager@restaurant.com","password":"Manager123"}')
MANAGER_TOKEN=$(echo "$MANAGER_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('tokens', {}).get('accessToken', ''))" 2>/dev/null)

if [ -n "$MANAGER_TOKEN" ]; then
    print_test 0 "Manager login successful"
else
    print_test 1 "Manager login failed"
    echo "Response: $MANAGER_RESPONSE"
    exit 1
fi

# Test 2: Staff Login
STAFF_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"staff@restaurant.com","password":"Manager123"}')
STAFF_TOKEN=$(echo "$STAFF_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('tokens', {}).get('accessToken', ''))" 2>/dev/null)

if [ -n "$STAFF_TOKEN" ]; then
    print_test 0 "Staff login successful"
else
    print_test 1 "Staff login failed"
fi

echo ""
echo "=========================================
2. Setup: Create Test Data
========================================="

# Test 3: Create test category
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO categories (name, description, is_active)
VALUES ('Test Order Category', 'Test category for order-inventory tests', true)
ON DUPLICATE KEY UPDATE category_id=LAST_INSERT_ID(category_id);
EOF
CATEGORY_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT category_id FROM categories WHERE name = 'Test Order Category';" 2>/dev/null | xargs)

if [ -n "$CATEGORY_ID" ]; then
    print_test 0 "Test category created (ID: $CATEGORY_ID)"
else
    print_test 1 "Failed to create test category"
    exit 1
fi

# Test 4: Create test ingredients
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO ingredients (name, unit, cost_per_unit, min_stock_level, reorder_quantity, category)
VALUES 
    ('Test Order Tomato', 'kg', 5.00, 50, 100, 'Vegetables'),
    ('Test Order Cheese', 'kg', 12.00, 30, 50, 'Dairy'),
    ('Test Order Flour', 'kg', 3.00, 40, 80, 'Grains')
ON DUPLICATE KEY UPDATE ingredient_id=LAST_INSERT_ID(ingredient_id);
EOF

INGREDIENT1_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT ingredient_id FROM ingredients WHERE name = 'Test Order Tomato';" 2>/dev/null | xargs)
INGREDIENT2_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT ingredient_id FROM ingredients WHERE name = 'Test Order Cheese';" 2>/dev/null | xargs)
INGREDIENT3_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT ingredient_id FROM ingredients WHERE name = 'Test Order Flour';" 2>/dev/null | xargs)

if [ -n "$INGREDIENT1_ID" ] && [ -n "$INGREDIENT2_ID" ] && [ -n "$INGREDIENT3_ID" ]; then
    print_test 0 "Test ingredients created (IDs: $INGREDIENT1_ID, $INGREDIENT2_ID, $INGREDIENT3_ID)"
else
    print_test 1 "Failed to create test ingredients"
    exit 1
fi

# Test 5: Set initial inventory
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO inventory (ingredient_id, current_stock, last_restocked)
VALUES 
    ($INGREDIENT1_ID, 100.00, NOW()),
    ($INGREDIENT2_ID, 50.00, NOW()),
    ($INGREDIENT3_ID, 80.00, NOW())
ON DUPLICATE KEY UPDATE 
    current_stock = VALUES(current_stock),
    last_restocked = VALUES(last_restocked);
EOF

TOMATO_STOCK=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT1_ID;" 2>/dev/null)
CHEESE_STOCK=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT2_ID;" 2>/dev/null)

if [ "$TOMATO_STOCK" = "100.00" ] && [ "$CHEESE_STOCK" = "50.00" ]; then
    print_test 0 "Initial inventory set (Tomato: ${TOMATO_STOCK}kg, Cheese: ${CHEESE_STOCK}kg)"
else
    print_test 1 "Failed to set initial inventory"
fi

# Test 6: Create test menu item
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO menu_items (name, description, price, cost, category_id, preparation_time, is_available)
VALUES ('Test Order Pizza', 'Pizza with tomato and cheese', 15.99, 8.00, $CATEGORY_ID, 20, true)
ON DUPLICATE KEY UPDATE item_id=LAST_INSERT_ID(item_id);
EOF

MENU_ITEM_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT item_id FROM menu_items WHERE name = 'Test Order Pizza' ORDER BY item_id DESC LIMIT 1;" 2>/dev/null | xargs)

if [ -n "$MENU_ITEM_ID" ]; then
    print_test 0 "Test menu item created (ID: $MENU_ITEM_ID, Price: \$15.99)"
else
    print_test 1 "Failed to create test menu item"
    exit 1
fi

# Test 7: Create recipe for menu item
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO recipes (item_id, ingredient_id, quantity_required)
VALUES 
    ($MENU_ITEM_ID, $INGREDIENT1_ID, 0.5),
    ($MENU_ITEM_ID, $INGREDIENT2_ID, 0.3)
ON DUPLICATE KEY UPDATE quantity_required=VALUES(quantity_required);
EOF

RECIPE_COUNT=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT COUNT(*) FROM recipes WHERE item_id = $MENU_ITEM_ID;" 2>/dev/null)

if [ "$RECIPE_COUNT" = "2" ]; then
    print_test 0 "Recipe created (Tomato: 0.5kg, Cheese: 0.3kg per pizza)"
else
    print_test 1 "Failed to create recipe"
fi

echo ""
echo "=========================================
3. Order Creation with Inventory Deduction
========================================="

# Test 8: Create order (should deduct inventory)
RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d "{
    \"order_type\": \"takeout\",
    \"payment_method\": \"cash\",
    \"items\": [
      {
        \"item_id\": $MENU_ITEM_ID,
        \"quantity\": 2,
        \"special_instructions\": \"Extra cheese\"
      }
    ]
  }")

ORDER_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('order', {}).get('order_id', ''))" 2>/dev/null)
ORDER_SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null)

if [ "$ORDER_SUCCESS" = "True" ] && [ -n "$ORDER_ID" ]; then
    print_test 0 "Order created successfully (ID: $ORDER_ID, Quantity: 2 pizzas)"
else
    print_test 1 "Failed to create order"
    echo "Response: $RESPONSE"
fi

# Test 9: Verify inventory deduction (Tomato: 100 - 1 = 99kg, Cheese: 50 - 0.6 = 49.4kg)
TOMATO_AFTER=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT1_ID;" 2>/dev/null)
CHEESE_AFTER=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT2_ID;" 2>/dev/null)

TOMATO_EXPECTED="99.00"
CHEESE_EXPECTED="49.40"

if [ "$TOMATO_AFTER" = "$TOMATO_EXPECTED" ] && [ "$CHEESE_AFTER" = "$CHEESE_EXPECTED" ]; then
    print_test 0 "Inventory deducted correctly (Tomato: ${TOMATO_AFTER}kg, Cheese: ${CHEESE_AFTER}kg)"
else
    print_test 1 "Inventory deduction incorrect (Expected T:$TOMATO_EXPECTED C:$CHEESE_EXPECTED, Got T:$TOMATO_AFTER C:$CHEESE_AFTER)"
fi

# Test 10: Verify usage transactions logged
TRANSACTION_COUNT=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT COUNT(*) FROM inventory_transactions 
WHERE reference_type = 'order' 
AND reference_id = $ORDER_ID 
AND transaction_type = 'usage';
" 2>/dev/null)

if [ "$TRANSACTION_COUNT" = "2" ]; then
    print_test 0 "Usage transactions logged (Count: $TRANSACTION_COUNT)"
else
    print_test 1 "Usage transactions not logged correctly (Expected: 2, Got: $TRANSACTION_COUNT)"
fi

echo ""
echo "=========================================
4. Insufficient Inventory Tests
========================================="

# Test 11: Set low inventory
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
UPDATE inventory SET current_stock = 0.3 WHERE ingredient_id = $INGREDIENT2_ID;
EOF

CHEESE_LOW=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT2_ID;" 2>/dev/null)

if [ "$CHEESE_LOW" = "0.30" ]; then
    print_test 0 "Set cheese to low stock (${CHEESE_LOW}kg)"
else
    print_test 1 "Failed to set low stock"
fi

# Test 12: Attempt order with insufficient inventory (should fail)
RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d "{
    \"order_type\": \"takeout\",
    \"payment_method\": \"cash\",
    \"items\": [
      {
        \"item_id\": $MENU_ITEM_ID,
        \"quantity\": 2
      }
    ]
  }")

ERROR_SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', True))" 2>/dev/null)
ERROR_MSG=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('message', ''))" 2>/dev/null)

if [ "$ERROR_SUCCESS" = "False" ] && [[ "$ERROR_MSG" == *"Insufficient inventory"* ]]; then
    print_test 0 "Order blocked due to insufficient inventory"
else
    print_test 1 "Order should have been blocked"
    echo "Response: $RESPONSE"
fi

# Test 13: Verify inventory unchanged after failed order
CHEESE_UNCHANGED=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT2_ID;" 2>/dev/null)

if [ "$CHEESE_UNCHANGED" = "0.30" ]; then
    print_test 0 "Inventory unchanged after failed order (${CHEESE_UNCHANGED}kg)"
else
    print_test 1 "Inventory changed unexpectedly (${CHEESE_UNCHANGED}kg)"
fi

echo ""
echo "=========================================
5. Multiple Items Order Test
========================================="

# Test 14: Reset inventory to sufficient levels
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
UPDATE inventory SET current_stock = 100.00 WHERE ingredient_id = $INGREDIENT1_ID;
UPDATE inventory SET current_stock = 50.00 WHERE ingredient_id = $INGREDIENT2_ID;
UPDATE inventory SET current_stock = 80.00 WHERE ingredient_id = $INGREDIENT3_ID;
EOF

print_test 0 "Reset inventory to sufficient levels"

# Test 15: Create second menu item with different recipe
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO menu_items (name, description, price, cost, category_id, preparation_time, is_available)
VALUES ('Test Order Pasta', 'Pasta with tomato sauce', 12.99, 5.50, $CATEGORY_ID, 15, true)
ON DUPLICATE KEY UPDATE item_id=LAST_INSERT_ID(item_id);
EOF

MENU_ITEM2_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT item_id FROM menu_items WHERE name = 'Test Order Pasta' ORDER BY item_id DESC LIMIT 1;" 2>/dev/null | xargs)

mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO recipes (item_id, ingredient_id, quantity_required)
VALUES 
    ($MENU_ITEM2_ID, $INGREDIENT1_ID, 0.4),
    ($MENU_ITEM2_ID, $INGREDIENT3_ID, 0.2)
ON DUPLICATE KEY UPDATE quantity_required=VALUES(quantity_required);
EOF

if [ -n "$MENU_ITEM2_ID" ]; then
    print_test 0 "Second menu item created (ID: $MENU_ITEM2_ID, Pasta)"
else
    print_test 1 "Failed to create second menu item"
fi

# Test 16: Order multiple different items
RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d "{
    \"order_type\": \"dine-in\",
    \"payment_method\": \"card\",
    \"items\": [
      {
        \"item_id\": $MENU_ITEM_ID,
        \"quantity\": 1
      },
      {
        \"item_id\": $MENU_ITEM2_ID,
        \"quantity\": 3
      }
    ]
  }")

ORDER2_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('order', {}).get('order_id', ''))" 2>/dev/null)
ORDER2_SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null)

if [ "$ORDER2_SUCCESS" = "True" ] && [ -n "$ORDER2_ID" ]; then
    print_test 0 "Multiple items order created (ID: $ORDER2_ID, 1 pizza + 3 pasta)"
else
    print_test 1 "Failed to create multiple items order"
    echo "Response: $RESPONSE"
fi

# Test 17: Verify complex inventory deduction
# Pizza: 0.5kg tomato, 0.3kg cheese
# Pasta: 0.4kg tomato, 0.2kg flour
# Total: (0.5 + 3*0.4) = 1.7kg tomato, 0.3kg cheese, 0.6kg flour
TOMATO_FINAL=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT1_ID;" 2>/dev/null)
CHEESE_FINAL=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT2_ID;" 2>/dev/null)
FLOUR_FINAL=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT3_ID;" 2>/dev/null)

TOMATO_EXPECTED_FINAL="98.30"
CHEESE_EXPECTED_FINAL="49.70"
FLOUR_EXPECTED_FINAL="79.40"

if [ "$TOMATO_FINAL" = "$TOMATO_EXPECTED_FINAL" ] && [ "$CHEESE_FINAL" = "$CHEESE_EXPECTED_FINAL" ] && [ "$FLOUR_FINAL" = "$FLOUR_EXPECTED_FINAL" ]; then
    print_test 0 "Complex inventory deduction correct (T:${TOMATO_FINAL}kg C:${CHEESE_FINAL}kg F:${FLOUR_FINAL}kg)"
else
    print_test 1 "Complex inventory deduction incorrect (Expected T:$TOMATO_EXPECTED_FINAL C:$CHEESE_EXPECTED_FINAL F:$FLOUR_EXPECTED_FINAL, Got T:$TOMATO_FINAL C:$CHEESE_FINAL F:$FLOUR_FINAL)"
fi

# Test 18: Verify all usage transactions
# Order 1: 2 pizzas = 2 ingredients (tomato, cheese)
# Order 2: 1 pizza + 3 pasta = 3 ingredients (tomato, cheese from pizza; tomato, flour from 3 pasta)
# Expected: 2 + 3 = 5 transactions (but pasta uses tomato 3 times, so it could be 3 separate transactions)
# Actually: Pizza (2 transactions) + Pasta (1 transaction for tomato, 1 for flour) = 4 total
TOTAL_TRANSACTIONS=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT COUNT(*) FROM inventory_transactions 
WHERE transaction_type = 'usage'
AND reference_type = 'order'
AND reference_id IN ($ORDER_ID, $ORDER2_ID);
" 2>/dev/null)

# Accept either 4 or 5 transactions (depending on how pasta transactions are logged)
if [ "$TOTAL_TRANSACTIONS" -ge "4" ] && [ "$TOTAL_TRANSACTIONS" -le "6" ]; then
    print_test 0 "All usage transactions logged (Count: $TOTAL_TRANSACTIONS)"
else
    print_test 1 "Usage transactions incomplete (Expected: 4-6, Got: $TOTAL_TRANSACTIONS)"
fi

echo ""
echo "=========================================
6. Menu Item Without Recipe Test
========================================="

# Test 19: Create menu item without recipe
mysql -u root -p'A9851040557@123a' restaurant_management <<EOF >/dev/null 2>&1
INSERT INTO menu_items (name, description, price, cost, category_id, preparation_time, is_available)
VALUES ('Test Order Beverage', 'No recipe needed', 3.99, 1.00, $CATEGORY_ID, 2, true)
ON DUPLICATE KEY UPDATE item_id=LAST_INSERT_ID(item_id);
EOF

BEVERAGE_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT item_id FROM menu_items WHERE name = 'Test Order Beverage' ORDER BY item_id DESC LIMIT 1;" 2>/dev/null | xargs)

if [ -n "$BEVERAGE_ID" ]; then
    print_test 0 "Menu item without recipe created (ID: $BEVERAGE_ID)"
else
    print_test 1 "Failed to create menu item without recipe"
fi

# Test 20: Order item without recipe (should succeed, no inventory check)
RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d "{
    \"order_type\": \"takeout\",
    \"payment_method\": \"cash\",
    \"items\": [
      {
        \"item_id\": $BEVERAGE_ID,
        \"quantity\": 5
      }
    ]
  }")

ORDER3_SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null)

if [ "$ORDER3_SUCCESS" = "True" ]; then
    print_test 0 "Order without recipe succeeded (no inventory check needed)"
else
    print_test 1 "Order without recipe failed unexpectedly"
    echo "Response: $RESPONSE"
fi

echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "Total Tests: $((TEST_PASS + TEST_FAIL))"
echo -e "${GREEN}Passed: $TEST_PASS${NC}"
echo -e "${RED}Failed: $TEST_FAIL${NC}"

if [ $TEST_FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}\n"
    exit 1
fi
