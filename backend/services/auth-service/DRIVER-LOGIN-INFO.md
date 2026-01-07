# Driver Account Login Information

## Available Driver Accounts

### 1. New Driver (Active Account)
- **Email**: `new.driver@gvbh.com`
- **Password**: `password123`
- **Status**: Active (can login)
- **License**: TEMP-DL-999 (AZ)
- **Driver Portal**: http://localhost:3001/driver/login

### 2. Feature Trier (Inactive Account)
- **Email**: `test.feature.try@example.com`
- **Password**: `password123`
- **Status**: User active, but driver record is inactive
- **License**: TRY999 (AZ)
- **Note**: Cannot login until driver is approved

## Quick Start - Testing as a Driver

1. **Login to Driver Portal**
   ```
   URL: http://localhost:3001/driver/login
   Email: new.driver@gvbh.com
   Password: password123
   ```

2. **View Assigned Trips**
   - After login, you should see trips assigned for January 20, 2026
   - Currently 3 trips are assigned to "New Driver"

3. **Submit Trip Reports**
   - Navigate to each trip
   - Click "Submit Report"
   - Fill in the required information:
     - Start/End Odometer readings
     - Start/End times
     - Any incidents or notes
     - Weather and traffic conditions

## Database Information

### Current Trips Assigned
- **Driver**: New Driver (new.driver@gvbh.com)
- **Number of Trips**: 3
- **Trip Date**: January 20, 2026
- **Trip Type**: DROP_OFF
- **Status**: PENDING_APPROVAL
- **Driver ID**: f51cf355-f20b-44f6-8d52-e23a6cfb811e
- **Organization ID**: f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00

### Trip IDs
1. 5f377aa5-5014-4c99-85a8-7b5e1499812e
2. c332fb67-ef2e-4a31-a9d5-492c8a0481fb
3. 6021725e-9fd9-4cdd-a7bf-32e24ba5409b

## Manual Trip Report Submission

If you want to submit trip reports directly via database (for testing), run:

```bash
node submit-trip-reports-directly.js
```

This script will create demo trip reports with realistic data for all assigned trips.

## Services

- **Auth Service**: http://localhost:8081
- **Transport Service**: http://localhost:8082
- **Frontend (Driver Portal)**: http://localhost:3001

## Troubleshooting

### Cannot Login
- Verify the email and password are correct
- Check that the user's `is_active` field is `true` in the database
- Check the auth service is running on port 8081

### No Trips Showing
- Trips may be filtered by date
- Check the trip_date in the database matches the current date filter
- Verify trips are assigned to the correct driver_id

### API Not Responding
- Ensure both auth-service (8081) and transport-service (8082) are running
- Check the service logs for errors
- Verify database connection is working
