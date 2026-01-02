# Run all services for development

Write-Host "Starting GVBH Transportation Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgStatus = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if ($pgStatus -and $pgStatus.Status -eq 'Running') {
    Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL is not running. Please start it." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting services in new windows..." -ForegroundColor Yellow
Write-Host ""

# Auth Service
Write-Host "Starting Auth Service (port 8081)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend\services\auth-service'; Write-Host 'Auth Service' -ForegroundColor Green; npm run dev"

# Wait a bit
Start-Sleep -Seconds 2

# Transport Service
Write-Host "Starting Transport Service (port 8082)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend\services\transport-service'; Write-Host 'Transport Service' -ForegroundColor Green; npm run dev"

# Wait a bit
Start-Sleep -Seconds 2

# Frontend
Write-Host "Starting Frontend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "✓ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@gvbh.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop services" -ForegroundColor Gray
