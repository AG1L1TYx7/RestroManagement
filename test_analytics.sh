#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5001/api/v1"

# Counters
PASSED=0
FAILED=0

# Test result function
check_response() {
    if [ $1 -eq $2 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $3"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $3 (Expected: $2, Got: $1)"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "ANALYTICS & REPORTING API TEST SUITE"
echo "=========================================="
echo ""

# Step 1: Login as Manager
echo "1. Logging in as Manager..."
MANAGER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "identifier": "manager@restaurant.com",
        "password": "Manager123"
    }')

MANAGER_TOKEN=$(echo $MANAGER_LOGIN | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

if [ -z "$MANAGER_TOKEN" ]; then
    echo -e "${RED}Failed to get manager token${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Manager logged in successfully${NC}"
echo ""

# Step 2: Login as Staff (for RBAC testing)
echo "2. Logging in as Staff (for RBAC testing)..."
STAFF_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "identifier": "staff@restaurant.com",
        "password": "Manager123"
    }')

STAFF_TOKEN=$(echo $STAFF_LOGIN | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

if [ -z "$STAFF_TOKEN" ]; then
    echo -e "${RED}Failed to get staff token${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Staff logged in successfully${NC}"
echo ""

# ===========================================
# DASHBOARD ANALYTICS TESTS
# ===========================================
echo "=========================================="
echo "DASHBOARD ANALYTICS TESTS"
echo "=========================================="

# Test 3: Get Dashboard (Manager)
echo "3. Testing: Get Dashboard (Manager Access)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/dashboard" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get dashboard as manager"
echo "Response: $BODY" | head -c 200
echo ""

# Test 4: Get Dashboard with Date Filter
echo "4. Testing: Get Dashboard with Date Range"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/dashboard?from_date=2024-01-01&to_date=2024-12-31" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get dashboard with date filter"
echo ""

# Test 5: RBAC - Staff Forbidden
echo "5. Testing: Dashboard Access - Staff (Should be 403 Forbidden)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/dashboard" \
    -H "Authorization: Bearer $STAFF_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 403 "Dashboard access denied for staff"
echo ""

# ===========================================
# SALES ANALYTICS TESTS
# ===========================================
echo "=========================================="
echo "SALES ANALYTICS TESTS"
echo "=========================================="

# Test 6: Get Sales Overview
echo "6. Testing: Get Sales Overview"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/overview" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get sales overview"
echo "Response: $BODY" | head -c 200
echo ""

# Test 7: Get Sales Overview with Date Filter
echo "7. Testing: Sales Overview - Last 30 Days"
FROM_DATE=$(date -u -v-30d +"%Y-%m-%d" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%d")
TO_DATE=$(date -u +"%Y-%m-%d")
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/overview?from_date=$FROM_DATE&to_date=$TO_DATE" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get sales overview (last 30 days)"
echo ""

# Test 8: Get Sales Overview - Dine-In Only
echo "8. Testing: Sales Overview - Dine-In Orders Only"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/overview?order_type=dine-in" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get sales overview (dine-in only)"
echo ""

# Test 9: Get Top Selling Items
echo "9. Testing: Get Top Selling Items (Default Limit 10)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/top-items" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get top selling items"
echo "Response: $BODY" | head -c 200
echo ""

# Test 10: Get Top 5 Selling Items
echo "10. Testing: Get Top 5 Selling Items"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/top-items?limit=5" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get top 5 selling items"
echo ""

# Test 11: Get Category Performance
echo "11. Testing: Get Category Performance"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/categories" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get category performance"
echo "Response: $BODY" | head -c 200
echo ""

# Test 12: RBAC - Top Items (Staff Forbidden)
echo "12. Testing: Top Items Access - Staff (Should be 403)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/top-items" \
    -H "Authorization: Bearer $STAFF_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 403 "Top items access denied for staff"
echo ""

# ===========================================
# INVENTORY ANALYTICS TESTS
# ===========================================
echo "=========================================="
echo "INVENTORY ANALYTICS TESTS"
echo "=========================================="

# Test 13: Get Inventory Analytics
echo "13. Testing: Get Inventory Analytics"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/inventory" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get inventory analytics"
echo "Response: $BODY" | head -c 300
echo ""

# ===========================================
# STAFF PERFORMANCE TESTS
# ===========================================
echo "=========================================="
echo "STAFF PERFORMANCE TESTS"
echo "=========================================="

# Test 14: Get Staff Performance
echo "14. Testing: Get Staff Performance"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/staff" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get staff performance"
echo "Response: $BODY" | head -c 200
echo ""

# Test 15: Get Staff Performance with Date Filter
echo "15. Testing: Staff Performance - This Month"
FIRST_DAY=$(date -u +"%Y-%m-01")
LAST_DAY=$(date -u +"%Y-%m-%d")
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/staff?from_date=$FIRST_DAY&to_date=$LAST_DAY" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get staff performance (this month)"
echo ""

# ===========================================
# PURCHASE ORDER ANALYTICS TESTS
# ===========================================
echo "=========================================="
echo "PURCHASE ORDER ANALYTICS TESTS"
echo "=========================================="

# Test 16: Get PO Analytics
echo "16. Testing: Get Purchase Order Analytics"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/purchase-orders" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get purchase order analytics"
echo "Response: $BODY" | head -c 300
echo ""

# ===========================================
# REVENUE TREND TESTS
# ===========================================
echo "=========================================="
echo "REVENUE TREND TESTS"
echo "=========================================="

# Test 17: Get Daily Revenue Trend
echo "17. Testing: Get Daily Revenue Trend"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/revenue-trend?period=daily" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get daily revenue trend"
echo "Response: $BODY" | head -c 200
echo ""

# Test 18: Get Weekly Revenue Trend
echo "18. Testing: Get Weekly Revenue Trend"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/revenue-trend?period=weekly" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get weekly revenue trend"
echo ""

# Test 19: Get Monthly Revenue Trend
echo "19. Testing: Get Monthly Revenue Trend"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/revenue-trend?period=monthly" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get monthly revenue trend"
echo ""

# Test 20: Invalid Period (Should return 400)
echo "20. Testing: Invalid Revenue Trend Period (Should be 400)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/revenue-trend?period=yearly" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 400 "Invalid period returns 400"
echo ""

# ===========================================
# PROFIT ANALYSIS TESTS
# ===========================================
echo "=========================================="
echo "PROFIT ANALYSIS TESTS"
echo "=========================================="

# Test 21: Get Profit Analysis
echo "21. Testing: Get Profit Analysis"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/profit" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get profit analysis"
echo "Response: $BODY" | head -c 300
echo ""

# Test 22: Get Profit Analysis with Date Filter
echo "22. Testing: Profit Analysis - Last 90 Days"
FROM_DATE=$(date -u -v-90d +"%Y-%m-%d" 2>/dev/null || date -u -d "90 days ago" +"%Y-%m-%d")
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/profit?from_date=$FROM_DATE&to_date=$TO_DATE" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get profit analysis (last 90 days)"
echo ""

# ===========================================
# COMPREHENSIVE REPORT TESTS
# ===========================================
echo "=========================================="
echo "COMPREHENSIVE REPORT TESTS"
echo "=========================================="

# Test 23: Get Comprehensive Report
echo "23. Testing: Get Comprehensive Analytics Report"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/comprehensive-report" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response $HTTP_CODE 200 "Get comprehensive report"
echo "Response preview: $BODY" | head -c 400
echo ""

# Test 24: Comprehensive Report with Date Filter
echo "24. Testing: Comprehensive Report - This Year"
YEAR_START=$(date -u +"%Y-01-01")
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/comprehensive-report?from_date=$YEAR_START&to_date=$TO_DATE" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Get comprehensive report (this year)"
echo ""

# ===========================================
# AUTHENTICATION & AUTHORIZATION TESTS
# ===========================================
echo "=========================================="
echo "AUTHENTICATION & AUTHORIZATION TESTS"
echo "=========================================="

# Test 25: No Token (Should be 401)
echo "25. Testing: Dashboard Without Token (Should be 401)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/dashboard")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 401 "Dashboard without token returns 401"
echo ""

# Test 26: Invalid Token (Should be 401)
echo "26. Testing: Dashboard With Invalid Token (Should be 401)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/dashboard" \
    -H "Authorization: Bearer invalid_token_here")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 401 "Dashboard with invalid token returns 401"
echo ""

# Test 27: Staff Access to Sales Overview (Should be 403)
echo "27. Testing: Sales Overview - Staff Access (Should be 403)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/overview" \
    -H "Authorization: Bearer $STAFF_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 403 "Sales overview denied for staff"
echo ""

# Test 28: Staff Access to Profit Analysis (Should be 403)
echo "28. Testing: Profit Analysis - Staff Access (Should be 403)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/profit" \
    -H "Authorization: Bearer $STAFF_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 403 "Profit analysis denied for staff"
echo ""

# ===========================================
# EDGE CASE TESTS
# ===========================================
echo "=========================================="
echo "EDGE CASE TESTS"
echo "=========================================="

# Test 29: Future Date Range (Should return empty/zero data)
echo "29. Testing: Sales Overview - Future Date Range"
FUTURE_START=$(date -u -v+30d +"%Y-%m-%d" 2>/dev/null || date -u -d "30 days" +"%Y-%m-%d")
FUTURE_END=$(date -u -v+60d +"%Y-%m-%d" 2>/dev/null || date -u -d "60 days" +"%Y-%m-%d")
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/overview?from_date=$FUTURE_START&to_date=$FUTURE_END" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Sales overview with future dates"
echo ""

# Test 30: Very Large Limit for Top Items
echo "30. Testing: Top Items with Large Limit (100)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/analytics/sales/top-items?limit=100" \
    -H "Authorization: Bearer $MANAGER_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response $HTTP_CODE 200 "Top items with limit=100"
echo ""

# ===========================================
# FINAL RESULTS
# ===========================================
echo ""
echo "=========================================="
echo "TEST RESULTS SUMMARY"
echo "=========================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}=========================================="
    echo "ALL TESTS PASSED! ✓"
    echo "==========================================${NC}"
    exit 0
else
    echo -e "${RED}=========================================="
    echo "SOME TESTS FAILED! ✗"
    echo "==========================================${NC}"
    exit 1
fi
