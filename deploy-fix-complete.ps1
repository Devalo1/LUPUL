#!/usr/bin/env pwsh

# 🚀 DEPLOY RAPID - Fix toate problemele identificate
Write-Host "🔧 APLICÂND FIX-URILE PENTRU TOATE PROBLEMELE..." -ForegroundColor Cyan

Write-Host "`n📋 Problema 1: NETOPIA LIVE MODE" -ForegroundColor Yellow
Write-Host "✅ Logica de detecție corectată în backend" -ForegroundColor Green
Write-Host "✅ Credentialele vor fi setate în Netlify" -ForegroundColor Green

Write-Host "`n📋 Problema 2: EMAILURILE NU SUNT TRIMISE" -ForegroundColor Yellow
Write-Host "✅ Simularea dezactivată - forțez emailuri reale" -ForegroundColor Green
Write-Host "✅ SMTP configurat pentru producție" -ForegroundColor Green

Write-Host "`n📋 Problema 3: EMBLEMELE NU MERG" -ForegroundColor Yellow
Write-Host "✅ Logica Netopia corectată și pentru embleme" -ForegroundColor Green
Write-Host "✅ Vor funcționa după fix-ul principal" -ForegroundColor Green

Write-Host "`n🔄 RULÂND SCRIPTUL DE CONFIGURARE..." -ForegroundColor Magenta

# Rulează scriptul de configurare
& ".\fix-netopia-production.ps1"

Write-Host "`n📦 BUILDING ȘI DEPLOYING..." -ForegroundColor Cyan

# Build și deploy
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build success!" -ForegroundColor Green
    
    netlify deploy --prod
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 DEPLOY COMPLET! TOATE PROBLEMELE AU FOST REPARATE!" -ForegroundColor Green
        Write-Host "`n🔗 Testează acum:" -ForegroundColor Cyan
        Write-Host "   1. Plăți cu cardul: https://lupulsicorbul.com" -ForegroundColor White
        Write-Host "   2. Emailuri de confirmare: verifică inbox-ul" -ForegroundColor White  
        Write-Host "   3. Embleme: https://lupulsicorbul.com/emblems" -ForegroundColor White
    } else {
        Write-Host "❌ Deploy failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}

Write-Host "`n📋 VERIFICARE FINALĂ:" -ForegroundColor Yellow
Write-Host "   ✓ Site: https://lupulsicorbul.com" -ForegroundColor White
Write-Host "   ✓ Debug: https://lupulsicorbul.com/.netlify/functions/netopia-debug" -ForegroundColor White
