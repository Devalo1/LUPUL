#!/usr/bin/env pwsh

Write-Host "Configurare NETOPIA LIVE pentru Netlify" -ForegroundColor Green

# Simple variables first
netlify env:set NETOPIA_LIVE_SIGNATURE "2ZOW-PJ5X-HYYC-IENE-APZO"
netlify env:set NETOPIA_LIVE_PUBLIC_KEY "2ZOW-PJ5X-HYYC-IENE-APZO"
netlify env:set VITE_PAYMENT_LIVE_KEY "2ZOW-PJ5X-HYYC-IENE-APZO"
netlify env:set NETOPIA_PRODUCTION_MODE "true"

Write-Host "Variabile simple configurate. Pentru Private Key si Certificate, foloseste Netlify Dashboard." -ForegroundColor Yellow
Write-Host "Mergi la: https://app.netlify.com/projects/lupulsicorbul" -ForegroundColor Cyan
Write-Host "Site settings -> Environment variables -> Add variable" -ForegroundColor Cyan

Write-Host "Variabile de adaugat manual:" -ForegroundColor Yellow
Write-Host "NETOPIA_LIVE_PRIVATE_KEY - continutul din netopia-live-credentials.env" -ForegroundColor White
Write-Host "NETOPIA_LIVE_CERTIFICATE - continutul din netopia-live-credentials.env" -ForegroundColor White

netlify env:list
