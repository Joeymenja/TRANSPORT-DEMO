# Run checks for index.css
Write-Host "Checking for index.css..."
if (!(Test-Path "$PSScriptRoot\new-ui\index.css")) {
    Write-Host "Creating missing index.css..."
    "@tailwind base;`n@tailwind components;`n@tailwind utilities;" | Out-File "$PSScriptRoot\new-ui\index.css" -Encoding utf8
}

Write-Host "Opening Firewall Ports..." -ForegroundColor Cyan

# Define ports to open
$ports = @(3000, 5173, 8080, 8081, 8082, 5432)

foreach ($port in $ports) {
    $ruleName = "GVBH-Transport-Allow-$port"
    
    # Check if rule exists
    $exists = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    
    if ($exists) {
        Write-Host "Rule for port $port already exists." -ForegroundColor Gray
    }
    else {
        Write-Host "Creating rule for port $port..." -ForegroundColor Green
        New-NetFirewallRule -DisplayName $ruleName `
            -Direction Inbound `
            -LocalPort $port `
            -Protocol TCP `
            -Action Allow `
            -Profile Any
    }
}

Write-Host ""
Write-Host "Firewall rules updated successfully!" -ForegroundColor Green
Write-Host "Please restart your application via start-dev-mobile.ps1" -ForegroundColor Yellow
