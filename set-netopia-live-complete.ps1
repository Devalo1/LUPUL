# Script pentru setarea credențialelor NETOPIA complete în Netlify
Write-Host "🔧 Configurare NETOPIA LIVE cu credențiale reale..." -ForegroundColor Cyan

# Citesc certificatul din fișier
Write-Host "Citesc certificatul public..." -ForegroundColor Yellow
$publicCert = Get-Content "d:\LUPUL\live.2ZOW-PJ5X-HYYC-IENE-APZO.public.cer" -Raw

# Citesc cheia privată din fișier  
Write-Host "Citesc cheia privată..." -ForegroundColor Yellow
$privateKey = Get-Content "d:\LUPUL\my-typescript-app\temp-private.key" -Raw

Write-Host "1. Setez NETOPIA_LIVE_CERTIFICATE..." -ForegroundColor Yellow
netlify env:set NETOPIA_LIVE_CERTIFICATE $publicCert --force

Write-Host "2. Setez NETOPIA_LIVE_PRIVATE_KEY..." -ForegroundColor Yellow  
netlify env:set NETOPIA_LIVE_PRIVATE_KEY $privateKey --force

Write-Host "3. Setez NETOPIA_LIVE_PUBLIC_KEY (pentru frontend)..." -ForegroundColor Yellow
netlify env:set NETOPIA_LIVE_PUBLIC_KEY $publicCert --force

Write-Host "4. Actualizez signature-ul..." -ForegroundColor Yellow
netlify env:set VITE_NETOPIA_SIGNATURE_LIVE "live.2ZOW-PJ5X-HYYC-IENE-APZO" --force

Write-Host "✅ Credențiale NETOPIA LIVE configurate complet!" -ForegroundColor Green
Write-Host "Următorul pas: npm run build si netlify deploy --prod" -ForegroundColor Cyan
