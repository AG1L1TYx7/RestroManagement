#!/bin/bash

cd /Users/bishworupadhikari/Desktop/DBMS/backend

# Start server in background
node server.js > /tmp/rest_server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
sleep 3

echo "================================================"
echo "Authentication API Tests"
echo "================================================"

# Test 1: Register
echo -e "\n✓ Test 1: Register New User"
REGISTER=$(curl -s -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"John1234","full_name":"John Doe","role":"staff","phone":"9876543210"}')
echo "$REGISTER" | python3 -m json.tool
TOKEN=$(echo "$REGISTER" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])" 2>/dev/null)
REFRESH=$(echo "$REGISTER" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['refreshToken'])" 2>/dev/null)

# Test 2: Login
echo -e "\n✓ Test 2: Login with Email"
LOGIN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"john@test.com","password":"John1234"}')
echo "$LOGIN" | python3 -m json.tool
TOKEN=$(echo "$LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])" 2>/dev/null)

# Test 3: Get Profile
echo -e "\n✓ Test 3: Get Profile (Protected Route)"
curl -s -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 4: Update Profile
echo -e "\n✓ Test 4: Update Profile"
curl -s -X PUT http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Updated","phone":"1111111111"}' | python3 -m json.tool

# Test 5: Refresh Token
echo -e "\n✓ Test 5: Refresh Access Token"
curl -s -X POST http://localhost:5001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$REFRESH'"}' | python3 -m json.tool

# Test 6: Logout
echo -e "\n✓ Test 6: Logout"
curl -s -X POST http://localhost:5001/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 7: Protected route without token (should fail)
echo -e "\n✗ Test 7: Access Protected Route Without Token (Should Fail)"
curl -s -X GET http://localhost:5001/api/v1/auth/profile | python3 -m json.tool

# Test 8: Invalid credentials (should fail)
echo -e "\n✗ Test 8: Login with Wrong Password (Should Fail)"
curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"john@test.com","password":"WrongPass123"}' | python3 -m json.tool

echo -e "\n================================================"
echo "All Tests Completed!"
echo "================================================"

# Stop server
kill $SERVER_PID
echo "Server stopped"
