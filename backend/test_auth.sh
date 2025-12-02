#!/bin/bash

# Authentication API Test Script
# Tests all authentication endpoints

BASE_URL="http://localhost:5001/api/v1"
TIMESTAMP=$(date +%s)

echo "================================================"
echo "Restaurant Management System - Auth API Tests"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

echo "=== Test 1: User Registration ==="
echo "POST $BASE_URL/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser'$TIMESTAMP'",
        "email": "testuser'$TIMESTAMP'@test.com",
        "password": "Test1234",
        "full_name": "Test User",
        "role": "staff",
        "phone": "1234567890"
    }')

echo "$REGISTER_RESPONSE" | python3 -m json.tool
if echo "$REGISTER_RESPONSE" | grep -q '"status": "success"'; then
    print_result 0
    # Extract tokens
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
    REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['refreshToken'])")
else
    print_result 1
fi
echo ""

echo "=== Test 2: Duplicate Registration (should fail) ==="
echo "POST $BASE_URL/auth/register"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser'$TIMESTAMP'",
        "email": "testuser'$TIMESTAMP'@test.com",
        "password": "Test1234",
        "full_name": "Test User",
        "role": "staff"
    }')

echo "$DUPLICATE_RESPONSE" | python3 -m json.tool
if echo "$DUPLICATE_RESPONSE" | grep -q '"status": "error"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 3: User Login ==="
echo "POST $BASE_URL/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "identifier": "testuser'$TIMESTAMP'@test.com",
        "password": "Test1234"
    }')

echo "$LOGIN_RESPONSE" | python3 -m json.tool
if echo "$LOGIN_RESPONSE" | grep -q '"status": "success"'; then
    print_result 0
    # Extract new tokens
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['refreshToken'])")
else
    print_result 1
fi
echo ""

echo "=== Test 4: Login with Username ==="
echo "POST $BASE_URL/auth/login"
USERNAME_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "identifier": "testuser'$TIMESTAMP'",
        "password": "Test1234"
    }')

echo "$USERNAME_LOGIN" | python3 -m json.tool
if echo "$USERNAME_LOGIN" | grep -q '"status": "success"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 5: Login with Wrong Password (should fail) ==="
echo "POST $BASE_URL/auth/login"
WRONG_PASSWORD=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "identifier": "testuser'$TIMESTAMP'@test.com",
        "password": "WrongPassword123"
    }')

echo "$WRONG_PASSWORD" | python3 -m json.tool
if echo "$WRONG_PASSWORD" | grep -q '"status": "error"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 6: Get Profile (Protected Route) ==="
echo "GET $BASE_URL/auth/profile"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$PROFILE_RESPONSE" | python3 -m json.tool
if echo "$PROFILE_RESPONSE" | grep -q '"status": "success"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 7: Get Profile Without Token (should fail) ==="
echo "GET $BASE_URL/auth/profile"
NO_TOKEN_PROFILE=$(curl -s -X GET "$BASE_URL/auth/profile")

echo "$NO_TOKEN_PROFILE" | python3 -m json.tool
if echo "$NO_TOKEN_PROFILE" | grep -q '"status": "error"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 8: Update Profile ==="
echo "PUT $BASE_URL/auth/profile"
UPDATE_PROFILE=$(curl -s -X PUT "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "full_name": "Updated Test User",
        "phone": "9876543210"
    }')

echo "$UPDATE_PROFILE" | python3 -m json.tool
if echo "$UPDATE_PROFILE" | grep -q '"status": "success"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 9: Refresh Token ==="
echo "POST $BASE_URL/auth/refresh"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -d '{
        "refreshToken": "'$REFRESH_TOKEN'"
    }')

echo "$REFRESH_RESPONSE" | python3 -m json.tool
if echo "$REFRESH_RESPONSE" | grep -q '"status": "success"'; then
    print_result 0
    # Extract new access token
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
else
    print_result 1
fi
echo ""

echo "=== Test 10: Test New Access Token ==="
echo "GET $BASE_URL/auth/profile"
NEW_TOKEN_TEST=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "$NEW_TOKEN_TEST" | python3 -m json.tool
if echo "$NEW_TOKEN_TEST" | grep -q '"status": "success"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 11: Logout ==="
echo "POST $BASE_URL/auth/logout"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$LOGOUT_RESPONSE" | python3 -m json.tool
if echo "$LOGOUT_RESPONSE" | grep -q '"status": "success"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 12: Test Default Admin Login ==="
echo "POST $BASE_URL/auth/login"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "identifier": "admin",
        "password": "admin123"
    }')

echo "$ADMIN_LOGIN" | python3 -m json.tool
if echo "$ADMIN_LOGIN" | grep -q '"status": "success"'; then
    print_result 0
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
else
    print_result 1
fi
echo ""

echo "=== Test 13: Validation - Invalid Email Format ==="
echo "POST $BASE_URL/auth/register"
INVALID_EMAIL=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser2",
        "email": "invalid-email",
        "password": "Test1234",
        "full_name": "Test User 2",
        "role": "staff"
    }')

echo "$INVALID_EMAIL" | python3 -m json.tool
if echo "$INVALID_EMAIL" | grep -q '"status": "error"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "=== Test 14: Validation - Weak Password ==="
echo "POST $BASE_URL/auth/register"
WEAK_PASSWORD=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser3",
        "email": "testuser3@test.com",
        "password": "weak",
        "full_name": "Test User 3",
        "role": "staff"
    }')

echo "$WEAK_PASSWORD" | python3 -m json.tool
if echo "$WEAK_PASSWORD" | grep -q '"status": "error"'; then
    print_result 0
else
    print_result 1
fi
echo ""

echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
