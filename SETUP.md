# GVBH Transportation Platform - Complete Setup Guide

## Prerequisites

Before starting, make sure you have:

1. **PostgreSQL 15+** installed
   - Download: https://www.postgresql.org/download/windows/
   - During installation, set password to `postgres` (or update `.env` files)
   - Default port: 5432

2. **Node.js 18+** installed
   - Download: https://nodejs.org/
   - Verify: `node --version`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

---

## Step-by-Step Setup

### 1. Set Up Database

Open **pgAdmin** or **psql** and run:

```sql
-- Create database
CREATE DATABASE gvbh_transport;

-- Connect to it
\c gvbh_transport

-- Run the schema file
-- In psql: \i 'C:/Users/gvbh2/.gemini/antigravity/scratch/gvt-transport-demo/database/schema.sql'
```

Or using PowerShell:
```powershell
# Navigate to project root
cd C:\Users\gvbh2\.gemini\antigravity\scratch\gvt-transport-demo

# Run schema (replace 'postgres' with your PostgreSQL user if different)
psql -U postgres -d gvbh_transport -f database/schema.sql
```

**Verify it worked:**
```sql
-- Should show tables: organizations, users, members, trips, etc.
\dt
```

---

### 2. Set Up Backend Services

#### Auth Service
```powershell
cd C:\Users\gvbh2\.gemini\antigravity\scratch\gvt-transport-demo\backend\services\auth-service

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Start the service
npm run dev
```

Auth service will run on: **http://localhost:8081**

Keep this terminal open!

#### Transport Service (Open NEW terminal)
```powershell
cd C:\Users\gvbh2\.gemini\antigravity\scratch\gvt-transport-demo\backend\services\transport-service

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Start the service
npm run dev
```

Transport service will run on: **http://localhost:8082**

Keep this terminal open too!

---

### 3. Set Up Frontend (Open NEW terminal)

```powershell
cd C:\Users\gvbh2\.gemini\antigravity\scratch\gvt-transport-demo\frontend

# Install dependencies
npm install

# Install Inter font
npm install @fontsource/inter

# Start the dev server
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

### 4. Create Test User

Since the database is fresh, let's create a test user manually:

**Option 1: Use Auth Service API**

In a new PowerShell window:
```powershell
# Get the organization ID from database first
# In psql: SELECT id FROM organizations;

# Then register a user (replace ORG_ID with actual UUID from database)
curl -X POST http://localhost:8081/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"admin@gvbh.com\",
    \"password\": \"password123\",
    \"firstName\": \"Admin\",
    \"lastName\": \"User\",
    \"role\": \"ORG_ADMIN\",
    \"organizationId\": \"<PUT_ORG_ID_HERE>\"
  }'
```

**Option 2: Insert directly in database**

In psql:
```sql
-- Get organization ID
SELECT id FROM organizations;

-- Insert user (copy the UUID from above)
INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, is_active)
VALUES (
  '<ORG_ID_FROM_ABOVE>',
  'admin@gvbh.com',
  '$2b$10$rGfXvL5h5y5DZqQH5Zc5Ce5kZ5YzH5r5H5L5h5y5DZqQH5Zc5Ce5k', -- password123
  'Admin',
  'User',
  'ORG_ADMIN',
  true
);
```

---

### 5. Access the Application

Open your browser and go to:

**http://localhost:3000**

Login with:
- **Email**: admin@gvbh.com
- **Password**: password123

---

## Quick Start (After Initial Setup)

Once everything is installed, you only need to run 3 commands in 3 separate terminals:

**Terminal 1 - Auth Service:**
```powershell
cd C:\Users\gvbh2\.gemini\antigravity\scratch\gvt-transport-demo\backend\services\auth-service
npm run dev
```

**Terminal 2 - Transport Service:**
```powershell
cd C:\Users\gvbh2\.gemini\antigravity\scratch\gvt-transport-demo\backend\services\transport-service
npm run dev
```

**Terminal 3 - Frontend:**
```powershell
cd C:\Users\gvbh2\.gemini\antigravity\scratch\gvt-transport-demo\frontend
npm run dev
```

---

## Troubleshooting

### "Cannot find module" errors
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Database connection errors
- Make sure PostgreSQL is running (check Services in Windows)
- Verify credentials in `.env` files
- Check port 5432 is not blocked

### Port already in use
```powershell
# Find what's using the port
netstat -ano | findstr :8081

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Frontend can't connect to backend
- Make sure all 3 services are running
- Check browser console for errors (F12)
- Verify proxy settings in `vite.config.ts`

---

## What's Running?

When everything is set up correctly, you should have:

✅ **PostgreSQL** - Database on port 5432  
✅ **Auth Service** - http://localhost:8081  
✅ **Transport Service** - http://localhost:8082  
✅ **Frontend** - http://localhost:3000  

You can test the backend directly:

```powershell
# Test auth service
curl http://localhost:8081/auth/validate

# Test transport service  
curl http://localhost:8082/trips
```

---

## Next Steps

Once logged in, you can:
1. View the dashboard
2. Create trips
3. Manage vehicles
4. (Coming soon: Mobile driver app)

Need help? Check the console logs in each terminal window for errors.
