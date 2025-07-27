# NETOPIA Live Credentials Setup Script
# Configures Netlify environment variables for NETOPIA Live payments

Write-Host "🚀 Configurare NETOPIA LIVE Credentials pentru Netlify..." -ForegroundColor Green

# Check if Netlify CLI is installed
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI detectat: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI nu este instalat. Instaleaza cu: npm install -g netlify-cli" -ForegroundColor Red
    exit 1
}

# Check if logged into Netlify and linked to project
try {
    $currentUser = netlify status
    Write-Host "✅ Conectat la Netlify si proiect linkat" -ForegroundColor Green
} catch {
    Write-Host "❌ Nu esti logat in Netlify sau proiectul nu este linkat." -ForegroundColor Red
    Write-Host "   Ruleaza: netlify login si apoi netlify link" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Configurare variabile NETOPIA LIVE..." -ForegroundColor Yellow

# NETOPIA Live Signature
Write-Host "   → Setare NETOPIA_LIVE_SIGNATURE..." -ForegroundColor Cyan
netlify env:set NETOPIA_LIVE_SIGNATURE "2ZOW-PJ5X-HYYC-IENE-APZO"

# NETOPIA Live Public Key
Write-Host "   → Setare NETOPIA_LIVE_PUBLIC_KEY..." -ForegroundColor Cyan  
netlify env:set NETOPIA_LIVE_PUBLIC_KEY "2ZOW-PJ5X-HYYC-IENE-APZO"

# NETOPIA Live Private Key - using temporary file approach
Write-Host "   → Setare NETOPIA_LIVE_PRIVATE_KEY..." -ForegroundColor Cyan
$privateKeyContent = @'
-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDgvgno9K9M465g14CoKE0aIvKbSqwE3EvKm6NIcVO0ZQ7za08v
Xbe508JPioYoTRM2WN7CQTQQgupiRKtyPykE3lxpCMmLqLzpcsq0wm3o9tvCnB8W
zbA2lpDre+EDcylPVyulZhrWn1Vf9sbJcFZREwMgYWewVVLwkTen92Qm5wIDAQAB
AoGAS1/xOuw1jvgdl+UvBTbfBRELhQG6R7cKxF0GmllH1Yy/QuyOljg8UlqvJLY0
4HdZJjUQIN51c8Q0j9iwF5UPUC3MgR0eQ70iislu6LGPnTnIJgbCs4QSWY/fjo08
DgTh3uDUO4bIsIFKvGbVwd86kjTARldnQ4RonKwYkv1xDIECQQDtZg9onk7gcE31
Z2QAEaUfloffY7vst4u+QUm6vZoQ+Eu4ohX3qciwN1daP5qd290OAEngOa8dtzDK
/+tgbsU3AkEA8lobdWiVZkB+1q1Rl6LEOHuxXMyQ42s1L1L1Owc8Ftw6JGT8FewZ
4lCD3U56MJSebCCqKCG32GGkO47R50aD0QJAIlnRQvcdPLajYS4btzLWbNKwSG+7
Ao6whtAVphLHV0tGUaoKebK0mmL3ndR0QAFPZDZAelR+dVNLmSQc3/BHUwJAOw1r
vWsTZEv43BR1Wi6GA4FYUVVjRJbd6b8cFBsKMEPPQwj8R9c042ldCDLUITxFcfFv
pMG6i1YXb4+4Y9NR0QJBANt0qlS2GsS9S79eWhPkAnw5qxDcOEQeekk5z5jil7yw
7J0yOEdf46C89U56v2zORfS5Due8YEYgSMRxXdY0/As=
-----END RSA PRIVATE KEY-----
'@
$tempPrivateKey = New-TemporaryFile
$privateKeyContent | Out-File -FilePath $tempPrivateKey.FullName -Encoding UTF8
& netlify env:set NETOPIA_LIVE_PRIVATE_KEY --from-file $tempPrivateKey.FullName
Remove-Item $tempPrivateKey.FullName

# NETOPIA Live Certificate - using temporary file approach  
Write-Host "   → Setare NETOPIA_LIVE_CERTIFICATE..." -ForegroundColor Cyan
$certificateContent = @'
-----BEGIN CERTIFICATE-----
MIIC3zCCAkigAwIBAgIBATANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCUk8x
EjAQBgNVBAgTCUJ1Y2hhcmVzdDESMBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQK
EwdORVRPUElBMSEwHwYDVQQLExhORVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAa
BgNVBAMTE25ldG9waWEtcGF5bWVudHMucm8wHhcNMjUwNzEzMTI0ODM0WhcNMzUw
NzExMTI0ODM0WjCBiDELMAkGA1UEBhMCUk8xEjAQBgNVBAgTCUJ1Y2hhcmVzdDES
MBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQKEwdORVRPUElBMSEwHwYDVQQLExhO
RVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAaBgNVBAMTE25ldG9waWEtcGF5bWVu
dHMucm8wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBALwh0/NhEpZFuKvghZ9N
75CXba05MWNCh422kcfFKbqP5YViCUBg3Mc5ZYd1e0Xi9Ui1QI2Z/jvvchrDZGQw
jarApr3S9bowHEkZH81ZolOoPHBZbYpA28BIyHYRcaTXjLtiBGvjpwuzljmXeBoV
LinIaE0IUpMen9MLWG2fGMddAgMBAAGjVzBVMA4GA1UdDwEB/wQEAwIFoDATBgNV
HSUEDDAKBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9yXCh
MGxzUzQflmkXT1oyIBoetTANBgkqhkiG9w0BAQsFAAOBgQAMnh95YlI+y3XcxrpG
gNWC9AwVBt61MTid213yuXDGxkouizSGFr1MjP1tk/YkcWdNka9QB3AtCr4bMers
/2f322soXcrhAOhj5JPVQkF6rlhJxg2JBO+8M5sOJTaxq5YvFHl/o2GGg0UuxWb5
RbUx6W/CU+uFDgDY8CdZ3hZ7kg==
-----END CERTIFICATE-----
'@
$tempCertificate = New-TemporaryFile
$certificateContent | Out-File -FilePath $tempCertificate.FullName -Encoding UTF8
& netlify env:set NETOPIA_LIVE_CERTIFICATE --from-file $tempCertificate.FullName
Remove-Item $tempCertificate.FullName

# Frontend Environment Variables
Write-Host "   → Setare VITE_PAYMENT_LIVE_KEY..." -ForegroundColor Cyan
netlify env:set VITE_PAYMENT_LIVE_KEY "2ZOW-PJ5X-HYYC-IENE-APZO"

# Production mode flag
Write-Host "   → Setare NETOPIA_PRODUCTION_MODE..." -ForegroundColor Cyan
netlify env:set NETOPIA_PRODUCTION_MODE "true"

Write-Host "`n✅ Configurare completa! Variabilele NETOPIA LIVE au fost setate." -ForegroundColor Green
Write-Host "📝 Variabile configurate:" -ForegroundColor Yellow
Write-Host "   • NETOPIA_LIVE_SIGNATURE" -ForegroundColor White
Write-Host "   • NETOPIA_LIVE_PUBLIC_KEY" -ForegroundColor White  
Write-Host "   • NETOPIA_LIVE_PRIVATE_KEY" -ForegroundColor White
Write-Host "   • NETOPIA_LIVE_CERTIFICATE" -ForegroundColor White
Write-Host "   • VITE_PAYMENT_LIVE_KEY" -ForegroundColor White
Write-Host "   • NETOPIA_PRODUCTION_MODE" -ForegroundColor White

Write-Host "`n🔄 Pentru a aplica modificarile, redeploy site-ul cu:" -ForegroundColor Cyan
Write-Host "   netlify deploy --prod" -ForegroundColor White

Write-Host "`n🔍 Pentru a verifica variabilele setate:" -ForegroundColor Cyan
Write-Host "   netlify env:list" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT: Credentialele LIVE sunt acum active!" -ForegroundColor Red
Write-Host "   Sistemul va procesa plati reale in productie." -ForegroundColor Red
