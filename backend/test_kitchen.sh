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

echo "=== Kitchen Display System Tests ==="\n
# Ensure server is running
if ! curl -s "http://localhost:5001/health" | jq -e '.status == "ok"' >/dev/null; then
  node server.js > server.log 2>&1 &
  sleep 0.5
fi

# Login or create kitchen user
RESP=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"identifier":"kitchen@test.com","password":"Test123!"}')
OK=$(echo "$RESP" | jq -r '.success')
if [[ "$OK" != "true" ]]; then
  TS=$(date +%s)
  K_EMAIL="kitchen+$TS@test.com"
  K_USER="kitchen_$TS"
  curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d "{\"username\":\"$K_USER\",\"email\":\"$K_EMAIL\",\"password\":\"Test123!\",\"full_name\":\"Kitchen User\",\"role\":\"kitchen\"}" >/dev/null
  RESP=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "{\"identifier\":\"$K_EMAIL\",\"password\":\"Test123!\"}")
fi
TOKEN=$(echo "$RESP" | jq -r '.data.tokens.accessToken // .data.accessToken')
[[ -n "$TOKEN" && "$TOKEN" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Kitchen login"

# Create manager to place orders
RESP_M=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"identifier":"manager@test.com","password":"Test123!"}')
if [[ $(echo "$RESP_M" | jq -r '.success') != "true" ]]; then
  TS=$(date +%s)
  M_EMAIL="manager+$TS@test.com"
  M_USER="mgr_$TS"
  curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d "{\"username\":\"$M_USER\",\"email\":\"$M_EMAIL\",\"password\":\"Test123!\",\"full_name\":\"Mgr\",\"role\":\"manager\"}" >/dev/null
  RESP_M=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "{\"identifier\":\"$M_EMAIL\",\"password\":\"Test123!\"}")
fi
MTOKEN=$(echo "$RESP_M" | jq -r '.data.tokens.accessToken // .data.accessToken')

# Create or login staff for operational status updates
RESP_S=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"identifier":"staff@test.com","password":"Test123!"}')
if [[ $(echo "$RESP_S" | jq -r '.success') != "true" ]]; then
  TS=$(date +%s)
  S_EMAIL="staff+$TS@test.com"
  S_USER="staff_$TS"
  curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d "{\"username\":\"$S_USER\",\"email\":\"$S_EMAIL\",\"password\":\"Test123!\",\"full_name\":\"Staff\",\"role\":\"staff\"}" >/dev/null
  RESP_S=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "{\"identifier\":\"$S_EMAIL\",\"password\":\"Test123!\"}")
fi
STOKEN=$(echo "$RESP_S" | jq -r '.data.tokens.accessToken // .data.accessToken')

# Setup category & item
CAT=$(curl -s -X POST "$BASE_URL/categories" -H "Authorization: Bearer $MTOKEN" -H "Content-Type: application/json" -d "{\"name\":\"KitchenCat $(date +%s)\",\"description\":\"Kitchen\"}")
CID=$(echo "$CAT" | jq -r '.data.category_id')
ITEM=$(curl -s -X POST "$BASE_URL/menu-items" -H "Authorization: Bearer $MTOKEN" -H "Content-Type: application/json" -d "{\"category_id\":$CID,\"name\":\"KitchenItem\",\"price\":9.99,\"cost\":5,\"is_available\":true}")
IID=$(echo "$ITEM" | jq -r '.data.item_id')
[[ -n "$IID" && "$IID" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Menu item ready"

# Place two orders (using takeout to avoid FK constraint on non-existent table_id)
ORD1=$(curl -s -X POST "$BASE_URL/orders" -H "Authorization: Bearer $MTOKEN" -H "Content-Type: application/json" -d "{\"order_type\":\"takeout\",\"payment_method\":\"cash\",\"items\":[{\"item_id\":$IID,\"quantity\":1}]}")
OID1=$(echo "$ORD1" | jq -r '.data.order.order_id // .data.order_id')
sleep 0.2
ORD2=$(curl -s -X POST "$BASE_URL/orders" -H "Authorization: Bearer $MTOKEN" -H "Content-Type: application/json" -d "{\"order_type\":\"takeout\",\"payment_method\":\"cash\",\"items\":[{\"item_id\":$IID,\"quantity\":2}]}")
OID2=$(echo "$ORD2" | jq -r '.data.order.order_id // .data.order_id')
[[ -n "$OID1" && "$OID1" != "null" && -n "$OID2" && "$OID2" != "null" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Orders created"

CONF1=$(curl -s -X PUT "$BASE_URL/orders/$OID1/status" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d '{"status":"preparing"}')
CONF2=$(curl -s -X PUT "$BASE_URL/orders/$OID2/status" -H "Authorization: Bearer $STOKEN" -H "Content-Type: application/json" -d '{"status":"preparing"}')
sleep 0.5
ATTEMPTS=0
CHK1=""; CHK2=""
while [[ $ATTEMPTS -lt 8 ]]; do
  CHK1=$(curl -s -X GET "$BASE_URL/orders/$OID1" -H "Authorization: Bearer $STOKEN" | jq -r '.data.status')
  CHK2=$(curl -s -X GET "$BASE_URL/orders/$OID2" -H "Authorization: Bearer $STOKEN" | jq -r '.data.status')
  if [[ "$CHK1" == "preparing" && "$CHK2" == "preparing" ]]; then break; fi
  sleep 0.3
  ((ATTEMPTS++))
done
[[ "$CHK1" == "preparing" && "$CHK2" == "preparing" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Confirmed orders"


# Kitchen queue - ensure baseline count before proceeding
ATTEMPTS=0
COUNT=0
while [[ $ATTEMPTS -lt 10 ]]; do
  QUEUE=$(curl -s -X GET "$BASE_URL/orders/kitchen" -H "Authorization: Bearer $TOKEN")
  COUNT=$(echo "$QUEUE" | jq -r '.count')
  if [[ "$COUNT" -ge 2 ]]; then break; fi
  sleep 0.3
  ((ATTEMPTS++))
done
[[ "$COUNT" -ge 2 ]] && RESULT=0 || RESULT=1
print_result $RESULT "Kitchen queue shows preparing/confirmed"

# Kitchen cannot set invalid status (expects 403 and unchanged status)
BEFORE=$(curl -s -X GET "$BASE_URL/orders/$OID1" -H "Authorization: Bearer $TOKEN" | jq -r '.data.status')
RESP_INV=$(curl -s -o /dev/stderr -w '%{http_code}' -s -X PUT "$BASE_URL/orders/$OID1/status" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"cancelled"}')
AFTER=$(curl -s -X GET "$BASE_URL/orders/$OID1" -H "Authorization: Bearer $TOKEN" | jq -r '.data.status')
if [[ "$RESP_INV" == "403" && "$AFTER" == "$BEFORE" && "$AFTER" != "cancelled" ]]; then RESULT=0; else RESULT=1; fi
print_result $RESULT "Kitchen blocked from invalid status"

# Kitchen progresses to ready
PREP=$(curl -s -X PUT "$BASE_URL/orders/$OID1/status" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"preparing"}')
READY=$(curl -s -X PUT "$BASE_URL/orders/$OID1/status" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"ready"}')
[[ $(echo "$PREP" | jq -r '.success') == "true" && $(echo "$READY" | jq -r '.success') == "true" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Kitchen moved order to ready"

# Verify queue decreases (order moved to ready should not appear in kitchen queue)
sleep 0.5
ATTEMPTS=0
COUNT2=$COUNT
while [[ $ATTEMPTS -lt 10 ]]; do
  QUEUE2=$(curl -s -X GET "$BASE_URL/orders/kitchen" -H "Authorization: Bearer $TOKEN")
  COUNT2=$(echo "$QUEUE2" | jq -r '.count')
  if [[ "$COUNT2" -lt "$COUNT" ]]; then break; fi
  sleep 0.3
  ((ATTEMPTS++))
done
[[ "$COUNT2" -lt "$COUNT" ]] && RESULT=0 || RESULT=1
print_result $RESULT "Queue updated"

# Summary
echo ""; echo "======================================"; echo "TEST SUMMARY"; echo "======================================"; echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"; echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"; echo -e "${RED}Failed: $TESTS_FAILED${NC}"; echo "======================================"
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"; exit 0
else
  echo -e "${RED}Some tests failed.${NC}"; exit 1
fi
