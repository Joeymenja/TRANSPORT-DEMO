# Transport Service API Reference

Base URL: `http://localhost:8082`

## Authentication
All requests require organization context via headers:
```
X-Organization-ID: <organization-uuid>
X-User-ID: <user-uuid>
```

---

## Trips

### Create Trip
```http
POST /trips
Content-Type: application/json

{
  "tripDate": "2026-01-02T09:00:00Z",
  "assignedDriverId": "driver-uuid",
  "assignedVehicleId": "vehicle-uuid",
  "tripType": "DROP_OFF",
  "isCarpool": true,
  "members": [
    {
      "memberId": "member-uuid-1"
    },
    {
      "memberId": "member-uuid-2"
    }
  ],
  "stops": [
    {
      "stopType": "PICKUP",
      "stopOrder": 1,
      "address": "123 Main St, Phoenix, AZ",
      "gpsLatitude": 33.4484,
      "gpsLongitude": -112.0740,
      "scheduledTime": "2026-01-02T09:00:00Z"
    },
    {
      "stopType": "DROPOFF",
      "stopOrder": 2,
      "address": "456 Medical Center, Phoenix, AZ",
      "gpsLatitude": 33.4500,
      "gpsLongitude": -112.0700,
      "scheduledTime": "2026-01-02T09:30:00Z"
    }
  ]
}
```

### Get Trips by Date
```http
GET /trips?date=2026-01-02
```

### Get Driver's Trips (Today)
```http
GET /trips/driver/{driverId}
```

### Get Single Trip
```http
GET /trips/{tripId}
```

### Start Trip
```http
POST /trips/{tripId}/start
```

### Complete Trip
```http
POST /trips/{tripId}/complete
```

### Mark Member Ready for Pickup
```http
POST /trips/{tripId}/members/{memberId}/ready
```

Response:
```json
{
  "message": "Member marked as ready for pickup"
}
```

---

## Vehicles

### Create Vehicle
```http
POST /vehicles
Content-Type: application/json

{
  "vehicleNumber": "VEH-001",
  "make": "Toyota",
  "model": "Sienna",
  "year": 2023,
  "licensePlate": "ABC123",
  "vin": "1234567890ABCDEFG",
  "capacity": 7
}
```

### Get All Vehicles
```http
GET /vehicles
```

### Get Vehicle by ID
```http
GET /vehicles/{vehicleId}
```

### Update Vehicle
```http
PUT /vehicles/{vehicleId}
Content-Type: application/json

{
  "odometer": 15000,
  "isActive": true
}
```

### Delete Vehicle (Soft Delete)
```http
DELETE /vehicles/{vehicleId}
```

---

## Trip Status Lifecycle

```
SCHEDULED → IN_PROGRESS → WAITING_FOR_CLIENTS → COMPLETED → FINALIZED
                ↓                                     ↓
            CANCELLED                             CANCELLED
```

**Valid Transitions:**
- `SCHEDULED` → `IN_PROGRESS`, `CANCELLED`
- `IN_PROGRESS` → `WAITING_FOR_CLIENTS`, `COMPLETED`, `CANCELLED`
- `WAITING_FOR_CLIENTS` → `IN_PROGRESS`, `COMPLETED`
- `COMPLETED` → `FINALIZED`
- `FINALIZED` → (none - terminal state)
- `CANCELLED` → (none - terminal state)

## Member Status Lifecycle

```
SCHEDULED → PICKED_UP → DROPPED_OFF → READY_FOR_PICKUP → PICKED_UP → COMPLETED
```

---

## Testing Examples

### Create a Carpool Trip

```bash
curl -X POST http://localhost:8082/trips \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: your-org-id" \
  -H "X-User-ID: your-user-id" \
  -d '{
    "tripDate": "2026-01-02T09:00:00Z",
    "tripType": "ROUND_TRIP",
    "isCarpool": true,
    "members": [
      {"memberId": "member-1"},
      {"memberId": "member-2"},
      {"memberId": "member-3"}
    ],
    "stops": [
      {
        "stopType": "PICKUP",
        "stopOrder": 1,
        "address": "GVBH Office, Phoenix, AZ",
        "scheduledTime": "2026-01-02T09:00:00Z"
      },
      {
        "stopType": "DROPOFF",
        "stopOrder": 2,
        "address": "Medical Clinic, Phoenix, AZ",
        "scheduledTime": "2026-01-02T09:30:00Z"
      }
    ]
  }'
```

### Driver Workflow

```bash
# 1. Driver starts trip
curl -X POST http://localhost:8082/trips/{tripId}/start \
  -H "X-Organization-ID: your-org-id"

# 2. Clients finish appointments, text "READY"
curl -X POST http://localhost:8082/trips/{tripId}/members/{memberId}/ready \
  -H "X-Organization-ID: your-org-id"

# 3. Driver returns and completes trip
curl -X POST http://localhost:8082/trips/{tripId}/complete \
  -H "X-Organization-ID: your-org-id"
```

---

## Next Steps

To run the service:
```bash
cd backend/services/transport-service
npm install
npm run dev
```

Service runs on port **8082**
