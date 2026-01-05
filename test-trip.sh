#!/bin/bash
LOGIN_RES=$(curl -s -X POST http://localhost:8081/auth/login -H "Content-Type: application/json" -d '{"email": "admin.feature@example.com", "password": "Password123!"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
ORG_ID=$(echo $LOGIN_RES | grep -o '"organizationId":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo "User: $USER_ID, Org: $ORG_ID"

# Create Member
MEMBER_RES=$(curl -s -X POST http://localhost:8082/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Member",
    "memberId": "MEM001",
    "mobilityRequirements": ["AMBULATORY"]
  }')
MEMBER_ID=$(echo $MEMBER_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Member Key: $MEMBER_ID"

# Create Trip
curl -v -X POST http://localhost:8082/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "tripDate": "2026-01-20T10:00:00.000Z",
    "tripType": "DROP_OFF",
    "members": [{"memberId": "'"$MEMBER_ID"'"}],
    "stops": [
        {"stopType": "PICKUP", "address": "123 Test St", "stopOrder": 1},
        {"stopType": "DROPOFF", "address": "456 Dest St", "stopOrder": 2}
    ]
  }'
