#!/bin/bash

# API Endpoint Validation Script
# Tests all backend endpoints and validates HTTP status codes
# Valid: 200-299 | Invalid: 400, 401, 403, 404, 500+

API_BASE="http://localhost:5001/api/v1"
TOKEN=""
PASSED=0
FAILED=0
RESULTS_FILE="api_test_results.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Clear previous results
> $RESULTS_FILE

echo "======================================" | tee -a $RESULTS_FILE
echo "API ENDPOINT VALIDATION TEST" | tee -a $RESULTS_FILE
echo "Started: $(date)" | tee -a $RESULTS_FILE
echo "======================================" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local auth_required=$5
    
    local url="${API_BASE}${endpoint}"
    local headers=""
    
    if [ "$auth_required" = "true" ] && [ -n "$TOKEN" ]; then
        headers="-H \"Authorization: Bearer $TOKEN\""
    fi
    
    if [ -n "$data" ]; then
        response=$(eval curl -s -w "\\n%{http_code}" -X $method "$url" $headers $data)
    else
        response=$(eval curl -s -w "\\n%{http_code}" -X $method "$url" $headers)
    fi
    
    # Extract status code (last line) and body (everything before last line)
    status_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')
    
    # Validate status code
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        echo -e "${GREEN}✓ PASS${NC} [$status_code] $method $endpoint - $description" | tee -a $RESULTS_FILE
        echo "  Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body | head -c 100)" | tee -a $RESULTS_FILE
        ((PASSED++))
    elif [[ $status_code -eq 400 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] $method $endpoint - BAD REQUEST - $description" | tee -a $RESULTS_FILE
        echo "  Error: $(echo $body | jq -r '.message // .error // .' 2>/dev/null || echo $body)" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -eq 401 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] $method $endpoint - UNAUTHORIZED - $description" | tee -a $RESULTS_FILE
        echo "  Error: $(echo $body | jq -r '.message // .error // .' 2>/dev/null || echo $body)" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -eq 403 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] $method $endpoint - FORBIDDEN - $description" | tee -a $RESULTS_FILE
        echo "  Error: $(echo $body | jq -r '.message // .error // .' 2>/dev/null || echo $body)" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -eq 404 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] $method $endpoint - NOT FOUND - $description" | tee -a $RESULTS_FILE
        echo "  Error: $(echo $body | jq -r '.message // .error // .' 2>/dev/null || echo $body)" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -ge 500 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] $method $endpoint - SERVER ERROR - $description" | tee -a $RESULTS_FILE
        echo "  Error: $(echo $body | jq -r '.message // .error // .' 2>/dev/null || echo $body)" | tee -a $RESULTS_FILE
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠ WARN${NC} [$status_code] $method $endpoint - UNEXPECTED CODE - $description" | tee -a $RESULTS_FILE
        echo "  Response: $(echo $body | head -c 100)" | tee -a $RESULTS_FILE
        ((FAILED++))
    fi
    echo "" | tee -a $RESULTS_FILE
    
    sleep 0.1
}

# 1. Health Check
echo "=== HEALTH CHECK ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/health" "" "Server health check" "false"

# 2. Authentication Tests
echo "=== AUTHENTICATION ===" | tee -a $RESULTS_FILE
test_endpoint "POST" "/auth/login" '{"identifier":"admin","password":"admin123"}' "Login with valid credentials" "false"

# Extract token from last successful login
TOKEN=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin123"}' | jq -r '.data.tokens.accessToken')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✓ Token obtained successfully" | tee -a $RESULTS_FILE
else
    echo "✗ Failed to obtain authentication token" | tee -a $RESULTS_FILE
fi
echo "" | tee -a $RESULTS_FILE

test_endpoint "POST" "/auth/login" '{"identifier":"invalid","password":"wrong"}' "Login with invalid credentials (should fail)" "false"
test_endpoint "GET" "/auth/profile" "" "Get user profile (authenticated)" "true"

# 3. Categories
echo "=== CATEGORIES ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/categories" "" "Get all categories" "true"
test_endpoint "POST" "/categories" '{"name":"Test Category","description":"Test"}' "Create category" "true"
test_endpoint "GET" "/categories/1" "" "Get category by ID" "true"
test_endpoint "GET" "/categories/9999" "" "Get non-existent category (should fail)" "true"

# 4. Menu Items
echo "=== MENU ITEMS ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/menu-items" "" "Get all menu items" "true"
test_endpoint "GET" "/menu-items/search?q=test" "" "Search menu items" "true"
test_endpoint "GET" "/menu-items/1" "" "Get menu item by ID" "true"
test_endpoint "GET" "/menu-items/9999" "" "Get non-existent menu item (should fail)" "true"

# 5. Tables
echo "=== TABLES ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/tables" "" "Get all tables" "true"
test_endpoint "GET" "/tables/stats" "" "Get table statistics" "true"
test_endpoint "GET" "/tables/available" "" "Get available tables" "true"
test_endpoint "GET" "/tables/1" "" "Get table by ID" "true"

# 6. Reservations
echo "=== RESERVATIONS ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/reservations" "" "Get all reservations" "true"
test_endpoint "GET" "/reservations/stats" "" "Get reservation statistics" "true"
test_endpoint "GET" "/reservations/upcoming" "" "Get upcoming reservations" "true"

# 7. Orders
echo "=== ORDERS ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/orders" "" "Get all orders" "true"
test_endpoint "GET" "/orders/1" "" "Get order by ID" "true"

# 8. Inventory
echo "=== INVENTORY ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/inventory" "" "Get all inventory" "true"
test_endpoint "GET" "/inventory/low-stock" "" "Get low stock items" "true"

# 9. Suppliers
echo "=== SUPPLIERS ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/suppliers" "" "Get all suppliers" "true"

# 10. Purchase Orders
echo "=== PURCHASE ORDERS ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/purchase-orders" "" "Get all purchase orders" "true"
test_endpoint "GET" "/purchase-orders/statistics" "" "Get PO statistics" "true"

# 11. Analytics
echo "=== ANALYTICS ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/analytics/dashboard" "" "Get dashboard analytics" "true"
test_endpoint "GET" "/analytics/sales/overview" "" "Get sales overview" "true"
test_endpoint "GET" "/analytics/inventory" "" "Get inventory analytics" "true"

# 12. Reports (alias)
echo "=== REPORTS ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/reports/dashboard" "" "Get dashboard via reports alias" "true"

# 13. Branches (stub)
echo "=== BRANCHES ===" | tee -a $RESULTS_FILE
test_endpoint "GET" "/branches" "" "Get branches (stub endpoint)" "true"

# 14. Unauthorized Access Tests
echo "=== UNAUTHORIZED ACCESS TESTS ===" | tee -a $RESULTS_FILE
TOKEN=""  # Clear token
test_endpoint "GET" "/menu-items" "" "Access protected endpoint without auth (should fail)" "false"
test_endpoint "GET" "/orders" "" "Access orders without auth (should fail)" "false"

# Summary
echo "" | tee -a $RESULTS_FILE
echo "======================================" | tee -a $RESULTS_FILE
echo "TEST SUMMARY" | tee -a $RESULTS_FILE
echo "======================================" | tee -a $RESULTS_FILE
echo "Total Passed: ${GREEN}$PASSED${NC}" | tee -a $RESULTS_FILE
echo "Total Failed: ${RED}$FAILED${NC}" | tee -a $RESULTS_FILE
echo "Total Tests: $((PASSED + FAILED))" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}" | tee -a $RESULTS_FILE
    echo "Status Code Validation: All endpoints returned valid 200-299 responses" | tee -a $RESULTS_FILE
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}" | tee -a $RESULTS_FILE
    echo "Review failed tests above for details on 400, 401, 403, 404, or 500+ errors" | tee -a $RESULTS_FILE
fi

echo "" | tee -a $RESULTS_FILE
echo "Completed: $(date)" | tee -a $RESULTS_FILE
echo "Full results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE

exit $FAILED
