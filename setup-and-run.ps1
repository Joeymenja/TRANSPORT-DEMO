# One-Click Setup - Installs everything and starts services

Write-Host "=== GVBH Transportation Platform - Auto Setup ===" -ForegroundColor Cyan
Write-Host ""

$env:Path += ";C:\Program Files\nodejs"
$ErrorActionPreference = "Stop"

# Step 1: Install Auth Service
Write-Host "[1/6] Installing Auth Service dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend\services\auth-service"
if (-not (Test-Path "node_modules")) {
    npm install
}
else {
    Write-Host "  Already installed, skipping..." -ForegroundColor Gray
}
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  Created .env file" -ForegroundColor Green
}

# Step 2: Install Transport Service
Write-Host "[2/6] Installing Transport Service dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend\services\transport-service"
if (-not (Test-Path "node_modules")) {
    npm install
}
else {
    Write-Host "  Already installed, skipping..." -ForegroundColor Gray
}
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  Created .env file" -ForegroundColor Green
}

# Step 3: Install Frontend
Write-Host "[3/6] Installing Frontend dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"
if (-not (Test-Path "node_modules")) {
    npm install
}
else {
    Write-Host "  Already installed, skipping..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "✓ Installation complete!" -ForegroundColor Green
Write-Host ""

# Step 4: Check database
Write-Host "[4/6] Checking database..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
try {
    $dbCheck = psql -U postgres -lqt 2>$null | Select-String -Pattern "gvbh_transport"
    if ($dbCheck) {
        Write-Host "  ✓ Database exists" -ForegroundColor Green
    }
    else {
        Write-Host "  Creating database..." -ForegroundColor Yellow
        psql -U postgres -c "CREATE DATABASE gvbh_transport;"
        psql -U postgres -d gvbh_transport -f "database/schema.sql"
        psql -U postgres -d gvbh_transport -f "database/test-data.sql"
        Write-Host "  ✓ Database created with test data" -ForegroundColor Green
    }
}
catch {
    Write-Host "  ⚠ Could not check/create database automatically." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/6] Starting services in separate windows..." -ForegroundColor Yellow

# Start Auth Service in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path += ';C:\Program Files\nodejs'; cd '$PSScriptRoot\backend\services\auth-service'; npm run dev"
Start-Sleep -Seconds 3

# Start Transport Service in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path += ';C:\Program Files\nodejs'; cd '$PSScriptRoot\backend\services\transport-service'; npm run dev"
Start-Sleep -Seconds 3

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path += ';C:\Program Files\nodejs'; cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "=== ✓ SETUP COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "A browser window will open shortly..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Start-Process "http://localhost:3000"
