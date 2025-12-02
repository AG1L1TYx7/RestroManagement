#!/bin/bash

# Test script for Inventory Management System (Week 8-10)
# Tests: Supplier CRUD, Inventory operations, Stock adjustments, Low stock alerts

BASE_URL="http://localhost:5001/api/v1"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
print_test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}✗ FAIL${NC}: $2"
        if [ ! -z "$3" ]; then
            echo -e "  ${RED}Error: $3${NC}"
        fi
    fi
}

print_section() {
    echo -e "\n${YELLOW}=== $1 ===${NC}\n"
}

# Variables to store created IDs
ADMIN_TOKEN=""
MANAGER_TOKEN=""
STAFF_TOKEN=""
SUPPLIER1_ID=""
SUPPLIER2_ID=""
INGREDIENT1_ID=""

print_section "SETUP: Authentication"

# Login as admin
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@restaurant.com",
    "password": "Manager123"
  }')

ADMIN_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
    print_test_result 0 "Admin login successful"
else
    print_test_result 1 "Admin login failed" "No token received"
    exit 1
fi

# Login as manager
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "manager@restaurant.com",
    "password": "Manager123"
  }')

MANAGER_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$MANAGER_TOKEN" ]; then
    print_test_result 0 "Manager login successful"
else
    print_test_result 1 "Manager login failed" "No token received"
fi

# Login as staff
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "staff@restaurant.com",
    "password": "Staff123"
  }')

STAFF_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$STAFF_TOKEN" ]; then
    print_test_result 0 "Staff login successful"
else
    print_test_result 1 "Staff login failed" "No token received"
fi

print_section "SUPPLIER MANAGEMENT TESTS"

# Cleanup existing test suppliers to avoid duplicates
mysql -u root -p'A9851040557@123a' restaurant_management -e "DELETE FROM suppliers WHERE name IN ('Fresh Foods Wholesale', 'Organic Produce Co')" 2>/dev/null

# Test 1: Create supplier (as manager)
RESPONSE=$(curl -s -X POST "$BASE_URL/suppliers" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Foods Wholesale",
    "contact_person": "John Smith",
    "email": "john@freshfoods.com",
    "phone": "555-0101",
    "address": "123 Market Street, Food District",
    "payment_terms": "Net 30",
    "lead_time_days": 2,
    "rating": 4.5
  }')

SUPPLIER1_ID=$(echo $RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('supplier_id', ''))" 2>/dev/null || echo "")

if [ ! -z "$SUPPLIER1_ID" ] && [ "$SUPPLIER1_ID" -gt 0 ]; then
    print_test_result 0 "Create supplier 1"
else
    print_test_result 1 "Create supplier 1" "Invalid supplier_id: $SUPPLIER1_ID"
fi

# Test 2: Create second supplier
RESPONSE=$(curl -s -X POST "$BASE_URL/suppliers" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Produce Co",
    "contact_person": "Jane Doe",
    "email": "jane@organicproduce.com",
    "phone": "555-0202",
    "address": "456 Green Lane",
    "payment_terms": "Net 15",
    "lead_time_days": 1,
    "rating": 5.0
  }')

SUPPLIER2_ID=$(echo $RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('supplier_id', ''))" 2>/dev/null || echo "")

if [ ! -z "$SUPPLIER2_ID" ] && [ "$SUPPLIER2_ID" -gt 0 ]; then
    print_test_result 0 "Create supplier 2"
else
    print_test_result 1 "Create supplier 2" "Invalid supplier_id"
fi

# Test 3: Get all suppliers
RESPONSE=$(curl -s -X GET "$BASE_URL/suppliers" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

SUPPLIER_COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ "$SUPPLIER_COUNT" -ge 2 ]; then
    print_test_result 0 "Get all suppliers (count: $SUPPLIER_COUNT)"
else
    print_test_result 1 "Get all suppliers" "Expected at least 2 suppliers, got: $SUPPLIER_COUNT"
fi

# Test 4: Get supplier by ID
RESPONSE=$(curl -s -X GET "$BASE_URL/suppliers/$SUPPLIER1_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

SUPPLIER_NAME=$(echo $RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('name', ''))" 2>/dev/null || echo "")

if [ "$SUPPLIER_NAME" = "Fresh Foods Wholesale" ]; then
    print_test_result 0 "Get supplier by ID"
else
    print_test_result 1 "Get supplier by ID" "Expected 'Fresh Foods Wholesale', got: $SUPPLIER_NAME"
fi

# Test 5: Update supplier
RESPONSE=$(curl -s -X PUT "$BASE_URL/suppliers/$SUPPLIER1_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4.8,
    "notes": "Reliable supplier with excellent service"
  }')

SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$SUCCESS" = "true" ]; then
    print_test_result 0 "Update supplier"
else
    print_test_result 1 "Update supplier" "Response: $RESPONSE"
fi

# Test 6: Filter suppliers by rating
RESPONSE=$(curl -s -X GET "$BASE_URL/suppliers?min_rating=4.5" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ "$COUNT" -ge 2 ]; then
    print_test_result 0 "Filter suppliers by minimum rating"
else
    print_test_result 1 "Filter suppliers by minimum rating" "Expected at least 2, got: $COUNT"
fi

# Test 7: Get supplier statistics
RESPONSE=$(curl -s -X GET "$BASE_URL/suppliers/statistics" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

TOTAL_SUPPLIERS=$(echo $RESPONSE | grep -o '"total_suppliers":[0-9]*' | cut -d':' -f2)

if [ "$TOTAL_SUPPLIERS" -ge 2 ]; then
    print_test_result 0 "Get supplier statistics"
else
    print_test_result 1 "Get supplier statistics" "Total suppliers: $TOTAL_SUPPLIERS"
fi

# Test 8: Staff cannot create suppliers (access control)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/suppliers" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Unauthorized Supplier"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "403" ]; then
    print_test_result 0 "Staff cannot create suppliers (RBAC)"
else
    print_test_result 1 "Staff cannot create suppliers (RBAC)" "Expected 403, got: $HTTP_CODE"
fi

print_section "INVENTORY MANAGEMENT TESTS"

# Test 9: Get all inventory items
RESPONSE=$(curl -s -X GET "$BASE_URL/inventory" \
  -H "Authorization: Bearer $STAFF_TOKEN")

INVENTORY_COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ ! -z "$INVENTORY_COUNT" ]; then
    print_test_result 0 "Get all inventory items (count: $INVENTORY_COUNT)"
    
    # Extract first ingredient ID for later tests
    INGREDIENT1_ID=$(echo $RESPONSE | grep -o '"ingredient_id":[0-9]*' | head -1 | cut -d':' -f2)
else
    print_test_result 1 "Get all inventory items" "No count returned"
fi

# Test 10: Get inventory by ingredient ID
if [ ! -z "$INGREDIENT1_ID" ] && [ "$INGREDIENT1_ID" -gt 0 ]; then
    RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/$INGREDIENT1_ID" \
      -H "Authorization: Bearer $STAFF_TOKEN")
    
    FOUND_ID=$(echo $RESPONSE | grep -o '"ingredient_id":[0-9]*' | cut -d':' -f2)
    
    if [ "$FOUND_ID" = "$INGREDIENT1_ID" ]; then
        print_test_result 0 "Get inventory by ingredient ID"
    else
        print_test_result 1 "Get inventory by ingredient ID" "ID mismatch"
    fi
else
    print_test_result 1 "Get inventory by ingredient ID" "No valid ingredient ID"
fi

# Test 11: Filter inventory by stock status
RESPONSE=$(curl -s -X GET "$BASE_URL/inventory?stock_status=sufficient" \
  -H "Authorization: Bearer $STAFF_TOKEN")

SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$SUCCESS" = "true" ]; then
    print_test_result 0 "Filter inventory by stock status"
else
    print_test_result 1 "Filter inventory by stock status"
fi

# Test 12: Get low stock items
RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/low-stock" \
  -H "Authorization: Bearer $STAFF_TOKEN")

SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)

if [ "$SUCCESS" = "true" ]; then
    print_test_result 0 "Get low stock items"
else
    print_test_result 1 "Get low stock items"
fi

# Test 13: Get inventory valuation (manager only)
RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/valuation" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

TOTAL_VALUE=$(echo $RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('total_value', ''))" 2>/dev/null || echo "")

if [ ! -z "$TOTAL_VALUE" ]; then
    print_test_result 0 "Get inventory valuation"
else
    print_test_result 1 "Get inventory valuation" "No total_value returned"
fi

# Test 14: Get inventory statistics
RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/statistics" \
  -H "Authorization: Bearer $MANAGER_TOKEN")

TOTAL_ITEMS=$(echo $RESPONSE | grep -o '"total_items":[0-9]*' | cut -d':' -f2)

if [ ! -z "$TOTAL_ITEMS" ]; then
    print_test_result 0 "Get inventory statistics"
else
    print_test_result 1 "Get inventory statistics"
fi

print_section "STOCK ADJUSTMENT TESTS"

if [ ! -z "$INGREDIENT1_ID" ] && [ "$INGREDIENT1_ID" -gt 0 ]; then
    
    # Test 15: Purchase stock (increases inventory)
    RESPONSE=$(curl -s -X POST "$BASE_URL/inventory/adjust" \
      -H "Authorization: Bearer $MANAGER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"ingredient_id\": $INGREDIENT1_ID,
        \"quantity\": 50,
        \"transaction_type\": \"purchase\",
        \"reference_type\": \"purchase_order\",
        \"reference_id\": 1001,
        \"unit_price\": 2.50,
        \"notes\": \"Weekly stock replenishment\"
      }")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Purchase stock adjustment"
    else
        print_test_result 1 "Purchase stock adjustment" "Response: $RESPONSE"
    fi
    
    # Test 16: Usage adjustment (decreases inventory)
    RESPONSE=$(curl -s -X POST "$BASE_URL/inventory/adjust" \
      -H "Authorization: Bearer $MANAGER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"ingredient_id\": $INGREDIENT1_ID,
        \"quantity\": -5,
        \"transaction_type\": \"usage\",
        \"reference_type\": \"order\",
        \"reference_id\": 1,
        \"notes\": \"Used in order preparation\"
      }")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Usage stock adjustment"
    else
        print_test_result 1 "Usage stock adjustment" "Response: $RESPONSE"
    fi
    
    # Test 17: Wastage adjustment
    RESPONSE=$(curl -s -X POST "$BASE_URL/inventory/adjust" \
      -H "Authorization: Bearer $MANAGER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"ingredient_id\": $INGREDIENT1_ID,
        \"quantity\": -2,
        \"transaction_type\": \"wastage\",
        \"notes\": \"Expired items discarded\"
      }")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Wastage stock adjustment"
    else
        print_test_result 1 "Wastage stock adjustment"
    fi
    
    # Test 18: Manual adjustment
    RESPONSE=$(curl -s -X POST "$BASE_URL/inventory/adjust" \
      -H "Authorization: Bearer $MANAGER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"ingredient_id\": $INGREDIENT1_ID,
        \"quantity\": 3,
        \"transaction_type\": \"adjustment\",
        \"reference_type\": \"manual\",
        \"notes\": \"Stock count correction\"
      }")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Manual stock adjustment"
    else
        print_test_result 1 "Manual stock adjustment"
    fi
    
    # Test 19: Return adjustment
    RESPONSE=$(curl -s -X POST "$BASE_URL/inventory/adjust" \
      -H "Authorization: Bearer $MANAGER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"ingredient_id\": $INGREDIENT1_ID,
        \"quantity\": -10,
        \"transaction_type\": \"return\",
        \"notes\": \"Returned to supplier - quality issue\"
      }")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Return stock adjustment"
    else
        print_test_result 1 "Return stock adjustment"
    fi
    
    # Test 20: Get transaction history for ingredient
    RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/$INGREDIENT1_ID/transactions" \
      -H "Authorization: Bearer $MANAGER_TOKEN")
    
    TRANSACTION_COUNT=$(echo $RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('count', ''))" 2>/dev/null || echo "")
    
    if [ "$TRANSACTION_COUNT" -ge 5 ]; then
        print_test_result 0 "Get transaction history (count: $TRANSACTION_COUNT)"
    else
        print_test_result 1 "Get transaction history" "Expected at least 5 transactions, got: $TRANSACTION_COUNT"
    fi
    
    # Test 21: Get all transactions
    RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/transactions" \
      -H "Authorization: Bearer $MANAGER_TOKEN")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Get all transactions"
    else
        print_test_result 1 "Get all transactions"
    fi
    
    # Test 22: Filter transactions by type
    RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/transactions?transaction_type=purchase" \
      -H "Authorization: Bearer $MANAGER_TOKEN")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Filter transactions by type"
    else
        print_test_result 1 "Filter transactions by type"
    fi
    
    # Test 23: Invalid transaction type
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/adjust" \
      -H "Authorization: Bearer $MANAGER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"ingredient_id\": $INGREDIENT1_ID,
        \"quantity\": 10,
        \"transaction_type\": \"invalid_type\"
      }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "400" ]; then
        print_test_result 0 "Reject invalid transaction type"
    else
        print_test_result 1 "Reject invalid transaction type" "Expected 400, got: $HTTP_CODE"
    fi
    
    # Test 24: Staff cannot adjust stock (RBAC)
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/adjust" \
      -H "Authorization: Bearer $STAFF_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"ingredient_id\": $INGREDIENT1_ID,
        \"quantity\": 10,
        \"transaction_type\": \"purchase\"
      }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "403" ]; then
        print_test_result 0 "Staff cannot adjust stock (RBAC)"
    else
        print_test_result 1 "Staff cannot adjust stock (RBAC)" "Expected 403, got: $HTTP_CODE"
    fi
    
else
    print_test_result 1 "Stock adjustment tests" "No valid ingredient ID available"
fi

# Test 25: Get supplier with ingredients
if [ ! -z "$SUPPLIER1_ID" ] && [ "$SUPPLIER1_ID" -gt 0 ]; then
    RESPONSE=$(curl -s -X GET "$BASE_URL/suppliers/$SUPPLIER1_ID?include=ingredients" \
      -H "Authorization: Bearer $MANAGER_TOKEN")
    
    SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d':' -f2)
    
    if [ "$SUCCESS" = "true" ]; then
        print_test_result 0 "Get supplier with ingredients"
    else
        print_test_result 1 "Get supplier with ingredients"
    fi
fi

print_section "CLEANUP & SUMMARY"

# Note: Not deleting suppliers as they may have ingredients linked
echo "Skipping supplier deletion (may have linked ingredients)"

# Print summary
echo -e "\n${YELLOW}=== TEST SUMMARY ===${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✓ ALL TESTS PASSED!${NC}\n"
    exit 0
else
    echo -e "\n${RED}✗ SOME TESTS FAILED${NC}\n"
    exit 1
fi
