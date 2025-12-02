#!/bin/bash

# API Test Script for Restaurant Management System
# Tests all endpoints and validates HTTP status codes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5001/api/v1"
RESULTS_FILE="api_test_results.txt"

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Authentication tokens
ACCESS_TOKEN=""
REFRESH_TOKEN=""

# Initialize results file
echo "======================================" > $RESULTS_FILE
echo "API TEST RESULTS" >> $RESULTS_FILE
echo "Started: $(date)" >> $RESULTS_FILE
echo "======================================" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Print header
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  RESTAURANT API VALIDATION SUITE${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Test function
test_api() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local data=$5
    local use_auth=${6:-true}
    
    ((TOTAL_TESTS++))
    
    # Build curl command
    local url="${API_URL}${endpoint}"
    local headers="-H 'Content-Type: application/json'"
    
    if [ "$use_auth" = "true" ] && [ -n "$ACCESS_TOKEN" ]; then
        headers="$headers -H 'Authorization: Bearer $ACCESS_TOKEN'"
    fi
    
    # Execute request
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
            -H "Content-Type: application/json" \
            ${ACCESS_TOKEN:+-H "Authorization: Bearer $ACCESS_TOKEN"} \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
            -H "Content-Type: application/json" \
            ${ACCESS_TOKEN:+-H "Authorization: Bearer $ACCESS_TOKEN"})
    fi
    
    # Extract status code (last line) and body (everything else)
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    # Validate status code
    local test_passed=false
    local status_label=""
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        if [[ "$expected_status" == "2xx" ]]; then
            test_passed=true
            status_label="${GREEN}✓ PASS${NC}"
            ((PASSED_TESTS++))
        elif [[ "$expected_status" =~ ^[0-9]+$ ]] && [[ $status_code -eq $expected_status ]]; then
            test_passed=true
            status_label="${GREEN}✓ PASS${NC}"
            ((PASSED_TESTS++))
        else
            status_label="${RED}✗ FAIL${NC}"
            ((FAILED_TESTS++))
        fi
    elif [[ $status_code -eq 400 ]]; then
        if [[ "$expected_status" =~ ^[0-9]+$ ]] && [[ $expected_status -eq 400 ]]; then
            test_passed=true
            status_label="${GREEN}✓ PASS${NC}"
            ((PASSED_TESTS++))
        else
            status_label="${RED}✗ FAIL [400 BAD REQUEST]${NC}"
            ((FAILED_TESTS++))
        fi
    elif [[ $status_code -eq 401 ]]; then
        if [[ "$expected_status" =~ ^[0-9]+$ ]] && [[ $expected_status -eq 401 ]]; then
            test_passed=true
            status_label="${GREEN}✓ PASS${NC}"
            ((PASSED_TESTS++))
        else
            status_label="${RED}✗ FAIL [401 UNAUTHORIZED]${NC}"
            ((FAILED_TESTS++))
        fi
    elif [[ $status_code -eq 403 ]]; then
        status_label="${RED}✗ FAIL [403 FORBIDDEN]${NC}"
        ((FAILED_TESTS++))
    elif [[ $status_code -eq 404 ]]; then
        if [[ "$expected_status" =~ ^[0-9]+$ ]] && [[ $expected_status -eq 404 ]]; then
            test_passed=true
            status_label="${GREEN}✓ PASS${NC}"
            ((PASSED_TESTS++))
        else
            status_label="${RED}✗ FAIL [404 NOT FOUND]${NC}"
            ((FAILED_TESTS++))
        fi
    elif [[ $status_code -ge 500 ]]; then
        status_label="${RED}✗ FAIL [${status_code} SERVER ERROR]${NC}"
        ((FAILED_TESTS++))
    else
        status_label="${YELLOW}⚠ WARN [${status_code} UNEXPECTED]${NC}"
        ((FAILED_TESTS++))
    fi
    
    # Output results to stderr so stdout is clean for parsing
    echo -e "${status_label} [${status_code}] ${method} ${endpoint}" >&2
    echo "  Description: ${description}" >&2
    
    if [ "$test_passed" = false ]; then
        local error_msg=$(echo "$body" | jq -r '.message // .error // "No error message"' 2>/dev/null || echo "$body" | head -c 200)
        echo -e "  ${RED}Error: ${error_msg}${NC}" >&2
    fi
    
    echo "" >&2
    
    # Write to file
    echo "[$status_code] $method $endpoint - $description" >> $RESULTS_FILE
    if [ "$test_passed" = false ]; then
        echo "  Status: FAILED" >> $RESULTS_FILE
        echo "  Response: $(echo "$body" | head -c 200)" >> $RESULTS_FILE
    else
        echo "  Status: PASSED" >> $RESULTS_FILE
    fi
    echo "" >> $RESULTS_FILE
    
    # Return response body for token extraction (stdout only)
    echo "$body"
}

# Start tests
echo -e "${BLUE}=== AUTHENTICATION ===${NC}"
login_response=$(test_api "POST" "/auth/login" "Login with valid credentials" "2xx" '{"identifier": "admin", "password": "admin123"}' "false")
ACCESS_TOKEN=$(echo "$login_response" | jq -r '.data.tokens.accessToken // empty' 2>/dev/null)
REFRESH_TOKEN=$(echo "$login_response" | jq -r '.data.tokens.refreshToken // empty' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}ERROR: Failed to obtain access token. Cannot continue with authenticated tests.${NC}"
    echo "Login response: $login_response"
    exit 1
fi

echo -e "${GREEN}✓ Access token obtained${NC}"
echo ""

test_api "POST" "/auth/login" "Login with invalid credentials" "401" '{"identifier": "admin", "password": "wrongpass"}' "false"

echo -e "${BLUE}=== CATEGORIES ===${NC}"
test_api "GET" "/categories" "Get all categories" "2xx"
test_api "GET" "/categories/stats" "Get category statistics" "2xx"

echo -e "${BLUE}=== MENU ITEMS ===${NC}"
test_api "GET" "/menu-items" "Get all menu items" "2xx"
test_api "GET" "/menu-items/1" "Get menu item by ID" "2xx"
test_api "GET" "/menu-items/stats" "Get menu item statistics" "2xx"

echo -e "${BLUE}=== TABLES ===${NC}"
test_api "GET" "/tables" "Get all tables" "2xx"
test_api "GET" "/tables/stats" "Get table statistics" "2xx"
test_api "GET" "/tables/1" "Get table by ID" "2xx"

echo -e "${BLUE}=== RESERVATIONS ===${NC}"
test_api "GET" "/reservations" "Get all reservations" "2xx"
test_api "GET" "/reservations/stats" "Get reservation statistics" "2xx"
test_api "GET" "/reservations/upcoming" "Get upcoming reservations" "2xx"

echo -e "${BLUE}=== ORDERS ===${NC}"
test_api "GET" "/orders" "Get all orders" "2xx"
test_api "GET" "/orders/1" "Get order by ID" "2xx"
test_api "GET" "/orders/stats" "Get order statistics" "2xx"

echo -e "${BLUE}=== INVENTORY ===${NC}"
test_api "GET" "/inventory" "Get all inventory items" "2xx"
test_api "GET" "/inventory/stats" "Get inventory statistics" "2xx"
test_api "GET" "/inventory/1" "Get inventory item by ID" "2xx"

echo -e "${BLUE}=== SUPPLIERS ===${NC}"
test_api "GET" "/suppliers" "Get all suppliers" "2xx"
test_api "GET" "/suppliers/stats" "Get supplier statistics" "2xx"
test_api "GET" "/suppliers/1" "Get supplier by ID" "2xx"

echo -e "${BLUE}=== PURCHASE ORDERS ===${NC}"
test_api "GET" "/purchase-orders" "Get all purchase orders" "2xx"
test_api "GET" "/purchase-orders/stats" "Get purchase order statistics" "2xx"
test_api "GET" "/purchase-orders/7" "Get purchase order by ID" "2xx"

echo -e "${BLUE}=== ANALYTICS ===${NC}"
test_api "GET" "/analytics/dashboard" "Get dashboard analytics" "2xx"
test_api "GET" "/analytics/sales" "Get sales analytics" "2xx"
test_api "GET" "/analytics/inventory" "Get inventory analytics" "2xx"

echo -e "${BLUE}=== REPORTS (ALIAS) ===${NC}"
test_api "GET" "/reports/dashboard" "Get dashboard via reports alias" "2xx"

echo -e "${BLUE}=== BRANCHES (STUB) ===${NC}"
test_api "GET" "/branches" "Get branches stub endpoint" "2xx"

echo -e "${BLUE}=== UNAUTHORIZED ACCESS ===${NC}"
# Temporarily clear token
TEMP_TOKEN=$ACCESS_TOKEN
ACCESS_TOKEN=""
test_api "GET" "/menu-items" "Access menu items without auth (should succeed - public)" "2xx"
test_api "GET" "/orders" "Access orders without auth (should fail)" "401"
ACCESS_TOKEN=$TEMP_TOKEN

# Summary
echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Total Tests:  ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "Passed:       ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed:       ${RED}${FAILED_TESTS}${NC}"

# Write summary to file
echo "" >> $RESULTS_FILE
echo "======================================" >> $RESULTS_FILE
echo "SUMMARY" >> $RESULTS_FILE
echo "======================================" >> $RESULTS_FILE
echo "Total Tests: $TOTAL_TESTS" >> $RESULTS_FILE
echo "Passed: $PASSED_TESTS" >> $RESULTS_FILE
echo "Failed: $FAILED_TESTS" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE
echo "Completed: $(date)" >> $RESULTS_FILE

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo -e "Review ${RESULTS_FILE} for details"
    echo ""
    exit 1
fi
