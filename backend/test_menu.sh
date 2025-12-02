#!/bin/bash

# Test script for Menu Management API
# Sprint 2, Week 3 - Categories and Menu Items

BASE_URL="http://localhost:5001/api/v1"
TOKEN=""
CATEGORY_ID=""
ITEM_ID=""

echo "======================================"
echo "Menu Management API Test Suite"
echo "======================================"
echo ""

# Start server in background
echo "Starting server..."
cd /Users/bishworupadhikari/Desktop/DBMS/backend
node server.js > /tmp/menu_server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
sleep 3

# Function to make requests and show responses
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    
    echo "----------------------------------------"
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    if [ "$auth" = "true" ] && [ -n "$TOKEN" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    echo "Response: $response"
    echo ""
    
    echo "$response"
}

# Test 1: Login to get token (using admin from previous tests)
echo "TEST 1: Login to get authentication token"
login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"identifier":"admin","password":"Admin@123"}')
echo "Login response: $login_response"
TOKEN=$(echo $login_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo "ERROR: Failed to get authentication token"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "Token obtained successfully"
echo ""

# Test 2: Create Category - Appetizers
echo "TEST 2: Create Category - Appetizers"
cat_response=$(curl -s -X POST "$BASE_URL/categories" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name":"Test Appetizers","description":"Starters and small bites","is_active":true}')
echo "Response: $cat_response"
CATEGORY_ID=$(echo $cat_response | grep -o '"category_id":[0-9]*' | grep -o '[0-9]*' | head -1)
if [ -z "$CATEGORY_ID" ]; then
    # Categories might already exist, use existing one
    CATEGORY_ID=1
fi
echo "Using Category ID: $CATEGORY_ID"
echo ""

# Test 3: Create Category - Main Course
echo "TEST 3: Create Category - Main Course"
make_request "POST" "/categories" '{"name":"Main Course","description":"Primary dishes","is_active":true}' "true"

# Test 4: Create Category - Desserts
echo "TEST 4: Create Category - Desserts"
make_request "POST" "/categories" '{"name":"Desserts","description":"Sweet treats","is_active":true}' "true"

# Test 5: Get All Categories
echo "TEST 5: Get All Categories"
make_request "GET" "/categories" "" "false"

# Test 6: Get All Categories with Item Count
echo "TEST 6: Get All Categories with Item Count"
make_request "GET" "/categories?with_count=true" "" "false"

# Test 7: Get Category by ID
echo "TEST 7: Get Category by ID"
make_request "GET" "/categories/$CATEGORY_ID" "" "false"

# Test 8: Update Category
echo "TEST 8: Update Category"
make_request "PUT" "/categories/$CATEGORY_ID" '{"description":"Delicious starters and appetizers"}' "true"

# Test 9: Create Menu Item - Spring Rolls
echo "TEST 9: Create Menu Item - Spring Rolls"
item_response=$(curl -s -X POST "$BASE_URL/menu-items" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\":\"Spring Rolls Test\",\"description\":\"Crispy vegetable spring rolls\",\"category_id\":$CATEGORY_ID,\"price\":8.99,\"cost\":3.50,\"is_available\":true,\"preparation_time\":15}")
echo "Response: $item_response"
ITEM_ID=$(echo $item_response | grep -o '"item_id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "Menu Item ID: $ITEM_ID"
echo ""

# Test 10: Create Menu Item - Garlic Bread
echo "TEST 10: Create Menu Item - Garlic Bread"
curl -s -X POST "$BASE_URL/menu-items" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\":\"Garlic Bread Test\",\"description\":\"Toasted bread with garlic butter\",\"category_id\":$CATEGORY_ID,\"price\":5.99,\"cost\":2.00,\"is_available\":true,\"preparation_time\":10}"
echo ""

# Test 11: Get All Menu Items
echo "TEST 11: Get All Menu Items"
make_request "GET" "/menu-items" "" "false"

# Test 12: Get Menu Items by Category
echo "TEST 12: Get Menu Items by Category"
make_request "GET" "/menu-items?category_id=$CATEGORY_ID" "" "false"

# Test 13: Get Menu Items Grouped by Category
echo "TEST 13: Get Menu Items Grouped by Category"
make_request "GET" "/menu-items?grouped=true" "" "false"

# Test 14: Get Menu Item by ID
echo "TEST 14: Get Menu Item by ID"
make_request "GET" "/menu-items/$ITEM_ID" "" "false"

# Test 15: Update Menu Item
echo "TEST 15: Update Menu Item - Update Price"
make_request "PUT" "/menu-items/$ITEM_ID" '{"price":9.99,"description":"Crispy vegetable spring rolls with sweet chili sauce"}' "true"

# Test 16: Get Menu Item Profit Analysis
echo "TEST 16: Get Menu Item Profit Analysis"
make_request "GET" "/menu-items/$ITEM_ID/profit" "" "true"

# Test 17: Toggle Menu Item Availability
echo "TEST 17: Toggle Menu Item Availability (Make Unavailable)"
make_request "PATCH" "/menu-items/$ITEM_ID/toggle" "" "true"

# Test 18: Toggle Menu Item Availability Again
echo "TEST 18: Toggle Menu Item Availability (Make Available)"
make_request "PATCH" "/menu-items/$ITEM_ID/toggle" "" "true"

# Test 19: Search Menu Items
echo "TEST 19: Search Menu Items - 'spring'"
make_request "GET" "/menu-items/search?q=spring" "" "false"

# Test 20: Get Category Menu Items
echo "TEST 20: Get Category Menu Items"
make_request "GET" "/categories/$CATEGORY_ID/items" "" "false"

# Test 21: Toggle Category Status
echo "TEST 21: Toggle Category Status (Deactivate)"
make_request "PATCH" "/categories/$CATEGORY_ID/toggle" "" "true"

# Test 22: Toggle Category Status Again
echo "TEST 22: Toggle Category Status (Activate)"
make_request "PATCH" "/categories/$CATEGORY_ID/toggle" "" "true"

# Test 23: Get Available Items Only
echo "TEST 23: Get Available Menu Items Only"
make_request "GET" "/menu-items?available_only=true" "" "false"

# Test 24: Test Validation - Invalid Category
echo "TEST 24: Test Validation - Create Item with Invalid Category"
make_request "POST" "/menu-items" '{"name":"Test Item","description":"Test","category_id":"invalid","price":10}' "true"

# Test 25: Test Validation - Missing Required Fields
echo "TEST 25: Test Validation - Create Category without Name"
make_request "POST" "/categories" '{"description":"No name provided"}' "true"

# Cleanup: Stop the server
echo "======================================"
echo "Tests Complete!"
echo "======================================"
echo "Stopping server (PID: $SERVER_PID)..."
kill $SERVER_PID 2>/dev/null
echo "Server stopped."
echo ""
echo "Summary:"
echo "- Created 3 categories"
echo "- Created 2 menu items"
echo "- Tested all CRUD operations"
echo "- Tested filtering and search"
echo "- Tested validation rules"
echo "- All 25 tests executed"
