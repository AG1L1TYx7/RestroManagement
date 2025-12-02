#!/bin/bash

# Frontend Integration Validation Script
# Tests all frontend pages and API integrations
# Valid: 200-299 | Invalid: 400, 401, 403, 404, 500+

FRONTEND_URL="http://localhost:5174"
API_BASE="http://localhost:5001/api/v1"
TOKEN=""
PASSED=0
FAILED=0
RESULTS_FILE="frontend_test_results.txt"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

> $RESULTS_FILE

echo "======================================" | tee -a $RESULTS_FILE
echo "FRONTEND INTEGRATION VALIDATION TEST" | tee -a $RESULTS_FILE
echo "Started: $(date)" | tee -a $RESULTS_FILE
echo "======================================" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Function to test page load
test_page() {
    local path=$1
    local description=$2
    local url="${FRONTEND_URL}${path}"
    
    response=$(curl -s -w "\n%{http_code}" -L "$url")
    status_code=$(echo "$response" | tail -n1)
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        echo -e "${GREEN}✓ PASS${NC} [$status_code] Page: $path - $description" | tee -a $RESULTS_FILE
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} [$status_code] Page: $path - $description" | tee -a $RESULTS_FILE
        ((FAILED++))
    fi
    echo "" | tee -a $RESULTS_FILE
}

# Function to test API call from frontend context
test_api_call() {
    local method=$1
    local endpoint=$2
    local description=$3
    local auth_required=$4
    
    local url="${API_BASE}${endpoint}"
    local headers="-H 'Origin: ${FRONTEND_URL}' -H 'Referer: ${FRONTEND_URL}/'"
    
    if [ "$auth_required" = "true" ] && [ -n "$TOKEN" ]; then
        headers="$headers -H 'Authorization: Bearer $TOKEN'"
    fi
    
    response=$(eval curl -s -w "\\n%{http_code}" -X $method "$url" -H "Content-Type: application/json" $headers)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        echo -e "${GREEN}✓ PASS${NC} [$status_code] API: $method $endpoint - $description" | tee -a $RESULTS_FILE
        ((PASSED++))
    elif [[ $status_code -eq 400 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] API: $method $endpoint - BAD REQUEST - $description" | tee -a $RESULTS_FILE
        echo "  Error: $(echo $body | jq -r '.message // .error // .' 2>/dev/null || echo $body | head -c 100)" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -eq 401 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] API: $method $endpoint - UNAUTHORIZED - $description" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -eq 403 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] API: $method $endpoint - FORBIDDEN - $description" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -eq 404 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] API: $method $endpoint - NOT FOUND - $description" | tee -a $RESULTS_FILE
        ((FAILED++))
    elif [[ $status_code -ge 500 ]]; then
        echo -e "${RED}✗ FAIL${NC} [$status_code] API: $method $endpoint - SERVER ERROR - $description" | tee -a $RESULTS_FILE
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠ WARN${NC} [$status_code] API: $method $endpoint - UNEXPECTED - $description" | tee -a $RESULTS_FILE
        ((FAILED++))
    fi
    echo "" | tee -a $RESULTS_FILE
    sleep 0.1
}

# 1. Test Frontend Server
echo "=== FRONTEND SERVER ===" | tee -a $RESULTS_FILE
response=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL")
status_code=$(echo "$response" | tail -n1)

if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
    echo -e "${GREEN}✓ Frontend server is running on $FRONTEND_URL${NC}" | tee -a $RESULTS_FILE
    ((PASSED++))
else
    echo -e "${RED}✗ Frontend server not accessible (Status: $status_code)${NC}" | tee -a $RESULTS_FILE
    echo "Please start frontend: cd frontend && npm run dev" | tee -a $RESULTS_FILE
    ((FAILED++))
    exit 1
fi
echo "" | tee -a $RESULTS_FILE

# 2. Test Public Pages
echo "=== PUBLIC PAGES ===" | tee -a $RESULTS_FILE
test_page "/" "Home/Root page"
test_page "/login" "Login page"

# 3. Get Authentication Token
echo "=== AUTHENTICATION FLOW ===" | tee -a $RESULTS_FILE
TOKEN=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin123"}' | jq -r '.data.tokens.accessToken')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ Authentication successful - Token obtained${NC}" | tee -a $RESULTS_FILE
    ((PASSED++))
else
    echo -e "${RED}✗ Authentication failed - Cannot test protected routes${NC}" | tee -a $RESULTS_FILE
    ((FAILED++))
fi
echo "" | tee -a $RESULTS_FILE

# 4. Test Protected Pages (would require browser automation, but we test APIs they use)
echo "=== PROTECTED PAGE API CALLS ===" | tee -a $RESULTS_FILE
test_api_call "GET" "/analytics/dashboard" "Dashboard page data" "true"
test_api_call "GET" "/menu-items" "Menu items page data" "true"
test_api_call "GET" "/categories" "Categories page data" "true"
test_api_call "GET" "/tables" "Tables page data" "true"
test_api_call "GET" "/reservations" "Reservations page data" "true"
test_api_call "GET" "/orders" "Orders page data" "true"
test_api_call "GET" "/inventory" "Inventory page data" "true"
test_api_call "GET" "/suppliers" "Suppliers page data" "true"
test_api_call "GET" "/purchase-orders" "Purchase Orders page data" "true"

# 5. Test Critical User Flows
echo "=== CRITICAL USER FLOWS ===" | tee -a $RESULTS_FILE
test_api_call "GET" "/tables/stats" "Tables page - statistics widget" "true"
test_api_call "GET" "/reservations/stats" "Reservations page - stats" "true"
test_api_call "GET" "/reservations/upcoming" "Reservations page - upcoming list" "true"
test_api_call "GET" "/menu-items/search?q=test" "Menu search functionality" "true"
test_api_call "GET" "/inventory/low-stock" "Inventory alerts" "true"
test_api_call "GET" "/purchase-orders/statistics" "PO dashboard stats" "true"

# 6. Test Analytics Pages
echo "=== ANALYTICS & REPORTS ===" | tee -a $RESULTS_FILE
test_api_call "GET" "/analytics/sales/overview" "Sales analytics page" "true"
test_api_call "GET" "/analytics/inventory" "Inventory analytics" "true"
test_api_call "GET" "/reports/dashboard" "Reports page (alias)" "true"

# 7. Test Error Scenarios
echo "=== ERROR HANDLING ===" | tee -a $RESULTS_FILE
test_api_call "GET" "/menu-items/99999" "Non-existent menu item (404 expected)" "true"
test_api_call "GET" "/categories/99999" "Non-existent category (404 expected)" "true"

TOKEN=""  # Clear token
test_api_call "GET" "/menu-items" "Unauthorized access (401 expected)" "false"

# 8. Frontend Build Validation
echo "=== FRONTEND BUILD VALIDATION ===" | tee -a $RESULTS_FILE
if [ -d "frontend/dist" ]; then
    echo -e "${GREEN}✓ Production build exists (frontend/dist)${NC}" | tee -a $RESULTS_FILE
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ No production build found - Run: npm run build${NC}" | tee -a $RESULTS_FILE
fi
echo "" | tee -a $RESULTS_FILE

# 9. Check for Common Issues
echo "=== COMMON ISSUES CHECK ===" | tee -a $RESULTS_FILE

# Check CORS
cors_test=$(curl -s -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS "${API_BASE}/menu-items" -o /dev/null -w "%{http_code}")

if [[ $cors_test -eq 200 || $cors_test -eq 204 ]]; then
    echo -e "${GREEN}✓ CORS properly configured${NC}" | tee -a $RESULTS_FILE
    ((PASSED++))
else
    echo -e "${RED}✗ CORS may not be configured correctly${NC}" | tee -a $RESULTS_FILE
    ((FAILED++))
fi
echo "" | tee -a $RESULTS_FILE

# Summary
echo "======================================" | tee -a $RESULTS_FILE
echo "TEST SUMMARY" | tee -a $RESULTS_FILE
echo "======================================" | tee -a $RESULTS_FILE
echo "Total Passed: ${GREEN}$PASSED${NC}" | tee -a $RESULTS_FILE
echo "Total Failed: ${RED}$FAILED${NC}" | tee -a $RESULTS_FILE
echo "Total Tests: $((PASSED + FAILED))" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Detailed Status Code Analysis
echo "=== STATUS CODE ANALYSIS ===" | tee -a $RESULTS_FILE
echo "Valid Responses (200-299): Expected for successful operations" | tee -a $RESULTS_FILE
echo "400 Bad Request: Malformed or invalid request data" | tee -a $RESULTS_FILE
echo "401 Unauthorized: Missing or invalid authentication" | tee -a $RESULTS_FILE
echo "403 Forbidden: Insufficient permissions" | tee -a $RESULTS_FILE
echo "404 Not Found: Resource does not exist" | tee -a $RESULTS_FILE
echo "500+ Server Error: Backend application errors" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL FRONTEND INTEGRATION TESTS PASSED${NC}" | tee -a $RESULTS_FILE
    echo "All API endpoints returned valid status codes" | tee -a $RESULTS_FILE
    echo "No unauthorized (401), bad request (400), or server errors (500+) detected" | tee -a $RESULTS_FILE
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}" | tee -a $RESULTS_FILE
    echo "Review failed tests above for issues with:" | tee -a $RESULTS_FILE
    echo "  - Authentication (401)" | tee -a $RESULTS_FILE
    echo "  - Data validation (400)" | tee -a $RESULTS_FILE
    echo "  - Missing resources (404)" | tee -a $RESULTS_FILE
    echo "  - Server errors (500+)" | tee -a $RESULTS_FILE
fi

echo "" | tee -a $RESULTS_FILE
echo "Completed: $(date)" | tee -a $RESULTS_FILE
echo "Full results saved to: $RESULTS_FILE" | tee -a $RESULTS_FILE

exit $FAILED
