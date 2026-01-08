# Transport Demo - Getting Started Guide
## From Zero to Functional System in 15 Minutes

**Last Updated**: January 8, 2026
**Status**: System is now properly configured and ready to run

---

## 🎯 What You'll Achieve

By the end of this guide, you'll have:
- ✅ A fully functional transport management system
- ✅ Secure authentication
- ✅ Complete trip workflow (create → execute → report → PDF)
- ✅ User-friendly driver interface
- ✅ Admin dashboard for trip management

---

## 📋 Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18.x or higher
   ```

2. **PostgreSQL** (v13 or higher)
   ```bash
   psql --version  # Should be 13.x or higher
   ```

3. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

### System Requirements
- **OS**: macOS, Linux, or Windows with WSL
- **RAM**: Minimum 4GB
- **Disk Space**: 500MB free

---

## 🚀 Quick Start (TL;DR)

If you're experienced, here's the fast track:

```bash
# 1. Database
createdb gvbh_transport
psql gvbh_transport < database/schema.sql  # If exists, otherwise skip

# 2. Backend
cd backend/services/transport-service
npm install
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Access
# Frontend: http://localhost:5173
# Backend API: http://localhost:3003
```

---

## 📖 Detailed Setup Instructions

### Step 1: Database Setup (5 minutes)

#### 1.1 Create Database
```bash
# Create the database
createdb gvbh_transport

# Verify it was created
psql -l | grep gvbh_transport
```

#### 1.2 Configure Database Connection
The backend `.env` file is already configured:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=gvbh_transport
```

**If your PostgreSQL uses different credentials**, update:
```bash
cd backend/services/transport-service
# Edit .env file with your credentials
```

#### 1.3 Initialize Database Schema
The system will automatically create tables on first run (TypeORM synchronize is enabled for development).

**Optional**: Seed demo data:
```bash
cd backend/services/transport-service
node seed-01-core.js
```

---

### Step 2: Backend Setup (3 minutes)

#### 2.1 Install Dependencies
```bash
cd backend/services/transport-service
npm install
```

**Expected output**:
```
added 847 packages in 45s
```

#### 2.2 Verify Environment Configuration
```bash
cat .env
```

**Should contain**:
- ✅ Database credentials
- ✅ JWT_SECRET (already generated)
- ✅ PORT=3003
- ✅ NODE_ENV=development

#### 2.3 Start Backend Server
```bash
npm run dev
```

**Success indicators**:
```
🚀 Transport Service is running on: http://localhost:3003
📚 API: http://localhost:3003/trips
```

**If you see database connection errors**:
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Verify database exists: `psql -l`

---

### Step 3: Frontend Setup (2 minutes)

#### 3.1 Open New Terminal
Keep backend running, open a new terminal window.

#### 3.2 Install Dependencies
```bash
cd frontend
npm install
```

#### 3.3 Verify Environment Configuration
```bash
cat .env
```

**Should contain**:
```env
VITE_API_URL=http://localhost:3003
```

#### 3.4 Start Frontend Server
```bash
npm run dev
```

**Success indicators**:
```
 VITE v5.0.11  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Step 4: First Login & Testing (5 minutes)

#### 4.1 Access the Application
Open your browser:
```
http://localhost:5173
```

#### 4.2 Create First User (If no seed data)
If you didn't seed the database, you'll need to create a user manually:

```bash
# In backend directory
cd backend/services/transport-service
node -e "
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport'
  });

  const password = await bcrypt.hash('admin123', 10);

  // Create organization
  const orgResult = await pool.query(
    'INSERT INTO organizations (name, type) VALUES ($1, $2) RETURNING id',
    ['Great Valley Behavioral Homes', 'PROVIDER']
  );
  const orgId = orgResult.rows[0].id;

  // Create admin user
  const userResult = await pool.query(
    'INSERT INTO users (email, password_hash, first_name, last_name, role, organization_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    ['admin@gvbh.com', password, 'Admin', 'User', 'ADMIN', orgId, true]
  );

  console.log('✅ Admin user created!');
  console.log('Email: admin@gvbh.com');
  console.log('Password: admin123');

  await pool.end();
}

createAdmin().catch(console.error);
"
```

#### 4.3 Login
- Email: `admin@gvbh.com`
- Password: `admin123` (or your seed data credentials)

#### 4.4 Verify System Works
After logging in, you should see:
- ✅ Dashboard with navigation
- ✅ No errors in browser console
- ✅ Backend logs show successful requests

---

## ✅ System Verification Checklist

### Backend Health Check
```bash
# Test API is responding
curl http://localhost:3003/trips

# Should return: [] (empty array) or list of trips
```

### Frontend Health Check
1. Open browser developer tools (F12)
2. Check Console tab - should have no red errors
3. Check Network tab - API calls should return 200 OK

### Database Health Check
```bash
psql gvbh_transport -c "SELECT COUNT(*) FROM users;"
# Should return count of users
```

---

## 🎓 Using the System

### For Drivers

#### 1. Create a Trip
1. Click "Create Trip" or "New Trip"
2. Fill in:
   - Member information
   - Pickup address
   - Dropoff address
   - Scheduled time
3. Click "Create & Assign to Me"

#### 2. Start a Trip
1. Go to "My Trips" or Dashboard
2. Find your trip
3. Click "Start Trip"
4. Complete pre-trip checklist:
   - ✅ Vehicle inspected
   - ✅ Fuel sufficient
   - ✅ Equipment ready
   - ✅ Driver fit to drive
5. Enter starting odometer reading
6. Click "Start Trip"

#### 3. Execute Trip
1. Click "Arrive at Pickup"
2. Confirm member is present
3. Click "Proceed to Dropoff"
4. Click "Arrive at Dropoff"
5. Enter ending odometer reading

#### 4. Complete Trip Report
1. Fill in trip details:
   - Pickup/dropoff times (auto-filled)
   - Trip type (One Way/Round Trip/Multiple Stops)
   - Reason for visit
2. Collect member signature:
   - Click "Review & Sign Document"
   - Have member sign on canvas
   - Click "Adopt Signature"
3. Add driver signature:
   - Click "Sign as Driver"
   - Sign on canvas
   - Click "Adopt Signature"
4. Click "Submit Trip Report"

#### 5. View Trip History
1. Go to "Trip History"
2. See all completed trips
3. Click PDF icon to download trip report
4. View report status (Pending/Verified/Rejected)

---

## 🔧 Troubleshooting

### Backend Won't Start

**Problem**: `Error: CRITICAL: JWT_SECRET environment variable must be set`
**Solution**: JWT_SECRET is already in `.env`, but if you see this:
```bash
cd backend/services/transport-service
echo 'JWT_SECRET=your-secret-key-here' >> .env
npm run dev
```

**Problem**: `ECONNREFUSED localhost:5432`
**Solution**: PostgreSQL not running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Verify
pg_isready
```

**Problem**: `database "gvbh_transport" does not exist`
**Solution**:
```bash
createdb gvbh_transport
```

### Frontend Won't Start

**Problem**: `Cannot find module '@vitejs/plugin-react'`
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `EADDRINUSE: address already in use :::5173`
**Solution**: Port 5173 is taken
```bash
# Find and kill process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

### Cannot Login

**Problem**: `401 Unauthorized`
**Solution**: Check credentials match seeded data
```bash
# Reset admin password
cd backend/services/transport-service
node reset-admin-password.js
```

**Problem**: `Network Error`
**Solution**: Check backend is running on correct port
```bash
# Verify backend
curl http://localhost:3003/trips

# Check frontend .env
cat frontend/.env | grep VITE_API_URL
```

### PDF Generation Fails

**Problem**: `Failed to generate PDF`
**Solution**: Check PDF template exists
```bash
ls frontend/public/*.pdf
# Should list PDF templates

# If missing, re-download from repository
```

**Problem**: Signatures not appearing in PDF
**Solution**: Ensure signatures were collected before submission
- Member signature: Canvas must have drawing
- Driver signature: Canvas must have drawing
- Check browser console for errors

---

## 🎯 Common Development Tasks

### Reset Database
```bash
cd backend/services/transport-service
dropdb gvbh_transport
createdb gvbh_transport
npm run dev  # Will auto-create tables
node seed-01-core.js  # Re-seed data
```

### View Logs
```bash
# Backend logs
cd backend/services/transport-service
tail -f transport_service.log

# Frontend logs (browser console)
# Press F12 in browser, go to Console tab
```

### Run Tests
```bash
# Backend tests (if available)
cd backend/services/transport-service
npm test

# Frontend tests
cd frontend
npm test
```

### Build for Production
```bash
# Backend
cd backend/services/transport-service
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run preview
```

---

## 📊 System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │────────▶│   Frontend   │────────▶│   Backend    │
│  (React)    │         │  (Vite)      │         │  (NestJS)    │
└─────────────┘         └──────────────┘         └──────────────┘
                              :5173                    :3003
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │  PostgreSQL  │
                                                   │  Database    │
                                                   └──────────────┘
```

### Key Components
- **Frontend**: React 18 + TypeScript + Material-UI + React Query
- **Backend**: NestJS + TypeORM + PostgreSQL + PDF-lib
- **Authentication**: JWT-based
- **PDF Generation**: pdf-lib with template filling

---

## 🔐 Security Notes

### Development Mode
- ✅ JWT secret is properly configured
- ✅ Database sync enabled (safe for dev)
- ✅ CORS set to `*` (allows all origins)
- ✅ Detailed error messages

### Before Production
- [ ] Set strong unique JWT_SECRET
- [ ] Set `NODE_ENV=production`
- [ ] Configure specific CORS_ORIGIN
- [ ] Set `synchronize: false` (already done)
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Configure proper logging
- [ ] Set up monitoring

---

## 📞 Getting Help

### Check Documentation
- `API.md` - API endpoints reference
- `IMPLEMENTATION_REPORT.md` - Recent changes
- `SYSTEM_FIX_PLAN.md` - Known issues and fixes

### Common Issues
1. **Port conflicts**: Change ports in `.env` files
2. **Database errors**: Verify PostgreSQL is running
3. **Module not found**: Run `npm install` in affected directory
4. **CORS errors**: Check `CORS_ORIGIN` in backend `.env`

### Debug Mode
Enable detailed logging:
```bash
# Backend
export DEBUG=*

# Frontend
# Set in .env
VITE_ENABLE_DEBUG_LOGS=true
```

---

## 🎉 Success!

If you've followed this guide, you now have:
- ✅ Fully functional transport management system
- ✅ Working authentication
- ✅ Complete trip workflow
- ✅ PDF generation with signatures
- ✅ Trip history and reporting

### Next Steps
1. ✅ Create your first trip
2. ✅ Complete the full workflow
3. ✅ Generate a PDF report
4. ✅ Customize for your needs

### System is Production-Ready When:
- All tests pass
- No console errors
- PDF generation works consistently
- All workflows tested end-to-end
- Security review completed
- Deployment guide followed

---

**Welcome to your Transport Management System!** 🚀

For questions or issues, review the troubleshooting section or check the system fix plan document.
