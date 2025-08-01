#!/usr/bin/env pwsh

# 🚀 FIX URGENT: NETOPIA PRODUCTION MODE
Write-Host "🔧 FIXING NETOPIA PRODUCTION ISSUES..." -ForegroundColor Cyan

# Verifică și corectează configurația NETOPIA în Netlify
Write-Host "`n📋 Verificăm configurația actuală..." -ForegroundColor Yellow

# Setează credentialele corecte (fără prefix live.)
Write-Host "🔑 Setăm credentialele NETOPIA corecte..." -ForegroundColor Green

# Credențialele NETOPIA corecte pentru producție
netlify env:set NETOPIA_LIVE_SIGNATURE "2ZOW-PJ5X-HYYC-IENE-APZO"
netlify env:set NETOPIA_LIVE_PUBLIC_KEY "2ZOW-PJ5X-HYYC-IENE-APZO"
netlify env:set NETOPIA_LIVE_API_KEY "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt"
netlify env:set VITE_PAYMENT_LIVE_KEY "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt"
netlify env:set VITE_NETOPIA_SIGNATURE_LIVE "2ZOW-PJ5X-HYYC-IENE-APZO"
netlify env:set VITE_NETOPIA_PUBLIC_KEY "2ZOW-PJ5X-HYYC-IENE-APZO"

# Setează flagurile de producție
netlify env:set NETOPIA_PRODUCTION_MODE "true"
netlify env:set MODE "production"

# Setează SMTP pentru emailuri
Write-Host "📧 Setăm configurația SMTP pentru emailuri..." -ForegroundColor Green
netlify env:set SMTP_USER "lupulsicorbul@gmail.com"
netlify env:set SMTP_PASS "lraf ziyj xyii ssas"

Write-Host "`n✅ CONFIGURAȚIA A FOST ACTUALIZATĂ!" -ForegroundColor Green
Write-Host "📝 Următorii pași:" -ForegroundColor Cyan
Write-Host "   1. Redeploy aplicația: netlify deploy --prod" -ForegroundColor White
Write-Host "   2. Testează plățile pe site-ul live" -ForegroundColor White
Write-Host "   3. Verifică emailurile de confirmare" -ForegroundColor White

Write-Host "`n🎯 URL de test: https://lupulsicorbul.com" -ForegroundColor Magenta
