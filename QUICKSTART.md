# GVBH Transportation Platform - Quick Start Guide

## What We've Built So Far

✅ **Complete PostgreSQL database schema** with multi-tenancy  
✅ **NestJS Authentication Service** with JWT  
✅ **User & Organization entities**  
✅ **Login/Register APIs**  
✅ **Role-based access control** (Super Admin, Org Admin, Dispatcher, Driver)  

## Next Steps to Run Locally

### 1. Install PostgreSQL

Download and install PostgreSQL 15+:
- Windows: https://www.postgresql.org/download/windows/
- Use default settings, set password to `postgres`

### 2. Create Database

```sql
-- Open psql or pgAdmin and run:
CREATE DATABASE gvbh_transport;

-- Then run the schema:
\i c:/Users/gvbh2/.gemini/antigravity/scratch/gvt-transport-demo/database/schema.sql
```

### 3. Install Dependencies & Run Auth Service

```bash
cd c:/Users/gvbh2/.gemini/antigravity/scratch/gvt-transport-demo/backend/services/auth-service

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Run the service
npm run dev
```

The auth service will start on **http://localhost:8081**

### 4. Test the API

**Register a user:**
```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@gvbh.com\",
    \"password\": \"password123\",
    \"firstName\": \"Admin\",
    \"lastName\": \"User\",
    \"role\": \"ORG_ADMIN\",
    \"organizationId\": \"<ORG_ID_FROM_DATABASE>\"
  }"
```

**Login:**
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@gvbh.com\",
    \"password\": \"password123\"
  }"
```

You'll get back a JWT token!

## Project Structure

```
gvt-transport-demo/
├── backend/
│   └── services/
│       └── auth-service/        ✅ COMPLETE
│           ├── src/
│           │   ├── entities/    # Database models
│           │   ├── dto/         # Data transfer objects
│           │   ├── guards/      # Auth guards
│           │   ├── strategies/  # JWT strategy
│           │   ├── auth.controller.ts
│           │   ├── auth.service.ts
│           │   ├── auth.module.ts
│           │   └── main.ts
│           └── package.json
├── database/
│   └── schema.sql              ✅ COMPLETE
└── README.md
```

## What's Next?

We can now build:
1. **Transport Service** - Trip management, scheduling, carpool
2. **Member Service** - Client management, Ensora sync
3. **OCR Service** - Appointment card processing
4. **Notification Service** - SMS pickup alerts
5. **Optimization Service** - Carpool suggestions
6. **Web Frontend** - React admin dashboard
7. **Mobile App** - React Native driver app

## Technology  Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT + Passport
- **Frontend**: React + TypeScript (coming next)
- **Mobile**: React Native + Expo (coming next)

Want to continue? We can:
- Build the next microservice
- Create the React web admin interface
- Start the mobile driver app
- Or focus on a specific feature!
