# Quick Commands Reference

## First Time Setup

```powershell
# 1. Create database and run schema
psql -U postgres -c "CREATE DATABASE gvbh_transport;"
psql -U postgres -d gvbh_transport -f database/schema.sql
psql -U postgres -d gvbh_transport -f database/test-data.sql

# 2. Install all dependencies
cd backend/services/auth-service && npm install
cd ../transport-service && npm install  
cd ../../../frontend && npm install

# 3. Copy environment files
copy backend\services\auth-service\.env.example backend\services\auth-service\.env
copy backend\services\transport-service\.env.example backend\services\transport-service\.env
```

## Daily Development

```powershell
# Option 1: Run all at once
.\start-dev.ps1

# Option 2: Run individually (in separate terminals)
# Terminal 1
cd backend/services/auth-service && npm run dev

# Terminal 2  
cd backend/services/transport-service && npm run dev

# Terminal 3
cd frontend && npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Auth API**: http://localhost:8081/auth
- **Transport API**: http://localhost:8082/trips

## Login Credentials

**Admin User:**
- Email: `admin@gvbh.com`
- Password: `password123`

**Driver User:**
- Email: `driver@gvbh.com`  
- Password: `password123`

## Useful Database Commands

```sql
-- View all trips
SELECT * FROM trips;

-- View all users
SELECT email, first_name, last_name, role FROM users;

-- View all vehicles
SELECT vehicle_number, make, model, capacity FROM vehicles;

-- View all clients
SELECT member_id, first_name, last_name FROM members;

-- Reset a user password to "password123"
UPDATE users 
SET password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'admin@gvbh.com';
```

## Testing API Endpoints

```powershell
# Login
curl -X POST http://localhost:8081/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@gvbh.com","password":"password123"}'

# Get today's trips (requires token from login)
curl http://localhost:8082/trips `
  -H "X-Organization-ID: <org-id>" `
  -H "X-User-ID: <user-id>"
```

## Troubleshooting

```powershell
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :8081
netstat -ano | findstr :8082

# Kill a process by PID
taskkill /PID <PID> /F

# Restart PostgreSQL
Restart-Service postgresql*

# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```
