# Script PowerShell pentru verificarea configurației în producție
# Rulează acest script pentru a verifica dacă fix-urile funcționează

Write-Host "🔍 VERIFICARE CONFIGURAȚIE PRODUCȚIE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Verifică site-ul principal
Write-Host "`n🌐 Testez accesibilitatea site-ului..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://lupul-si-corbul.netlify.app" -Method HEAD -UseBasicParsing
    Write-Host "✅ Site principal: ACCESIBIL (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Site principal: NU ESTE ACCESIBIL" -ForegroundColor Red
    Write-Host "   Eroare: $($_.Exception.Message)" -ForegroundColor Red
}

# Testează funcția de debug Netopia (dacă există)
Write-Host "`n💳 Testez configurația Netopia..." -ForegroundColor Yellow
try {
    $netopiaResponse = Invoke-WebRequest -Uri "https://lupul-si-corbul.netlify.app/.netlify/functions/netopia-debug" -UseBasicParsing
    $netopiaData = $netopiaResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Netopia Debug: FUNCȚIONEAZĂ" -ForegroundColor Green
    Write-Host "   Mode: $($netopiaData.netopiaConfig.mode)" -ForegroundColor White
    Write-Host "   Signature: $($netopiaData.environment.NETOPIA_LIVE_SIGNATURE)" -ForegroundColor White
} catch {
    Write-Host "⚠️  Netopia Debug: Nu este disponibil (normal dacă nu ai creat endpoint-ul)" -ForegroundColor Yellow
}

# Testează o comandă de email simulată
Write-Host "`n📧 Testez sistemul de emailuri..." -ForegroundColor Yellow
try {
    $emailPayload = @{
        orderData = @{
            email = "test@example.com"
            firstName = "Test"
            lastName = "User"
            phone = "0123456789"
            address = "Test Address"
            city = "Test City"
            county = "Test County"
        }
        orderNumber = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        totalAmount = 1000
    } | ConvertTo-Json -Depth 3

    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    $emailResponse = Invoke-WebRequest -Uri "https://lupul-si-corbul.netlify.app/.netlify/functions/send-order-email" -Method POST -Body $emailPayload -Headers $headers -UseBasicParsing
    $emailData = $emailResponse.Content | ConvertFrom-Json
    
    if ($emailData.development) {
        Write-Host "⚠️  Sistema de emailuri: ÎN MOD DEZVOLTARE (emailuri simulate)" -ForegroundColor Yellow
        Write-Host "   Fix: Setează SMTP_USER și SMTP_PASS în Netlify" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Sistema de emailuri: FUNCȚIONEAZĂ ÎN PRODUCȚIE" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Test emailuri: EȘUAT" -ForegroundColor Red
    Write-Host "   Eroare: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 CHECKLIST REMEDIERE:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

Write-Host "`n🔧 Pentru emailuri ramburs (URGENT):" -ForegroundColor Yellow
Write-Host "   1. Intră în Netlify Dashboard: https://app.netlify.com/" -ForegroundColor White
Write-Host "   2. Site Settings → Environment Variables" -ForegroundColor White
Write-Host "   3. Adaugă: SMTP_USER = lupulsicorbul@gmail.com" -ForegroundColor White
Write-Host "   4. Adaugă: SMTP_PASS = lraf ziyj xyii ssas" -ForegroundColor White
Write-Host "   5. Trigger deploy nou" -ForegroundColor White

Write-Host "`n💳 Pentru plăți cu cardul (MEDIUM):" -ForegroundColor Yellow
Write-Host "   1. Adaugă: NETOPIA_LIVE_SIGNATURE = 2ZOW-PJ5X-HYYC-IENE-APZO" -ForegroundColor White
Write-Host "   2. Adaugă: VITE_PAYMENT_LIVE_KEY = 2ZOW-PJ5X-HYYC-IENE-APZO" -ForegroundColor White
Write-Host "   3. Pentru credențiale reale: Sună Netopia 021-304-7799" -ForegroundColor White

Write-Host "`n🚀 URMĂTOARELE PAȘI:" -ForegroundColor Green
Write-Host "1. Configurează variabilele în Netlify (5 minute)" -ForegroundColor White
Write-Host "2. Testează o comandă ramburs (verifică inbox-ul)" -ForegroundColor White
Write-Host "3. Testează plata cu cardul (nu ar mai trebui să apară simulare)" -ForegroundColor White

Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "✅ VERIFICARE COMPLETĂ! Urmează pașii de remediere." -ForegroundColor Green
Write-Host "="*50 -ForegroundColor Cyan
