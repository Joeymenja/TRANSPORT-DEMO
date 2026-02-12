# Run all services for development (Mobile Access)
Write-Host "Starting..."
$ip = (Test-Connection -ComputerName (hostname) -Count 1).IPV4Address.IPAddressToString

Write-Host "Detected IP: $ip"

# Update new-ui .env
Write-Host "Updating frontend configuration..."
$envContent = "VITE_AUTH_URL=http://${ip}:8081`r`nVITE_TRANSPORT_URL=http://${ip}:8082"
Set-Content -Path "$PSScriptRoot\new-ui\.env" -Value $envContent
Write-Host "Updated new-ui/.env with current IP"

Write-Host "Starting Auth Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend\services\auth-service'; npm run dev"
Start-Sleep -Seconds 2

Write-Host "Starting Transport Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend\services\transport-service'; npm run dev"
Start-Sleep -Seconds 2

Write-Host "Starting New UI..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\new-ui'; npm run dev"

Write-Host ""
Write-Host "---------------------------------------------------"
Write-Host "Access on phone: http://${ip}:5173"
Write-Host "---------------------------------------------------"
Write-Host ""
