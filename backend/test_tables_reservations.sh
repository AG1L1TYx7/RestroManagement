#!/bin/zsh

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
BASE_URL="http://localhost:5001/api/v1"

TESTS_PASSED=0
TESTS_FAILED=0

print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC}: $2"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}: $2"
    ((TESTS_FAILED++))
  fi
}

echo "=== Table & Reservation Management Tests ===\n"

# Ensure server is running
if ! curl -s "http://localhost:5001/health" | jq -e '.status == "success"' >/dev/null 2>&1; then
  cd /Users/bishworupadhikari/Desktop/DBMS/backend && node server.js > /tmp/server.log 2>&1 &
  sleep 1.5
fi

# Login as manager
RESP_M=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"identifier":"manager@test.com","password":"Test123!"}')
if [[ $(echo "$RESP_M" | jq -r '.success') != "true" ]]; then
  TS=$(date +%s)
  M_EMAIL="mgr_tbl_$TS@test.com"
  M_USER="mgr_tbl_$TS"
  curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d "{\"username\":\"$M_USER\",\"email\":\"$M_EMAIL\",\"password\":\"Test123!\",\"full_name\":\"Manager\",\"role\":\"manager\"}" >/dev/null
  RESP_M=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "{\"identifier\":\"$M_EMAIL\",\"password\":\"Test123!\"}")
fi
MTOKEN=$(echo "$RESP_M" | jq -r '.data.tokens.accessToken // .data.accessToken')
[[ -n "$MTOKEN" && "$MTOKEN" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Manager login"

# Login as staff
RESP_S=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"identifier":"staff@test.com","password":"Test123!"}')
if [[ $(echo "$RESP_S" | jq -r '.success') != "true" ]]; then
  TS=$(date +%s)
  S_EMAIL="staff_tbl_$TS@test.com"
  S_USER="staff_tbl_$TS"
  curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d "{\"username\":\"$S_USER\",\"email\":\"$S_EMAIL\",\"password\":\"Test123!\",\"full_name\":\"Staff\",\"role\":\"staff\"}" >/dev/null
  RESP_S=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "{\"identifier\":\"$S_EMAIL\",\"password\":\"Test123!\"}")
fi
STOKEN=$(echo "$RESP_S" | jq -r '.data.tokens.accessToken // .data.accessToken')
[[ -n "$STOKEN" && "$STOKEN" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Staff login"

# ============ TABLE TESTS ============
echo "\n--- Table Management ---"

# Test 1: Create table
TBL1=$(curl -s -X POST "$BASE_URL/tables" -H "Authorization: Bearer $MTOKEN" -H "Content-Type: application/json" -d "{\"table_number\":\"T$(date +%s)\",\"capacity\":4,\"location\":\"Main Floor\",\"status\":\"available\"}")
TID1=$(echo "$TBL1" | jq -r '.data.table_id')
[[ $(echo "$TBL1" | jq -r '.success') == "true" && -n "$TID1" && "$TID1" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Create table"

# Test 2: Get all tables
TABLES=$(curl -s -X GET "$BASE_URL/tables" -H "Authorization: Bearer $STOKEN")
COUNT=$(echo "$TABLES" | jq -r '.count')
[[ $(echo "$TABLES" | jq -r '.success') == "true" && "$COUNT" -ge 1 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get all tables"

# Test 3: Get table by ID
TBL_GET=$(curl -s -X GET "$BASE_URL/tables/$TID1" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$TBL_GET" | jq -r '.success') == "true" && $(echo "$TBL_GET" | jq -r '.data.table_id') == "$TID1" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get table by ID"

# Test 4: Update table status
STATUS_UPD=$(curl -s -X PUT "$BASE_URL/tables/$TID1/status" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d '{"status":"occupied"}')
sleep 0.3
TBL_CHK=$(curl -s -X GET "$BASE_URL/tables/$TID1" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$TBL_CHK" | jq -r '.data.status') == "occupied" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Update table status"

# Test 5: Get table statistics
STATS=$(curl -s -X GET "$BASE_URL/tables/stats" -H "Authorization: Bearer $MTOKEN")
[[ $(echo "$STATS" | jq -r '.success') == "true" && $(echo "$STATS" | jq -r '.data.total_tables') -ge 1 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get table statistics"

# Test 6: Get available tables
TBL2=$(curl -s -X POST "$BASE_URL/tables" -H "Authorization: Bearer $MTOKEN" -H "Content-Type: application/json" -d "{\"table_number\":\"T$(date +%s)_2\",\"capacity\":6,\"location\":\"Patio\",\"status\":\"available\"}")
TID2=$(echo "$TBL2" | jq -r '.data.table_id')
sleep 0.2
AVAIL=$(curl -s -X GET "$BASE_URL/tables/available?capacity=4" -H "Authorization: Bearer $STOKEN")
AVAIL_COUNT=$(echo "$AVAIL" | jq -r '.count')
[[ $(echo "$AVAIL" | jq -r '.success') == "true" && "$AVAIL_COUNT" -ge 1 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get available tables"

# ============ RESERVATION TESTS ============
echo "\n--- Reservation Management ---"

# Test 7: Create reservation
FUTURE_DATE=$(date -u -v+2d +"%Y-%m-%dT18:00:00Z" 2>/dev/null || date -u -d '+2 days' +"%Y-%m-%dT18:00:00Z" 2>/dev/null || echo "2025-12-05T18:00:00Z")
RES1=$(curl -s -X POST "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d "{\"table_id\":$TID2,\"customer_name\":\"John Doe\",\"customer_phone\":\"1234567890\",\"customer_email\":\"john@test.com\",\"party_size\":4,\"reservation_date\":\"$FUTURE_DATE\",\"duration_minutes\":120,\"special_requests\":\"Window seat\"}")
RID1=$(echo "$RES1" | jq -r '.data.reservation_id')
[[ $(echo "$RES1" | jq -r '.success') == "true" && -n "$RID1" && "$RID1" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Create reservation"

# Test 8: Get all reservations
RESERVATIONS=$(curl -s -X GET "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN")
RES_COUNT=$(echo "$RESERVATIONS" | jq -r '.count')
[[ $(echo "$RESERVATIONS" | jq -r '.success') == "true" && "$RES_COUNT" -ge 1 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get all reservations"

# Test 9: Get reservation by ID
RES_GET=$(curl -s -X GET "$BASE_URL/reservations/$RID1" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$RES_GET" | jq -r '.success') == "true" && $(echo "$RES_GET" | jq -r '.data.reservation_id') == "$RID1" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get reservation by ID"

# Test 10: Update reservation status to confirmed
CONF=$(curl -s -X PUT "$BASE_URL/reservations/$RID1/status" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d '{"status":"confirmed"}')
sleep 0.3
RES_CHK=$(curl -s -X GET "$BASE_URL/reservations/$RID1" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$RES_CHK" | jq -r '.data.status') == "confirmed" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Confirm reservation"

# Test 11: Conflict detection - try to book same table at same time
RES_CONFLICT=$(curl -s -X POST "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d "{\"table_id\":$TID2,\"customer_name\":\"Jane Smith\",\"customer_phone\":\"9876543210\",\"party_size\":2,\"reservation_date\":\"$FUTURE_DATE\",\"duration_minutes\":90}")
[[ $(echo "$RES_CONFLICT" | jq -r '.success') == "false" && $(echo "$RES_CONFLICT" | jq -r '.message' | grep -i "already reserved") ]] && RESULT=0 || RESULT=1
print_result $RESULT "Conflict detection"

# Test 12: Update reservation to seated
SEATED=$(curl -s -X PUT "$BASE_URL/reservations/$RID1/status" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d '{"status":"seated"}')
sleep 0.3
RES_CHK2=$(curl -s -X GET "$BASE_URL/reservations/$RID1" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$RES_CHK2" | jq -r '.data.status') == "seated" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Update reservation to seated"

# Test 13: Get upcoming reservations
FUTURE_DATE2=$(date -u -v+1d +"%Y-%m-%dT19:00:00Z" 2>/dev/null || date -u -d '+1 days' +"%Y-%m-%dT19:00:00Z" 2>/dev/null || echo "2025-12-04T19:00:00Z")
RES2=$(curl -s -X POST "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d "{\"table_id\":$TID1,\"customer_name\":\"Alice Brown\",\"customer_phone\":\"5551234567\",\"party_size\":2,\"reservation_date\":\"$FUTURE_DATE2\",\"duration_minutes\":90}")
sleep 0.2
UPCOMING=$(curl -s -X GET "$BASE_URL/reservations/upcoming?hours=72" -H "Authorization: Bearer $STOKEN")
UP_COUNT=$(echo "$UPCOMING" | jq -r '.count')
[[ $(echo "$UPCOMING" | jq -r '.success') == "true" && "$UP_COUNT" -ge 1 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get upcoming reservations"

# Test 14: Cancel reservation
CANCEL_DATE=$(date -u -v+5d +"%Y-%m-%dT21:00:00Z" 2>/dev/null || date -u -d '+5 days' +"%Y-%m-%dT21:00:00Z" 2>/dev/null || echo "2025-12-08T21:00:00Z")
RES3=$(curl -s -X POST "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d "{\"table_id\":$TID1,\"customer_name\":\"Bob Wilson\",\"customer_phone\":\"5559876543\",\"party_size\":3,\"reservation_date\":\"$CANCEL_DATE\",\"duration_minutes\":120}")
RID3=$(echo "$RES3" | jq -r '.data.reservation_id')
sleep 0.2
CANCEL=$(curl -s -X DELETE "$BASE_URL/reservations/$RID3/cancel" -H "Authorization: Bearer $STOKEN")
sleep 0.3
RES_CANCEL_CHK=$(curl -s -X GET "$BASE_URL/reservations/$RID3" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$RES_CANCEL_CHK" | jq -r '.data.status') == "cancelled" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Cancel reservation"

# Test 15: Get reservation statistics
RES_STATS=$(curl -s -X GET "$BASE_URL/reservations/stats" -H "Authorization: Bearer $MTOKEN")
[[ $(echo "$RES_STATS" | jq -r '.success') == "true" && $(echo "$RES_STATS" | jq -r '.data.total_reservations') -ge 1 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Get reservation statistics"

# Test 16: Update table details
UPD_TBL=$(curl -s -X PUT "$BASE_URL/tables/$TID1" -H "Authorization: Bearer $MTOKEN" -H "Content-Type: application/json" -d "{\"table_number\":\"T-UPDATED-$(date +%s)\",\"capacity\":6,\"location\":\"VIP Section\"}")
sleep 0.3
TBL_UPD_CHK=$(curl -s -X GET "$BASE_URL/tables/$TID1" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$TBL_UPD_CHK" | jq -r '.data.capacity') == "6" && $(echo "$TBL_UPD_CHK" | jq -r '.data.location') == "VIP Section" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Update table details"

# Test 17: Filter tables by status
curl -s -X PUT "$BASE_URL/tables/$TID1/status" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d '{"status":"available"}' >/dev/null
sleep 0.2
FILTER=$(curl -s -X GET "$BASE_URL/tables?status=available" -H "Authorization: Bearer $STOKEN")
FILTER_COUNT=$(echo "$FILTER" | jq -r '.count')
[[ $(echo "$FILTER" | jq -r '.success') == "true" && "$FILTER_COUNT" -ge 1 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Filter tables by status"

# Test 18: Prevent double booking
FUTURE_DATE3=$(date -u -v+3d +"%Y-%m-%dT20:00:00Z" 2>/dev/null || date -u -d '+3 days' +"%Y-%m-%dT20:00:00Z" 2>/dev/null || echo "2025-12-06T20:00:00Z")
RES_NEW=$(curl -s -X POST "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d "{\"table_id\":$TID1,\"customer_name\":\"Test User\",\"customer_phone\":\"5551112222\",\"party_size\":4,\"reservation_date\":\"$FUTURE_DATE3\",\"duration_minutes\":120}")
RID_NEW=$(echo "$RES_NEW" | jq -r '.data.reservation_id')
sleep 0.2
RES_DUP=$(curl -s -X POST "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d "{\"table_id\":$TID1,\"customer_name\":\"Another User\",\"customer_phone\":\"5553334444\",\"party_size\":2,\"reservation_date\":\"$FUTURE_DATE3\",\"duration_minutes\":90}")
[[ $(echo "$RES_DUP" | jq -r '.success') == "false" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Prevent double booking"

# Test 19: Capacity validation
RES_OVERCAP=$(curl -s -X POST "$BASE_URL/reservations" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d "{\"table_id\":$TID1,\"customer_name\":\"Big Party\",\"customer_phone\":\"5556667777\",\"party_size\":15,\"reservation_date\":\"$FUTURE_DATE3\",\"duration_minutes\":120}")
[[ $(echo "$RES_OVERCAP" | jq -r '.success') == "false" && $(echo "$RES_OVERCAP" | jq -r '.message' | grep -i "capacity") ]] && RESULT=0 || RESULT=1
print_result $RESULT "Capacity validation"

# Test 20: Complete reservation updates table status
RES_COMPLETE=$(curl -s -X PUT "$BASE_URL/reservations/$RID_NEW/status" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d '{"status":"completed"}')
sleep 0.3
TBL_STATUS_CHK=$(curl -s -X GET "$BASE_URL/tables/$TID1" -H "Authorization: Bearer $STOKEN")
[[ $(echo "$TBL_STATUS_CHK" | jq -r '.data.status') == "available" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Complete reservation updates table status"

# Summary
echo "\n======================================"
echo "TEST SUMMARY"
echo "======================================"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
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
