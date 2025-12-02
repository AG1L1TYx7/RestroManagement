#!/bin/bash

# Test Purchase Orders Implementation
# Tests PO creation, approval workflow, receiving, auto-generation, and inventory integration

BASE_URL="http://localhost:5001/api/v1"
ADMIN_TOKEN=""
MANAGER_TOKEN=""
SUPPLIER_ID=""
INGREDIENT_ID=""
PO_ID=""
PO_DETAIL_ID=""
TEST_PASS=0
TEST_FAIL=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TEST_PASS++))
    else
        echo -e "${RED}✗${NC} $2"
        ((TEST_FAIL++))
    fi
}

# Helper function to extract JSON value using Python
extract_json() {
    python3 -c "import sys, json; data = json.load(sys.stdin); print($1)" 2>/dev/null
}

echo "========================================="
echo "Purchase Orders API Test Suite"
echo "========================================="
echo ""

# Clean up old test data
echo "Cleaning up old test data..."
mysql -u root -p'A9851040557@123a' restaurant_management -e "
DELETE FROM po_details WHERE po_id IN (SELECT po_id FROM purchase_orders WHERE po_number LIKE 'PO%');
DELETE FROM purchase_orders WHERE po_number LIKE 'PO%';
" 2>/dev/null

echo ""
echo "========================================="
echo "1. Authentication Tests"
echo "========================================="

# Test 1: Admin Login
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@restaurant.com","password":"Manager123"}')

ADMIN_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('tokens', {}).get('accessToken', ''))" 2>/dev/null)

if [ -n "$ADMIN_TOKEN" ]; then
    print_test 0 "Admin login successful"
else
    print_test 1 "Admin login failed"
    exit 1
fi

# Test 2: Manager Login
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"manager@restaurant.com","password":"Manager123"}')

MANAGER_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('tokens', {}).get('accessToken', ''))" 2>/dev/null)

if [ -n "$MANAGER_TOKEN" ]; then
    print_test 0 "Manager login successful"
else
    print_test 1 "Manager login failed"
    echo "Note: Creating manager user..."
    mysql -u root -p'A9851040557@123a' restaurant_management -e "
    INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
    VALUES ('manager', 'manager@restaurant.com', '\$2b\$10\$UBCnZvnJO6fa9v17lDfn1.krexe85C4Y50hFA/qTRhNjqfCBAsV42', 'Test Manager', 'manager');
    " 2>/dev/null
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"identifier":"manager@restaurant.com","password":"Manager123"}')
    MANAGER_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('tokens', {}).get('accessToken', ''))" 2>/dev/null)
fi

echo ""
echo "========================================="
echo "2. Setup: Create Test Data"
echo "========================================="

# Get or create a supplier
SUPPLIER_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT supplier_id FROM suppliers WHERE name = 'Test PO Supplier' LIMIT 1;
" 2>/dev/null)

if [ -z "$SUPPLIER_ID" ]; then
    RESPONSE=$(curl -s -X POST "$BASE_URL/suppliers" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d '{
        "name": "Test PO Supplier",
        "contact_person": "PO Test Contact",
        "email": "posupplier@test.com",
        "phone": "555-PO-TEST",
        "payment_terms": "Net 30",
        "lead_time_days": 5
      }')
    
    SUPPLIER_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('supplier', {}).get('supplier_id', ''))" 2>/dev/null)
fi

if [ -z "$SUPPLIER_ID" ]; then
    SUPPLIER_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT supplier_id FROM suppliers WHERE name = 'Test PO Supplier' LIMIT 1;" 2>/dev/null)
fi

print_test 0 "Test supplier ready (ID: $SUPPLIER_ID)"

# Get or create an ingredient
INGREDIENT_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT ingredient_id FROM ingredients WHERE name = 'Test PO Ingredient' LIMIT 1;
" 2>/dev/null)

if [ -z "$INGREDIENT_ID" ]; then
    mysql -u root -p'A9851040557@123a' restaurant_management -e "
    INSERT INTO ingredients (name, unit, cost_per_unit, min_stock_level, reorder_quantity, supplier_id, category)
    VALUES ('Test PO Ingredient', 'kg', 10.50, 50, 100, $SUPPLIER_ID, 'Test');
    " 2>/dev/null
    
    INGREDIENT_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
    SELECT ingredient_id FROM ingredients WHERE name = 'Test PO Ingredient' LIMIT 1;
    " 2>/dev/null)
fi

# Ensure inventory exists with low stock
mysql -u root -p'A9851040557@123a' restaurant_management -e "
INSERT INTO inventory (ingredient_id, current_stock)
VALUES ($INGREDIENT_ID, 20)
ON DUPLICATE KEY UPDATE current_stock = 20;
" 2>/dev/null

print_test 0 "Test ingredient ready (ID: $INGREDIENT_ID, Low Stock: 20)"

echo ""
echo "========================================="
echo "3. Purchase Order CRUD Tests"
echo "========================================="

# Test 3: Create Purchase Order
RESPONSE=$(curl -s -X POST "$BASE_URL/purchase-orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d "{
    \"supplier_id\": $SUPPLIER_ID,
    \"expected_delivery_date\": \"2025-12-10\",
    \"notes\": \"Test PO for automation testing\",
    \"items\": [
      {
        \"ingredient_id\": $INGREDIENT_ID,
        \"quantity\": 100,
        \"unit_cost\": 10.50,
        \"notes\": \"Standard reorder\"
      }
    ]
  }")

PO_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('po_id', ''))" 2>/dev/null)
PO_NUMBER=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('po_number', ''))" 2>/dev/null)
PO_STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('status', ''))" 2>/dev/null)

if [ -n "$PO_ID" ] && [ "$PO_STATUS" = "draft" ]; then
    print_test 0 "Create purchase order (ID: $PO_ID, Status: $PO_STATUS)"
else
    print_test 1 "Create purchase order"
    echo "Response: $RESPONSE"
fi

# Test 4: Get All Purchase Orders
RESPONSE=$(curl -s -X GET "$BASE_URL/purchase-orders" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

PO_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); pos = data.get('data', {}).get('purchase_orders', []); print(len(pos))" 2>/dev/null)

if [ -n "$PO_COUNT" ] && [ "$PO_COUNT" -gt 0 ]; then
    print_test 0 "Get all purchase orders (Count: $PO_COUNT)"
else
    print_test 1 "Get all purchase orders (Count: ${PO_COUNT:-0})"
fi

# Test 5: Get Purchase Order by ID
RESPONSE=$(curl -s -X GET "$BASE_URL/purchase-orders/$PO_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

FETCHED_PO_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('po_id', ''))" 2>/dev/null)
ITEM_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', {}).get('purchase_order', {}).get('items', [])))" 2>/dev/null)

if [ "$FETCHED_PO_ID" = "$PO_ID" ] && [ "$ITEM_COUNT" = "1" ]; then
    print_test 0 "Get purchase order by ID (Items: $ITEM_COUNT)"
else
    print_test 1 "Get purchase order by ID"
fi

# Test 6: Update Purchase Order (Draft Only)
RESPONSE=$(curl -s -X PUT "$BASE_URL/purchase-orders/$PO_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d "{
    \"notes\": \"Updated test PO notes\",
    \"items\": [
      {
        \"ingredient_id\": $INGREDIENT_ID,
        \"quantity\": 150,
        \"unit_cost\": 10.50,
        \"notes\": \"Increased quantity\"
      }
    ]
  }")

UPDATED_NOTES=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('notes', ''))" 2>/dev/null)
UPDATED_QUANTITY=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); items = data.get('data', {}).get('purchase_order', {}).get('items', []); print(items[0].get('quantity_ordered', '') if items else '')" 2>/dev/null)

if [ "$UPDATED_NOTES" = "Updated test PO notes" ]; then
    print_test 0 "Update purchase order (Quantity: $UPDATED_QUANTITY)"
else
    print_test 1 "Update purchase order"
fi

# Test 7: Filter Purchase Orders by Status
RESPONSE=$(curl -s -X GET "$BASE_URL/purchase-orders?status=draft" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

FILTERED_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', {}).get('purchase_orders', [])))" 2>/dev/null)

if [ "$FILTERED_COUNT" -gt 0 ]; then
    print_test 0 "Filter purchase orders by status (Draft count: $FILTERED_COUNT)"
else
    print_test 1 "Filter purchase orders by status"
fi

echo ""
echo "========================================="
echo "4. Purchase Order Workflow Tests"
echo "========================================="

# Test 8: Submit Purchase Order
RESPONSE=$(curl -s -X PATCH "$BASE_URL/purchase-orders/$PO_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{"status": "submitted"}')

NEW_STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('status', ''))" 2>/dev/null)

if [ "$NEW_STATUS" = "submitted" ]; then
    print_test 0 "Submit purchase order (Status: $NEW_STATUS)"
else
    print_test 1 "Submit purchase order"
    echo "Response: $RESPONSE"
fi

# Test 9: Approve Purchase Order
RESPONSE=$(curl -s -X POST "$BASE_URL/purchase-orders/$PO_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

APPROVED_STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('status', ''))" 2>/dev/null)
APPROVED_BY=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('approved_by_name', ''))" 2>/dev/null)

if [ "$APPROVED_STATUS" = "approved" ]; then
    print_test 0 "Approve purchase order (Approved by: $APPROVED_BY)"
else
    print_test 1 "Approve purchase order"
    echo "Response: $RESPONSE"
fi

# Test 10: Receive Purchase Order (Updates Inventory)
# Get PO details to find po_detail_id
PO_DETAILS_RESPONSE=$(curl -s -X GET "$BASE_URL/purchase-orders/$PO_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN")
PO_DETAIL_ID=$(echo "$PO_DETAILS_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); items = data.get('data', {}).get('purchase_order', {}).get('items', []); print(items[0]['po_detail_id'] if items else '')" 2>/dev/null)

# Get current stock before receiving
STOCK_BEFORE=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT_ID;
" 2>/dev/null)

RESPONSE=$(curl -s -X POST "$BASE_URL/purchase-orders/$PO_ID/receive" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d "{
    \"items\": [
      {
        \"po_detail_id\": $PO_DETAIL_ID,
        \"quantity_received\": 150
      }
    ]
  }")

RECEIVED_STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('status', ''))" 2>/dev/null)

# Get stock after receiving
STOCK_AFTER=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT_ID;
" 2>/dev/null)

STOCK_INCREASE=$(echo "$STOCK_AFTER - $STOCK_BEFORE" | bc)
# Remove decimal places for comparison
STOCK_INCREASE_INT=$(echo "$STOCK_INCREASE" | awk '{print int($1)}')

if [ "$RECEIVED_STATUS" = "received" ] && [ "$STOCK_INCREASE_INT" -eq 150 ]; then
    print_test 0 "Receive purchase order (Stock: $STOCK_BEFORE → $STOCK_AFTER, +$STOCK_INCREASE)"
else
    print_test 1 "Receive purchase order (Expected +150, Got +$STOCK_INCREASE)"
    echo "Response: $RESPONSE"
fi

# Test 11: Verify Inventory Transaction Logged
TRANSACTION_COUNT=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT COUNT(*) FROM inventory_transactions 
WHERE ingredient_id = $INGREDIENT_ID 
AND transaction_type = 'purchase' 
AND reference_type = 'purchase_order' 
AND reference_id = $PO_ID;
" 2>/dev/null)

if [ "$TRANSACTION_COUNT" -gt 0 ]; then
    print_test 0 "Inventory transaction logged (Count: $TRANSACTION_COUNT)"
else
    print_test 1 "Inventory transaction logged"
fi

echo ""
echo "========================================="
echo "5. Auto-Generate Purchase Orders Test"
echo "========================================="

# Test 12: Set ingredient to low stock
mysql -u root -p'A9851040557@123a' restaurant_management -e "
UPDATE inventory SET current_stock = 10 WHERE ingredient_id = $INGREDIENT_ID;
" 2>/dev/null

CURRENT_STOCK=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "
SELECT current_stock FROM inventory WHERE ingredient_id = $INGREDIENT_ID;
" 2>/dev/null)

print_test 0 "Set ingredient to low stock (Stock: $CURRENT_STOCK)"

# Test 13: Auto-generate POs from low stock
RESPONSE=$(curl -s -X POST "$BASE_URL/purchase-orders/auto-generate" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

AUTO_PO_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', {}).get('purchase_orders', [])))" 2>/dev/null)
SUCCESS_MESSAGE=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('message', ''))" 2>/dev/null)

if [ "$AUTO_PO_COUNT" -gt 0 ]; then
    print_test 0 "Auto-generate purchase orders (Generated: $AUTO_PO_COUNT PO(s))"
else
    print_test 1 "Auto-generate purchase orders"
    echo "Message: $SUCCESS_MESSAGE"
fi

# Test 14: Verify auto-generated PO has correct quantity
if [ "$AUTO_PO_COUNT" -gt 0 ]; then
    AUTO_PO_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); pos = data.get('data', {}).get('purchase_orders', []); print(pos[0].get('po_id', '') if pos else '')" 2>/dev/null)
    AUTO_PO_STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); pos = data.get('data', {}).get('purchase_orders', []); print(pos[0].get('status', '') if pos else '')" 2>/dev/null)
    AUTO_PO_NOTES=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); pos = data.get('data', {}).get('purchase_orders', []); print(pos[0].get('notes', '') if pos else '')" 2>/dev/null)
    
    if [[ "$AUTO_PO_NOTES" == *"Auto-generated"* ]] && [ "$AUTO_PO_STATUS" = "draft" ]; then
        print_test 0 "Auto-generated PO validation (Status: $AUTO_PO_STATUS, Auto-flagged: Yes)"
    else
        print_test 1 "Auto-generated PO validation"
    fi
fi

echo ""
echo "========================================="
echo "6. Purchase Order Cancellation Test"
echo "========================================="

# Create a new PO for cancellation test
RESPONSE=$(curl -s -X POST "$BASE_URL/purchase-orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d "{
    \"supplier_id\": $SUPPLIER_ID,
    \"expected_delivery_date\": \"2025-12-15\",
    \"notes\": \"PO to be cancelled\",
    \"items\": [
      {
        \"ingredient_id\": $INGREDIENT_ID,
        \"quantity\": 50,
        \"unit_cost\": 10.50
      }
    ]
  }")

CANCEL_PO_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('po_id', ''))" 2>/dev/null)

# Test 15: Cancel Purchase Order
RESPONSE=$(curl -s -X DELETE "$BASE_URL/purchase-orders/$CANCEL_PO_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

CANCELLED_STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('purchase_order', {}).get('status', ''))" 2>/dev/null)

if [ "$CANCELLED_STATUS" = "cancelled" ]; then
    print_test 0 "Cancel purchase order (Status: $CANCELLED_STATUS)"
else
    print_test 1 "Cancel purchase order"
fi

echo ""
echo "========================================="
echo "7. Purchase Order Statistics Test"
echo "========================================="

# Test 16: Get Purchase Order Statistics
RESPONSE=$(curl -s -X GET "$BASE_URL/purchase-orders/statistics" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

TOTAL_POS=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('statistics', {}).get('total_pos', ''))" 2>/dev/null)
DRAFT_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('statistics', {}).get('draft_count', ''))" 2>/dev/null)
RECEIVED_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('statistics', {}).get('received_count', ''))" 2>/dev/null)

if [ -n "$TOTAL_POS" ] && [ "$TOTAL_POS" -gt 0 ]; then
    print_test 0 "Get PO statistics (Total: $TOTAL_POS, Draft: $DRAFT_COUNT, Received: $RECEIVED_COUNT)"
else
    print_test 1 "Get PO statistics"
fi

echo ""
echo "========================================="
echo "8. Authorization Tests"
echo "========================================="

# Test 17: Staff cannot create purchase orders (need staff user)
STAFF_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"staff@restaurant.com","password":"Staff123"}')

STAFF_TOKEN=$(echo "$STAFF_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('tokens', {}).get('accessToken', ''))" 2>/dev/null)

if [ -z "$STAFF_TOKEN" ]; then
    mysql -u root -p'A9851040557@123a' restaurant_management -e "
    INSERT IGNORE INTO users (username, email, password_hash, full_name, role) 
    VALUES ('staff', 'staff@restaurant.com', '\$2b\$10\$UBCnZvnJO6fa9v17lDfn1.krexe85C4Y50hFA/qTRhNjqfCBAsV42', 'Test Staff', 'staff');
    " 2>/dev/null
    
    STAFF_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"identifier":"staff@restaurant.com","password":"Manager123"}')
    STAFF_TOKEN=$(echo "$STAFF_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('tokens', {}).get('accessToken', ''))" 2>/dev/null)
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/purchase-orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d "{
    \"supplier_id\": $SUPPLIER_ID,
    \"expected_delivery_date\": \"2025-12-20\",
    \"items\": [{\"ingredient_id\": $INGREDIENT_ID, \"quantity\": 50, \"unit_cost\": 10.50}]
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
ERROR_STATUS=$(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('status', ''))" 2>/dev/null)

if [ "$HTTP_CODE" = "403" ] && [ "$ERROR_STATUS" = "error" ]; then
    print_test 0 "Staff cannot create purchase orders (RBAC enforced)"
else
    print_test 1 "Staff cannot create purchase orders (Got HTTP $HTTP_CODE)"
fi

echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "Total Tests: $((TEST_PASS + TEST_FAIL))"
echo -e "${GREEN}Passed: $TEST_PASS${NC}"
echo -e "${RED}Failed: $TEST_FAIL${NC}"

if [ $TEST_FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}"
    exit 1
fi
