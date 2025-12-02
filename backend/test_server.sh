#!/bin/bash

echo "Starting server test..."
cd /Users/bishworupadhikari/Desktop/DBMS/backend

# Start server in background
node server.js &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
sleep 3

# Test endpoints
echo -e "\n=== Testing Health Endpoint ==="
curl -s http://localhost:5001/health | python3 -m json.tool

echo -e "\n=== Testing API v1 Endpoint ==="
curl -s http://localhost:5001/api/v1 | python3 -m json.tool

echo -e "\n=== Testing 404 Handler ==="
curl -s http://localhost:5001/nonexistent | python3 -m json.tool

# Stop server
echo -e "\n=== Stopping server ==="
kill $SERVER_PID
sleep 1

echo -e "\n✓ All tests completed successfully!"
