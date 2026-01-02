# GVBH Platform - Diagnostic Check
Write-Host "=== GVBH Transportation Platform - System Check ===" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

# Check 1: Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
    if ($nodeVersion -notmatch "v1[89]|v2[0-9]") {
        $warnings += "Node.js version should be 18+. Current: $nodeVersion"
    }
} catch {
    $issues += "Node.js is not installed or not in PATH"
    Write-Host "✗ Node.js not found" -ForegroundColor Red
}

# Check 2: npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    $issues += "npm is not installed or not in PATH"
    Write-Host "✗ npm not found" -ForegroundColor Red
}

# Check 3: PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name postgresql* -ErrorAction Stop
    if ($pgService.Status -eq 'Running') {
        Write-Host "✓ PostgreSQL service is running" -ForegroundColor Green
    } else {
        $issues += "PostgreSQL service is installed but not running"
        Write-Host "✗ PostgreSQL not running" -ForegroundColor Red
    }
} catch {
    $issues += "PostgreSQL is not installed or service not found"
    Write-Host "✗ PostgreSQL not found" -ForegroundColor Red
}

# Check 4: Database exists
Write-Host "Checking database..." -ForegroundColor Yellow
try {
    $dbCheck = psql -U postgres -lqt 2>$null | Select-String -Pattern "gvbh_transport"
    if ($dbCheck) {
        Write-Host "✓ Database 'gvbh_transport' exists" -ForegroundColor Green
    } else {
        $warnings += "Database 'gvbh_transport' not found"
        Write-Host "⚠ Database not created yet" -ForegroundColor Yellow
    }
} catch {
    $warnings += "Could not check database (psql might not be in PATH)"
    Write-Host "⚠ Cannot verify database" -ForegroundColor Yellow
}

# Check 5: Auth service dependencies
Write-Host "Checking Auth Service..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\backend\services\auth-service\node_modules") {
    Write-Host "✓ Auth service dependencies installed" -ForegroundColor Green
} else {
    $warnings += "Auth service dependencies not installed (need to run npm install)"
    Write-Host "⚠ Auth service needs: npm install" -ForegroundColor Yellow
}

# Check 6: Transport service dependencies
Write-Host "Checking Transport Service..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\backend\services\transport-service\node_modules") {
    Write-Host "✓ Transport service dependencies installed" -ForegroundColor Green
} else {
    $warnings += "Transport service dependencies not installed (need to run npm install)"
    Write-Host "⚠ Transport service needs: npm install" -ForegroundColor Yellow
}

# Check 7: Frontend dependencies
Write-Host "Checking Frontend..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\frontend\node_modules") {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    $warnings += "Frontend dependencies not installed (need to run npm install)"
    Write-Host "⚠ Frontend needs: npm install" -ForegroundColor Yellow
}

# Check 8: Ports availability
Write-Host "Checking ports..." -ForegroundColor Yellow
$ports = @(3000, 8081, 8082)
foreach ($port in $ports) {
    $portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portInUse) {
        $warnings += "Port $port is already in use"
        Write-Host "⚠ Port $port in use" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Port $port available" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✓ All checks passed! You're ready to run the platform." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Run .\start-dev.ps1" -ForegroundColor White
} else {
    if ($issues.Count -gt 0) {
        Write-Host ""
        Write-Host "CRITICAL ISSUES (must fix):" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  ✗ $issue" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "WARNINGS (should fix):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  ⚠ $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "=== Recommended Actions ===" -ForegroundColor Cyan
    
    if ($issues -match "Node.js") {
        Write-Host "1. Install Node.js from: https://nodejs.org/" -ForegroundColor White
    }
    
    if ($issues -match "PostgreSQL") {
        Write-Host "2. Install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    }
    
    if ($warnings -match "Database") {
        Write-Host "3. Create database:" -ForegroundColor White
        Write-Host "   psql -U postgres -c `"CREATE DATABASE gvbh_transport;`"" -ForegroundColor Gray
        Write-Host "   psql -U postgres -d gvbh_transport -f database/schema.sql" -ForegroundColor Gray
        Write-Host "   psql -U postgres -d gvbh_transport -f database/test-data.sql" -ForegroundColor Gray
    }
    
    if ($warnings -match "dependencies") {
        Write-Host "4. Install dependencies:" -ForegroundColor White
        Write-Host "   cd backend/services/auth-service && npm install" -ForegroundColor Gray
        Write-Host "   cd ../transport-service && npm install" -ForegroundColor Gray
        Write-Host "   cd ../../../frontend && npm install" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
