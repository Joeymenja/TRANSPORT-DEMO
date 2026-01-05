#!/bin/bash

# Base URLs
AUTH_URL="http://localhost:8081/auth"
API_URL="http://localhost:8082"

echo "--------------------------------------------------"
echo "1. Registering Driver (Validation of 'Sign Up' & Logging)"
echo "--------------------------------------------------"
DRIVER_EMAIL="test.feature.try@example.com"
DRIVER_PASS="Password123!"

curl -s -X POST "$AUTH_URL/register-driver" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Feature",
    "lastName": "Trier",
    "email": "'"$DRIVER_EMAIL"'",
    "password": "'"$DRIVER_PASS"'",
    "phone": "(555) 999-9999",
    "licenseNumber": "TRY999",
    "licenseState": "AZ",
    "vehiclePlate": "TRY-TEST"
  }' > /dev/null
echo "Driver registered."

echo -e "\n--------------------------------------------------"
echo "2. Logging in as Admin (to perform actions)"
echo "--------------------------------------------------"
# Assuming admin exists, otherwise we'll register one or use the driver for some things? 
# Usually we need an admin to dispatch. 
# Let's perform a login with a known admin or register a new Organization Admin.
# For demo purposes, I'll register a new Org Admin to be safe.
ADMIN_EMAIL="admin.feature@example.com"
curl -s -X POST "$AUTH_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$ADMIN_EMAIL"'",
    "password": "Password123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ORG_ADMIN",
    "organizationId": "f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00",
    "phone": "(555) 000-0000"
  }' > /dev/null

LOGIN_RES=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$ADMIN_EMAIL"'",
    "password": "Password123!"
  }')

TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
ORG_ID=$(echo $LOGIN_RES | grep -o '"organizationId":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "Admin logged in via Org: $ORG_ID"

echo -e "\n--------------------------------------------------"
echo "3. Creating a Trip"
echo "--------------------------------------------------"
# Create a dummy member first because trip needs member
MEMBER_RES=$(curl -s -X POST "$API_URL/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Member",
    "memberId": "MEM001",
    "mobilityRequirements": ["AMBULATORY"]
  }')
MEMBER_ID=$(echo $MEMBER_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

TRIP_RES=$(curl -s -X POST "$API_URL/trips" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripDate": "'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"'",
    "tripType": "DROP_OFF",
    "members": [{"memberId": "'"$MEMBER_ID"'"}],
    "stops": [
        {"stopType": "PICKUP", "address": "123 Start St"},
        {"stopType": "DROPOFF", "address": "456 End St"}
    ]
  }')
TRIP_ID=$(echo $TRIP_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Trip created: $TRIP_ID"

echo -e "\n--------------------------------------------------"
echo "4. Assigning Trip to Driver"
echo "--------------------------------------------------"
# Get the driver ID (we just registered one, but let's find it or use a known one)
# We can't easily query the driver ID without a list endpoint. 
# We'll rely on the driver appearing in the driver list.
# Actually, let's just use the `register-driver` response if we parsed it, but we didn't.
# We'll list drivers.
DRIVER_LIST=$(curl -s -X GET "$API_URL/drivers" -H "Authorization: Bearer $TOKEN")
# Extract a driver ID (any)
DRIVER_ID=$(echo $DRIVER_LIST | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

curl -s -X PUT "$API_URL/trips/$TRIP_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedDriverId": "'"$DRIVER_ID"'",
    "status": "SCHEDULED"
  }' > /dev/null
echo "Trip assigned to Driver $DRIVER_ID"

echo -e "\n--------------------------------------------------"
echo "5. Starting and Completing Trip"
echo "--------------------------------------------------"
curl -s -X POST "$API_URL/trips/$TRIP_ID/start" -H "Authorization: Bearer $TOKEN" > /dev/null
curl -s -X POST "$API_URL/trips/$TRIP_ID/complete" -H "Authorization: Bearer $TOKEN" > /dev/null
echo "Trip completed."

echo -e "\n--------------------------------------------------"
echo "6. Submitting Report"
echo "--------------------------------------------------"
# First create/get report (auto-created on trip create, usually)
# We need to find the report ID
REPORT_RES=$(curl -s -X GET "$API_URL/reports/$TRIP_ID" -H "Authorization: Bearer $TOKEN")
REPORT_ID=$(echo $REPORT_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Submit it
curl -s -X PUT "$API_URL/reports/$REPORT_ID/submit" -H "Authorization: Bearer $TOKEN" > /dev/null
echo "Report submitted: $REPORT_ID"

echo -e "\n--------------------------------------------------"
echo "7. VERIFICATION: Fething Activity Logs"
echo "--------------------------------------------------"
curl -s "http://localhost:8082/activity-logs?limit=10" | grep -o '"type":"[^"]*","message":"[^"]*"'
