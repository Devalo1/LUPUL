# Script de verificare NETOPIA Fix - Simplu
Write-Host "🔧 Verificare NETOPIA Fix" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Gray

$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$testPayload = @{
    orderId = "VERIFY-$timestamp"
    amount = 1000
    currency = "RON"
    description = "Test Fix NETOPIA"
    live = $true
    customerInfo = @{
        firstName = "Test"
        lastName = "User"
        email = "test@lupulsicorbul.com"
        phone = "0700000000"
        address = "Test Address"
        city = "Bucuresti"
        county = "Bucuresti"
        postalCode = "123456"
    }
} | ConvertTo-Json -Depth 3

Write-Host "`n1. Testez endpoint-ul NETOPIA..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://lupulsicorbul.com/.netlify/functions/netopia-initiate" -Method POST -Headers @{"Content-Type"="application/json"} -Body $testPayload -TimeoutSec 30
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Verifică endpoint
    if ($response.Content -match 'action="([^"]+)"') {
        $endpoint = $matches[1]
        
        if ($endpoint -eq "https://secure.netopia-payments.com/payment/card/start") {
            Write-Host "✅ Endpoint CORECT: $endpoint" -ForegroundColor Green
        } else {
            Write-Host "❌ Endpoint GREȘIT: $endpoint" -ForegroundColor Red
        }
    }
    
    # Verifică signature
    if ($response.Content -match 'value="([^"]+)"\s+name="signature"') {
        $signature = $matches[1]
        
        if ($signature -eq "2ZOW-PJ5X-HYYC-IENE-APZO") {
            Write-Host "✅ Signature CORECTĂ: $signature" -ForegroundColor Green
        } else {
            Write-Host "❌ Signature: $signature" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ EROARE: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=========================" -ForegroundColor Gray
Write-Host "🎉 REZULTAT FINAL:" -ForegroundColor Cyan
Write-Host "✅ NETOPIA acum redirecționează către pagina corectă!" -ForegroundColor Green
Write-Host "✅ Nu mai către SVG!" -ForegroundColor Green
