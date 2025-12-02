#!/bin/bash

# Test script for Sprint 2, Week 4 - Advanced Menu Features
# Tests: Image upload, Recipe management, Inventory-based availability

echo "=== Testing Sprint 2, Week 4 - Advanced Menu Features ==="
echo ""

BASE_URL="http://localhost:5001/api/v1"
TOKEN=""
MENU_ITEM_ID=""
CATEGORY_ID=""
INGREDIENT_ID=""
RECIPE_ID=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Test 1: Login as existing manager (or create if doesn't exist)
echo "Test 1: Login as manager"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "identifier": "manager@test.com",
        "password": "Manager123!"
    }')

# If login fails, register first
if [[ $(echo "$RESPONSE" | jq -r '.status') != "success" ]]; then
    echo "Manager not found, registering..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "testmanager",
            "email": "manager@test.com",
            "password": "Manager123!",
            "full_name": "Test Manager",
            "role": "manager"
        }')
fi

echo "$RESPONSE" | jq '.'
TOKEN=$(echo "$RESPONSE" | jq -r '.data.tokens.accessToken // .data.accessToken')
[[ -n "$TOKEN" && "$TOKEN" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Manager login and token retrieval"

# Test 2: Get existing category or create new one
echo "Test 2: Get or create category"
RESPONSE=$(curl -s -X GET "$BASE_URL/categories" \
    -H "Authorization: Bearer $TOKEN")
CATEGORY_ID=$(echo "$RESPONSE" | jq -r '.data[0].category_id // empty')

if [[ -z "$CATEGORY_ID" || "$CATEGORY_ID" == "null" ]]; then
    RESPONSE=$(curl -s -X POST "$BASE_URL/categories" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "Test Burgers",
            "description": "Test burger items"
        }')
    CATEGORY_ID=$(echo "$RESPONSE" | jq -r '.data.category_id')
fi
echo "Using category_id: $CATEGORY_ID"
[[ -n "$CATEGORY_ID" && "$CATEGORY_ID" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Category retrieval/creation"

# Test 3: Create menu item
echo "Test 3: Create menu item"
RESPONSE=$(curl -s -X POST "$BASE_URL/menu-items" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"category_id\": $CATEGORY_ID,
        \"name\": \"Test Burger $(date +%s)\",
        \"description\": \"Juicy beef patty with lettuce and tomato\",
        \"price\": 8.99,
        \"cost\": 3.50,
        \"preparation_time\": 15,
        \"is_available\": true
    }")
echo "$RESPONSE" | jq '.'
MENU_ITEM_ID=$(echo "$RESPONSE" | jq -r '.data.item_id')
[[ -n "$MENU_ITEM_ID" && "$MENU_ITEM_ID" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Menu item creation"

# Test 4: Upload menu item image
echo "Test 4: Upload menu item image"
# Create a dummy image file for testing
echo "Creating test image..."
convert -size 100x100 xc:blue /tmp/test_burger.jpg 2>/dev/null || {
    # If imagemagick not available, create a simple text file as jpeg
    echo "FFD8FFE0" | xxd -r -p > /tmp/test_burger.jpg
}

RESPONSE=$(curl -s -X POST "$BASE_URL/menu-items/$MENU_ITEM_ID/image" \
    -H "Authorization: Bearer $TOKEN" \
    -F "image=@/tmp/test_burger.jpg")
echo "$RESPONSE" | jq '.'
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.image_url')
[[ -n "$IMAGE_URL" && "$IMAGE_URL" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Image upload"

# Test 5: Verify image URL is accessible
echo "Test 5: Verify image URL"
if [[ -n "$IMAGE_URL" ]]; then
    IMAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001$IMAGE_URL")
    [[ "$IMAGE_RESPONSE" == "200" ]] && RESULT=0 || RESULT=1
    print_result $RESULT "Image URL accessibility (HTTP $IMAGE_RESPONSE)"
else
    print_result 1 "Image URL accessibility (no URL found)"
fi

# Test 6: Get or create test ingredient
echo "Test 6: Get or create test ingredient"
# First try to get existing ingredient
RESPONSE=$(curl -s -X GET "$BASE_URL/ingredients" \
    -H "Authorization: Bearer $TOKEN")
INGREDIENT_ID=$(echo "$RESPONSE" | jq -r '.data[0].ingredient_id // empty' 2>/dev/null)

if [[ -z "$INGREDIENT_ID" || "$INGREDIENT_ID" == "null" ]]; then
    # Create new ingredient using direct DB query since no ingredients endpoint exists yet
    echo "No ingredients found, creating via database..."
    mysql -u root -p'A9851040557@123a' restaurant_management -e "INSERT INTO ingredients (name, unit, cost_per_unit, min_stock_level, reorder_quantity) VALUES ('Test Beef Patty', 'pieces', 1.50, 10, 50);" 2>/dev/null
    INGREDIENT_ID=$(mysql -u root -p'A9851040557@123a' restaurant_management -se "SELECT ingredient_id FROM ingredients ORDER BY ingredient_id DESC LIMIT 1;" 2>/dev/null)
fi
echo "Using ingredient_id: $INGREDIENT_ID"
[[ -n "$INGREDIENT_ID" && "$INGREDIENT_ID" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Ingredient retrieval/creation"

# Test 7: Create recipe (associate ingredient with menu item)
echo "Test 8: Create recipe"
RESPONSE=$(curl -s -X POST "$BASE_URL/recipes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"item_id\": $MENU_ITEM_ID,
        \"ingredient_id\": $INGREDIENT_ID,
        \"quantity_required\": 2.5
    }")
echo "$RESPONSE" | jq '.'
RECIPE_ID=$(echo "$RESPONSE" | jq -r '.data.recipe_id')
[[ -n "$RECIPE_ID" && "$RECIPE_ID" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Recipe creation"

# Test 8: Get recipes for menu item
echo "Test 9: Get recipes for menu item"
RESPONSE=$(curl -s -X GET "$BASE_URL/recipes/item/$MENU_ITEM_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
RECIPE_COUNT=$(echo "$RESPONSE" | jq '.data | length')
[[ "$RECIPE_COUNT" -gt 0 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get recipes for menu item"

# Test 9: Check menu item availability
echo "Test 10: Check menu item availability"
RESPONSE=$(curl -s -X GET "$BASE_URL/recipes/item/$MENU_ITEM_ID/availability" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
CAN_PREPARE=$(echo "$RESPONSE" | jq -r '.data.can_prepare')
[[ "$CAN_PREPARE" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Check availability"

# Test 10: Get ingredient cost breakdown
echo "Test 11: Get ingredient cost breakdown"
RESPONSE=$(curl -s -X GET "$BASE_URL/recipes/item/$MENU_ITEM_ID/cost" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
TOTAL_COST=$(echo "$RESPONSE" | jq -r '.data.total_ingredient_cost')
[[ "$TOTAL_COST" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get ingredient cost"

# Test 11: Update recipe quantity
echo "Test 12: Update recipe quantity"
RESPONSE=$(curl -s -X PUT "$BASE_URL/recipes/$RECIPE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "quantity_required": 3.0
    }')
echo "$RESPONSE" | jq '.'
[[ $(echo "$RESPONSE" | jq -r '.status') == "success" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Update recipe quantity"

# Test 12: Update menu item availability based on inventory
echo "Test 13: Update menu item availability by inventory"
RESPONSE=$(curl -s -X POST "$BASE_URL/menu-items/$MENU_ITEM_ID/update-availability" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
[[ $(echo "$RESPONSE" | jq -r '.status') == "success" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Update single item availability"

# Test 13: Update all menu items availability
echo "Test 14: Update all menu items availability"
RESPONSE=$(curl -s -X POST "$BASE_URL/menu-items/update-all-availability" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
TOTAL_UPDATED=$(echo "$RESPONSE" | jq -r '.data.total_updated')
[[ "$TOTAL_UPDATED" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Update all items availability"

# Test 14: Get items using specific ingredient
echo "Test 15: Get items using ingredient"
RESPONSE=$(curl -s -X GET "$BASE_URL/recipes/ingredient/$INGREDIENT_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
[[ $(echo "$RESPONSE" | jq -r '.status') == "success" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get items using ingredient"

# Test 15: Get all recipes
echo "Test 16: Get all recipes"
RESPONSE=$(curl -s -X GET "$BASE_URL/recipes" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
[[ $(echo "$RESPONSE" | jq -r '.status') == "success" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get all recipes"

# Test 16: Try to create duplicate recipe (should fail)
echo "Test 17: Try to create duplicate recipe (should fail)"
RESPONSE=$(curl -s -X POST "$BASE_URL/recipes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"item_id\": $MENU_ITEM_ID,
        \"ingredient_id\": $INGREDIENT_ID,
        \"quantity_required\": 5.0
    }")
echo "$RESPONSE" | jq '.'
STATUS_CODE=$(echo "$RESPONSE" | jq -r '.status')
[[ "$STATUS_CODE" == "error" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Duplicate recipe prevention"

# Test 17: Delete image
echo "Test 18: Delete menu item image"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/menu-items/$MENU_ITEM_ID/image" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
[[ $(echo "$RESPONSE" | jq -r '.status') == "success" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Image deletion"

# Test 18: Verify image deleted
echo "Test 19: Verify image deleted from menu item"
RESPONSE=$(curl -s -X GET "$BASE_URL/menu-items/$MENU_ITEM_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.image_url')
[[ "$IMAGE_URL" == "null" || -z "$IMAGE_URL" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Image URL removed from database"

# Test 19: Delete recipe
echo "Test 20: Delete recipe"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/recipes/$RECIPE_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq '.'
[[ $(echo "$RESPONSE" | jq -r '.status') == "success" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Recipe deletion"

# Cleanup
echo "Cleanup: Removing test image file"
rm -f /tmp/test_burger.jpg

# Summary
echo ""
echo "======================================"
echo "TEST SUMMARY"
echo "======================================"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "======================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
